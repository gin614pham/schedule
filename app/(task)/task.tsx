import CustomRadioButton from "@/components/customRadioButton";
import Header from "@/components/header";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { get, getDatabase, push, ref, set, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { Feather, AntDesign } from "@expo/vector-icons";
import { PaperProvider } from "react-native-paper";
import InputNewTask from "@/components/inputNewTask";

export default function TaskScreen() {
  const listId = useSearchParams().get("listId");
  const [tasks, setTasks] = useState<
    {
      id: string;
      name: string;
      completed: boolean;
      date: string;
      lastUpdated: string;
    }[]
  >([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [listName, setListName] = useState("");
  const [withScreen, setWithScreen] = useState(Dimensions.get("window").width);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const updateScreenSize = Dimensions.addEventListener(
      "change",
      ({ window }) => {
        setWithScreen(window.width);
      }
    );

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setIsInputFocused(false);
    });

    return () => {
      updateScreenSize.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Tasks - " + listName;
    }
  }, [listName]);

  const fetchTasks = async () => {
    if (!listId) {
      console.error("List ID is not defined.");
      return;
    }

    const db = getDatabase();
    const reference = ref(db, `tasks`);

    try {
      const snapshot = await get(reference);
      const data = snapshot.val();
      if (data) {
        const taskList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((task) => task.listId === listId);

        setTasks(taskList);
      } else {
        setTasks([]);
      }

      const listRef = ref(db, `lists/${listId}`);
      const listSnapshot = await get(listRef);
      const listData = listSnapshot.val();
      if (listData) {
        setListName(listData.name);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Failed to fetch tasks.");
    }
  };

  useEffect(() => {
    if (listId) {
      fetchTasks();
    }
  }, [listId]);

  const handDeleteTask = async (taskId: string) => {
    const db = getDatabase();
    const taskRef = ref(db, `tasks/${taskId}`);

    try {
      await update(taskRef, { deleted: true });
      console.log("Task deleted!");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "Failed to delete task.");
    }
  };

  const handleShowInput = () => {
    setIsInputFocused(true);
  };

  const handleHideInput = () => {
    setIsInputFocused(false);
    Keyboard.dismiss();
  };

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: "/(task)/edit-task",
      params: { taskId, listId },
    });
  };

  const renderTask = ({
    item,
  }: {
    item: { id: string; name: string; completed: boolean; lastUpdated: string };
  }) => (
    <View style={styles.taskContainer}>
      <CustomRadioButton
        checked={item.completed}
        onPress={() => toggleTaskCompletion(item.id, !item.completed)}
      />
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => handleTaskPress(item.id)}
      >
        <Text style={[styles.taskText, item.completed && { color: "gray" }]}>
          {item.name}
        </Text>
        {item.completed && (
          <>
            <View style={[styles.taskSeparator, { width: withScreen - 175 }]} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handDeleteTask(item.id)}
            >
              <Feather name="delete" size={24} color="gray" />
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const toggleTaskCompletion = async (taskId: string, newStatus: boolean) => {
    const db = getDatabase();
    const taskRef = ref(db, `tasks/${taskId}`);
    const currentDate = new Date().toLocaleString(); // Get current date and time
    try {
      await update(taskRef, { completed: newStatus, lastUpdated: currentDate });
      console.log("Task status updated!");
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update the task status.");
    }
  };

  const addNewTask = async () => {
    if (!newTaskName.trim()) {
      Alert.alert("Validation Error", "Task name cannot be empty.");
      return;
    }

    const db = getDatabase();
    const tasksRef = ref(db, `tasks`);
    const newTaskRef = push(tasksRef);
    const currentDate = new Date().toLocaleString();

    try {
      await set(newTaskRef, {
        id: newTaskRef.key,
        listId: listId,
        name: newTaskName,
        completed: false,
        date: currentDate,
        lastUpdated: currentDate,
        deadline: currentDate,
      });

      console.log("Task added!");
      setNewTaskName("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add the task.");
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Header title={listName} />
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {!isInputFocused ? (
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.replace("/home")}
              >
                <AntDesign name="home" size={24} color="#2592ff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleShowInput}
              >
                <Text style={styles.addButtonText}>I want to do...</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <InputNewTask
              title={newTaskName}
              onChangeText={setNewTaskName}
              onSubmit={addNewTask}
              handleHideInput={handleHideInput}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  taskSeparator: {
    height: 1,
    width: "75%",
    backgroundColor: "gray",
    position: "absolute",
    left: 25,
  },
  deleteButton: {
    position: "absolute",
    right: 10,
  },
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  taskText: {
    fontSize: 18,
    color: "#black",
  },
  taskStatus: {
    fontSize: 14,
    marginTop: 5,
    color: "#666",
  },
  taskDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  addButtonText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },
  addButton: {
    flex: 9,
    backgroundColor: "white",
    padding: 15,
    paddingStart: 25,
    borderRadius: 30,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButton: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "white",
  },
});