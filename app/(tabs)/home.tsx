import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
} from "react-native";
import { getDatabase, ref, push, set, get } from "firebase/database";
import { auth } from "../../Config/firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";
import { router } from "expo-router";

export default function App() {
  const [myLists, setMyLists] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Fetch data from Realtime Database
  useEffect(() => {
    const fetchData = async () => {
      const db = getDatabase();
      const user = auth.currentUser;
      const reference = ref(db, "lists"); // Fetch all lists under the 'lists' node

      try {
        const snapshot = await get(reference);
        const data = snapshot.val();
        const lists = data
          ? Object.keys(data)
              .filter((key) => data[key].userId === user?.uid) // Filter by userId
              .map((key) => ({ id: key, name: data[key].name })) // Get listId and name
          : [];
        setMyLists(lists);
        console.log("Fetched data:", lists);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMyLists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addNewList = async () => {
    const user = auth.currentUser;
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
      pathname: "/(tabs)/task",
      params: { listId }, // Passing query parameters
    });
  };

  const renderList = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={styles.listContainer}
      onPress={() => handleListPress(item.id)}
    >
      <Text style={styles.listText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#aaa" style={styles.searchIcon} />
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
      <FlatList
        data={myLists.filter((list) => list.name)}
        renderItem={renderList}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.listRow}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add New List</Text>
      </TouchableOpacity>

      {/* Shared Space */}
      <Text style={styles.sectionTitle}>Shared Space</Text>
      <TouchableOpacity style={styles.sharedSpace}>
        <Text style={styles.sharedText}>+</Text>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <Text style={styles.tabBarItem}>My Day</Text>
        <Text style={styles.tabBarItem}>Next 7 Days</Text>
        <Text style={styles.tabBarItem}>All Tasks</Text>
        <Text style={styles.tabBarItem}>Calendar</Text>
      </View>

      {/* Modal for adding new list */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter List Name"
            value={newListName}
            onChangeText={setNewListName}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <Button title="Add" onPress={addNewList} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    marginVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarInput: {
    flex: 1,
    padding: 5,
    fontSize: 16,
    color: "#333",
  },
  searchIcon: {
    marginRight: 10,
  },
  banner: {
    backgroundColor: "#e6f2ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 16,
    color: "#007bff",
    marginBottom: 10,
  },
  bannerButton: {
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  listRow: {
    justifyContent: "space-between",
  },
  listContainer: {
    backgroundColor: "white",
    width: "48%",
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 300,
  },
  listText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#007bff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  sharedSpace: {
    backgroundColor: "white",
    height: 100,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sharedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginTop: 20,
  },
  tabBarItem: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
