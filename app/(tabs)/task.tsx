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
  TextInput,
  Button,
  Modal,
  Alert,
} from "react-native";

export default function TaskScreen() {
  const listId = useSearchParams().get("listId");
  const [tasks, setTasks] = useState<
    { id: string; name: string; completed: boolean; date: string, lastUpdated: string }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

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

  const handleTaskPress = (taskId: string) => {
    router.push({
      pathname: "/(tabs)/edit-task",
      params: { taskId },
    });
  };

  const renderTask = ({
    item,
  }: {
    item: { id: string; name: string; completed: boolean; lastUpdated: string };
  }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity onPress={() => handleTaskPress(item.id)}>
        <Text style={styles.taskText}>{item.name}</Text>
        <Text style={styles.taskStatus}>
          {item.completed ? "Completed" : "Not Completed"}
        </Text>
        <Text style={styles.taskDate}>Last Updated: {item.lastUpdated}</Text>
      </TouchableOpacity>
      <Button
        title={item.completed ? "Mark Incomplete" : "Mark Complete"}
        onPress={() => toggleTaskCompletion(item.id, !item.completed)}
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
    const currentDate = new Date().toLocaleString(); 

    try {
      await set(newTaskRef, {
        id: newTaskRef.key,
        listId: listId,
        name: newTaskName,
        completed: false,
        date: currentDate,
        lastUpdated: currentDate, 
      });

      console.log("Task added!");
      setNewTaskName("");
      setShowModal(false);
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add the task.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter task name"
              value={newTaskName}
              onChangeText={setNewTaskName}
            />
            <Button title="Submit" onPress={addNewTask} />
            <Button
              title="Cancel"
              onPress={() => setShowModal(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskContainer: {
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
  taskText: {
    fontSize: 16,
    color: "#333",
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
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
