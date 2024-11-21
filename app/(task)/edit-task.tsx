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
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSearchParams } from "expo-router/build/hooks";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth } from "@/Config/firebaseConfig";

export default function EditTaskScreen() {
  const [myLists, setMyLists] = useState<{ id: string; name: string }[]>([]);
  const taskId = useSearchParams().get("taskId");
  const database = getDatabase();
  const [newTaskName, setNewTaskName] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date().toISOString());
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [listId, setListId] = useState(""); // To store selected listId
  const [listOptions, setListOptions] = useState<{ id: string; name: string }[]>([]);
  const [user, setUser] = useState(auth.currentUser);

  // Fetch task details from Firebase
  useEffect(() => {
    if (taskId) {
      const taskRef = ref(database, `tasks/${taskId}`);
      get(taskRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const taskData = snapshot.val();
            setNewTaskName(taskData.name);
            setCompleted(taskData.completed);
            setCurrentDate(taskData.date);
            setNotes(taskData.notes || "");
            setDeadline(new Date(taskData.deadline));
            setListId(taskData.listId); // Set listId for dropdown
          } else {
            Alert.alert("Error", "Task not found.");
          }
        })
        .catch((error) => {
          Alert.alert("Error", "Failed to load task data.");
          console.error(error);
        });
    }
  }, [taskId]);

  // Fetch lists for the current user
  useEffect(() => {
    if (user) {
      const reference = ref(database, "lists");
      const unsubscribe = onValue(reference, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const lists = Object.keys(data)
            .filter((key) => data[key].userId === user.uid) // Filter by userId
            .map((key) => ({ id: key, name: data[key].name })); // Get listId and name
          setListOptions(lists);
          console.log("Fetched lists:", lists);
        } else {
          setListOptions([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const toggleComplete = () => {
    setCompleted(!completed);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(false);
    setDeadline(currentDate);
  };

  const updateTaskInFirebase = async () => {
    if (!newTaskName) {
      Alert.alert("Validation Error", "Task name cannot be empty.");
      return;
    }

    try {
      const taskRef = ref(database, `tasks/${taskId}`);
      await set(taskRef, {
        id: taskId,
        listId: listId,
        name: newTaskName,
        completed: completed,
        date: currentDate,
        lastUpdated: new Date().toISOString(),
        deadline: deadline.toISOString(),
        notes: notes,
      });
      Alert.alert("Success", "Task updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update task. Please try again.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edit Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Task Name"
        value={newTaskName}
        onChangeText={setNewTaskName}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Completed:</Text>
        <Switch value={completed} onValueChange={toggleComplete} />
      </View>

      <View>
        <Text style={styles.label}>Deadline: {deadline.toLocaleDateString()}</Text>
        <Button title="Select Deadline" onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Select List:</Text>
        <Picker
          selectedValue={listId}
          onValueChange={(itemValue) => setListId(itemValue)}
        >
          {listOptions.map((list) => (
            <Picker.Item key={list.id} label={list.name} value={list.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.notesInput}
        placeholder="Add Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Button title="Save Task" onPress={updateTaskInFirebase} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
});
