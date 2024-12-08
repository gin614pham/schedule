import Header from "@/components/header";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { useEffect, useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { PaperProvider } from "react-native-paper";
import InputNewTask from "@/components/inputNewTask";
import TaskItem from "@/components/taskItem";
import { TaskInterface, TaskItemInterface } from "@/interfaces/types";
import { auth } from "@/Config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import BottomBar from "@/components/bottomBar";

export default function TaskScreen() {
  const listId = useSearchParams().get("listId");
  const [tasks, setTasks] = useState<TaskInterface[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [listName, setListName] = useState("");
  const [withScreen, setWithScreen] = useState(Dimensions.get("window").width);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

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
      await onValue(reference, async (snapshot) => {
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
      });

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

    await remove(taskRef)
      .then(() => {
        console.log("Task deleted!");
        fetchTasks();
      })
      .catch((error) => {
        console.error("Error deleting task: ", error);
      });
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

  const renderTask = ({ item }: { item: TaskItemInterface }) => (
    <View style={styles.taskContainer}>
      <TaskItem
        item={item}
        toggleTaskCompletion={toggleTaskCompletion}
        handleTaskPress={handleTaskPress}
        handDeleteTask={handDeleteTask}
      />
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
    const currentDate = new Date().toISOString();

    const onlyDate = currentDate.split("T")[0];
    const onlyTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    try {
      await set(newTaskRef, {
        id: newTaskRef.key,
        listId: listId,
        name: newTaskName,
        completed: false,
        date: onlyDate,
        time: onlyTime,
        lastUpdated: currentDate,
        deadline: currentDate,
        notes: "",
        userId: user?.uid,
      });

      console.log("Task added!");
      setNewTaskName("");
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
            <BottomBar handleShowInput={handleShowInput} />
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
});
