import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  get,
  remove,
} from "firebase/database";
import { auth } from "@/Config/firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ListNameInterface, RenderListProps } from "@/interfaces/types";
import { COLORS, FONT_SIZE } from "@/constants/theme";
import { onAuthStateChanged } from "firebase/auth";
import ModalAddList from "@/components/modalNameList";
import {
  handleSendNotification,
  requestNotificationPermission,
} from "@/utils/notification";
import { getNumberOfColumns, getWithItemList } from "@/utils/reponsive";
import createShareCode from "@/utils/shareCode";
import ModalShareSpace from "@/components/modalShareSpace";

export default function Home() {
  const [myLists, setMyLists] = useState<ListNameInterface[]>([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalEditShareVisible, setModalEditShareVisible] = useState(false);
  const [modalShareVisible, setModalShareVisible] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [listId, setListId] = useState("");
  const [user, setUser] = useState(auth.currentUser);
  const [numColumns, setNumColumns] = useState(2);
  const withScreen = Dimensions.get("window").width;
  const [withItemList, setWithItemList] = useState("48%") as any;
  const [sharedLists, setSharedLists] = useState<ListNameInterface[]>([]);

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Home";
    }
    requestNotificationPermission();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const adjustColumns = () => {
      setNumColumns(getNumberOfColumns(withScreen));
    };

    const adjustItemList = () => {
      setWithItemList(getWithItemList(withScreen));
    };

    adjustColumns();
    adjustItemList();

    const subscribe = Dimensions.addEventListener("change", ({ window }) => {
      setNumColumns(getNumberOfColumns(window.width));

      setWithItemList(getWithItemList(window.width));
    });

    return () => {
      subscribe.remove();
    };
  }, [withScreen]);

  // Fetch data from Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const reference = ref(db, "lists"); // Reference to the 'lists' node in your Realtime Database

    const unsubscribe = onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lists = Object.keys(data)
          .filter((key) => data[key].userId === user?.uid) // Filter by userId
          .map((key) => ({ id: key, name: data[key].name })); // Get listId and name
        setMyLists(lists);
      } else {
        setMyLists([]);
      }
    });

    // Fetch shared spaces
    const sharedSpaceRef = ref(db, "shareSpaces");
    const sharedSpaceUnsubscribe = onValue(sharedSpaceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lists = Object.keys(data)
          .filter((key) => {
            const shareSpace = data[key];
            return (
              shareSpace.userId === user?.uid ||
              (shareSpace.members && shareSpace.members[user?.uid as string])
            );
          })
          .map((key) => ({ id: key, name: data[key].name }));
        setSharedLists(lists);
      } else {
        setSharedLists([]);
      }
    });

    // Cleanup listener when component unmounts or when the effect re-runs
    return () => {
      unsubscribe();
      sharedSpaceUnsubscribe();
    };
  }, [user]);

  const addNewList = async () => {
    if (!newListName.trim()) {
      Alert.alert("Validation Error", "List name cannot be empty.");
      return;
    }

    const db = getDatabase();
    const listsRef = ref(db, "lists");
    const newListRef = push(listsRef);

    try {
      await set(newListRef, {
        id: newListRef.key,
        userId: user?.uid,
        name: newListName,
      });

      console.log("List added!");
      setModalVisible(false);
      setNewListName("");
    } catch (error) {
      console.error("Error adding list: ", error);
      Alert.alert("Error", "Failed to add the list.");
    }
  };

  const updateListName = async (listId: string, newName: string) => {
    const db = getDatabase();
    const listRef = ref(db, `lists/${listId}`);

    try {
      await update(listRef, { name: newName });
      console.log("List name updated!");
      setModalEditVisible(false);
      setNewListName("");
    } catch (error) {
      console.error("Error updating list name: ", error);
      Alert.alert("Error", "Failed to update the list name.");
    }
  };

  const updateShareName = async (listId: string, newName: string) => {
    const db = getDatabase();
    const listRef = ref(db, `shareSpaces/${listId}`);

    try {
      const memberRef = ref(db, `shareSpaces/${listId}/members/${user?.uid}`);
      const memberSnapshot = await get(memberRef);
      const memberData = memberSnapshot.val();

      if (memberData.role !== "owner") {
        setModalEditShareVisible(false);
        setNewListName("");
        Alert.alert("Error", "Only the owner can update the share space name");

        throw new Error("Only the owner can update the share space name");
      }

      await update(listRef, { name: newName });
      setModalEditShareVisible(false);
      setNewListName("");
    } catch (error) {
      Alert.alert("Error", "Failed to update the list name.");
    }
  };

  const deleteList = async (listId: string) => {
    const db = getDatabase();
    const listRef = ref(db, `lists/${listId}`);

    try {
      await remove(listRef);

      const tasksRef = ref(db, `tasks/`);
      const tasksSnapshot = await get(tasksRef);
      const tasksData = tasksSnapshot.val() as { [key: string]: any };

      const tasksToDelete = Object.keys(tasksData).filter(
        (taskId) => tasksData[taskId].listId === listId
      );

      await Promise.all(
        tasksToDelete.map((taskId) => remove(ref(db, `tasks/${taskId}`)))
      );

      setModalEditVisible(false);
      setNewListName("");
    } catch (error) {
      console.error("Error deleting list: ", error);
    }
  };

  const deleteShareSpace = async (listId: string) => {
    const db = getDatabase();
    const listRef = ref(db, `shareSpaces/${listId}`);

    // check if user is the owner
    const memberRef = ref(db, `shareSpaces/${listId}/members/${user?.uid}`);
    const memberSnapshot = await get(memberRef);
    const memberData = memberSnapshot.val();

    if (memberData.role === "owner") {
      try {
        await remove(listRef);

        const tasksRef = ref(db, `tasks/`);
        const tasksSnapshot = await get(tasksRef);
        const tasksData = tasksSnapshot.val() as { [key: string]: any };

        const tasksToDelete = Object.keys(tasksData).filter(
          (taskId) => tasksData[taskId].listId === listId
        );

        await Promise.all(
          tasksToDelete.map((taskId) => remove(ref(db, `tasks/${taskId}`)))
        );

        setModalEditShareVisible(false);
        setNewListName("");
      } catch (error) {
        console.error("Error deleting list: ", error);
      }
    } else {
      Alert.alert("Error", "Only the owner can delete the share space");
    }
  };

  const handleListPress = (listId: string) => {
    router.push({
      pathname: "/(task)/task",
      params: { listId }, // Passing query parameters
    });
  };

  const handleListLongPress = (listId: string) => {
    setNewListName(myLists.find((list) => list.id === listId)?.name || "");
    setListId(listId);
    setModalEditVisible(true);
  };

  const handleShareSpaceLongPress = async (listId: string) => {
    if (await checkIfOwner(listId)) {
      setNewListName(
        sharedLists.find((list) => list.id === listId)?.name || ""
      );
      setListId(listId);
      setModalEditShareVisible(true);
    }
  };

  const checkIfOwner = async (listId: string): Promise<boolean> => {
    const db = getDatabase();
    const memberRef = ref(db, `shareSpaces/${listId}/members/${user?.uid}`);
    const memberSnapshot = await get(memberRef);

    const memberData = memberSnapshot.val();
    if (memberData.role === "owner") {
      return true;
    }
    return false;
  };

  const handleShareSpacePress = (listId: string) => {
    router.push({
      pathname: "/(shareSpace)/list",
      params: { shareSpaceId: listId }, // Passing query parameters
    });
  };

  const renderList = ({ item }: { item: RenderListProps }) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          style={[styles.listContainer, { width: withItemList }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#1985f8f9" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.listContainer, { width: withItemList }]}
        onPress={() => handleListPress(item.id)}
        onLongPress={() => handleListLongPress(item.id)}
      >
        <Text style={styles.listText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderShareSpace = ({ item }: { item: RenderListProps }) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          style={[styles.listContainer, { width: withItemList }]}
          onPress={() => setModalShareVisible(true)}
        >
          <Ionicons name="add" size={24} color="#1985f8f9" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.listContainer, { width: withItemList }]}
        onPress={() => handleShareSpacePress(item.id)}
        onLongPress={() => handleShareSpaceLongPress(item.id)}
      >
        <Text style={styles.listText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={20}
            color="#aaa"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search for tasks, events, etc..."
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
        </View>

        {/* Banner Section */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Easily collaborate with your family or team
          </Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => handleSendNotification("collaboration", "goes here")}
          >
            <Text style={styles.bannerButtonText}>Learn more</Text>
          </TouchableOpacity>
        </View>

        {/* My Lists */}
        <Text style={styles.sectionTitle}>My lists</Text>
        <View style={styles.myLists}>
          <FlatList
            data={[
              ...myLists.filter((list) => list.name),
              { id: "add", name: "Add", isAddButton: true },
            ]}
            renderItem={renderList}
            keyExtractor={(item) => item.id || "add"}
            numColumns={numColumns}
            key={numColumns}
            columnWrapperStyle={styles.listRow}
            contentContainerStyle={styles.contentList}
            scrollEnabled={false}
          />
        </View>

        {/* Shared Space */}
        <Text style={styles.sectionTitle}>Shared Space</Text>
        <View style={styles.myLists}>
          <FlatList
            data={[
              ...sharedLists.filter((list) => list.name),
              { id: "add", name: "Add", isAddButton: true },
            ]}
            renderItem={renderShareSpace}
            keyExtractor={(item) => item.id || "add"}
            numColumns={numColumns}
            key={numColumns}
            columnWrapperStyle={styles.listRow}
            contentContainerStyle={styles.contentList}
            scrollEnabled={false}
          />
        </View>

        <ModalAddList
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          newListName={newListName}
          setNewListName={setNewListName}
          onSubmit={addNewList}
        />
        <ModalAddList
          modalVisible={modalEditVisible}
          setModalVisible={setModalEditVisible}
          newListName={newListName}
          setNewListName={setNewListName}
          onSubmit={() => updateListName(listId || "", newListName)}
          haveDelete
          onDelete={() => deleteList(listId || "")}
        />
        <ModalAddList
          modalVisible={modalEditShareVisible}
          setModalVisible={setModalEditShareVisible}
          newListName={newListName}
          setNewListName={setNewListName}
          onSubmit={() => updateShareName(listId || "", newListName)}
          haveDelete
          onDelete={() => deleteShareSpace(listId || "")}
        />
        <ModalShareSpace
          modalVisible={modalShareVisible}
          setModalVisible={setModalShareVisible}
          newListName={newListName}
          setNewListName={setNewListName}
          userID={user?.uid || ""}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 10,
    marginVertical: 10,
    borderRadius: 25,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarInput: {
    flex: 1,
    padding: 5,
    fontSize: FONT_SIZE.medium,
    color: COLORS.placeholder,
  },
  searchIcon: {
    marginRight: 10,
  },
  banner: {
    backgroundColor: COLORS.bannerBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  bannerText: {
    fontSize: FONT_SIZE.medium,
    color: COLORS.link,
    marginBottom: 10,
  },
  bannerButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: FONT_SIZE.large,
    fontWeight: "bold",
    marginVertical: 10,
  },
  myLists: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contentList: {
    justifyContent: "center",
    alignContent: "center",
  },
  listRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 15,
    marginHorizontal: 20,
  },
  listContainer: {
    backgroundColor: COLORS.background,
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 300,
  },
  listText: {
    fontSize: FONT_SIZE.medium,
    fontWeight: "bold",
    color: COLORS.subtext,
  },
});
