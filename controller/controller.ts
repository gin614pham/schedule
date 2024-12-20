import { router } from "expo-router";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import { Alert } from "react-native";

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
    })
    .catch((error) => {
      console.error("Error deleting task: ", error);
    });
};

const toggleTaskCompletion = async (taskId: string, newStatus: boolean) => {
  const db = getDatabase();
  const taskRef = ref(db, `tasks/${taskId}`);
  const currentDate = new Date().toLocaleString();
  try {
    await update(taskRef, { completed: newStatus, lastUpdated: currentDate });
    console.log("Task status updated!");
  } catch (error) {
    console.error("Error updating task:", error);
    Alert.alert("Error", "Failed to update the task status.");
  }
};

export { handleTaskPress, handDeleteTask, toggleTaskCompletion };
