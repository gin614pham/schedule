import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import Header from "@/components/header";
import {
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { auth } from "@/Config/firebaseConfig";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { TaskInterface, TaskItemInterface } from "@/interfaces/types";
import InputNewTask from "@/components/inputNewTask";
import { AntDesign } from "@expo/vector-icons";
import TaskItem from "@/components/taskItem";

const MyDay = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [taskList, setTaskList] = useState<TaskInterface[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "My Day Task";
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("User logged in:", currentUser.uid);
      } else {
        setUser(null);
        router.replace("/");
      }
    });

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setIsInputFocused(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      keyboardDidHide.remove();
    };
  }, []);

  const fetchTasks = async () => {
    const currentDate = new Date();
    const db = getDatabase();
    const reference = ref(db, `tasks`);

    await onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter(
            (task) =>
              task.userId === user?.uid &&
              task.date === currentDate.toISOString().split("T")[0]
          );

        setTaskList(taskList);
        console.log("Task List:", taskList);
      }
    });
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

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

  const handleTaskPress = (taskId: string, listId: string) => {
    router.push({
      pathname: "/(task)/edit-task",
      params: { taskId, listId },
    });
  };

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
        listId: null,
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
      console.log(user?.uid);
      setNewTaskName("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add the task.");
    }
  };

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

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Header title="My Day" />
        <FlatList
          data={taskList}
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
};

export default MyDay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
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
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  homeButton: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "white",
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
  addButtonText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "bold",
  },
});
