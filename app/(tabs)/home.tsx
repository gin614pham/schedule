import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { auth } from "@/Config/firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ListNameInterface } from "@/interfaces/types";
import { COLORS, FONT_SIZE } from "@/constants/theme";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [myLists, setMyLists] = useState<ListNameInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [user, setUser] = useState(auth.currentUser);
  const [numColumns, setNumColumns] = useState(2);
  const withScreen = Dimensions.get("window").width;
  const [withItemList, setWithItemList] = useState("48%") as any;
  const [sharedLists, setSharedLists] = useState<ListNameInterface[]>([]);

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Home";
    }
  }, []);

  useEffect(() => {
    const adjustColumns = () => {
      setNumColumns(
        withScreen < 700 ? 2 : withScreen < 1000 ? 3 : withScreen < 1300 ? 4 : 5
      );
    };

    const adjustItemList = () => {
      setWithItemList(
        withScreen < 700
          ? "48%"
          : withScreen < 1000
          ? "32%"
          : withScreen < 1300
          ? "24%"
          : "18%"
      );
    };

    adjustColumns();
    adjustItemList();

    const subscribe = Dimensions.addEventListener("change", ({ window }) => {
      setNumColumns(
        window.width < 700
          ? 2
          : window.width < 1000
          ? 3
          : window.width < 1300
          ? 4
          : 5
      );

      setWithItemList(
        window.width < 700
          ? "48%"
          : window.width < 1000
          ? "32%"
          : window.width < 1300
          ? "24%"
          : "18%"
      );
    });

    return () => {
      subscribe.remove();
    };
  }, [withScreen]);

  useEffect(() => {
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

    // Cleanup listener when component unmounts or when the effect re-runs
    return () => unsubscribe();
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

  const handleListPress = (listId: string) => {
    router.push({
      pathname: "/(task)/task",
      params: { listId }, // Passing query parameters
    });
  };

  const renderList = ({
    item,
  }: {
    item: { id: string; name: string; isAddButton?: boolean };
  }) => {
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
      >
        <Text style={styles.listText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
          <TouchableOpacity style={styles.bannerButton}>
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
            renderItem={renderList}
            keyExtractor={(item) => item.id || "add"}
            numColumns={numColumns}
            key={numColumns}
            columnWrapperStyle={styles.listRow}
            contentContainerStyle={styles.contentList}
            scrollEnabled={false}
          />
        </View>

        {/* Modal for adding new list */}
        <Modal
          visible={modalVisible}
          animationType="none"
          onRequestClose={() => setModalVisible(false)}
          transparent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter List Name"
                value={newListName}
                onChangeText={setNewListName}
                textAlignVertical="top"
                multiline
              />
              <View style={styles.modalButtonsLayout}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[[styles.modalButtonText, { color: "black" }]]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <View style={styles.modalSeparator} />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={addNewList}
                  disabled={!newListName}
                >
                  <Text
                    style={
                      !newListName
                        ? styles.modalButtonTextDisabled
                        : styles.modalButtonText
                    }
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    flexGrow: 1,
  },
  modalContainer: {
    flexDirection: "column",
    backgroundColor: COLORS.background,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: "30%",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalInput: {
    width: "100%",
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: COLORS.subBackground,
    flexGrow: 9,
    borderWidth: 0,
  },
  modalButtonsLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 0,
    flexGrow: 1,
    gap: 0,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: FONT_SIZE.medium,
    fontWeight: "bold",
    color: COLORS.blue,
  },
  modalButtonTextDisabled: {
    fontSize: FONT_SIZE.medium,
    fontWeight: "bold",
    color: COLORS.disabled,
  },
  modalSeparator: {
    height: "90%",
    width: 1,
    backgroundColor: COLORS.disabled,
    alignSelf: "center",
  },
});
