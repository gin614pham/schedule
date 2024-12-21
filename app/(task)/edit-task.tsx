import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useSearchParams } from "expo-router/build/hooks";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  push,
  remove,
  update,
} from "firebase/database";
import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { auth } from "@/Config/firebaseConfig";
import { Button, Provider } from "react-native-paper";
import Header from "@/components/header";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import TaskItem from "@/components/taskItem";
import {
  DropDownItemInterface,
  SubtaskInterface,
  TaskItemInterface,
} from "@/interfaces/types";

export default function EditTaskScreen() {
  const taskId = useSearchParams().get("taskId");
  const database = getDatabase();
  const [newTaskName, setNewTaskName] = useState("");
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [listId, setListId] = useState(""); // To store selected listId

  const [user, setUser] = useState(auth.currentUser);
  const [modalDateTimePicker, setModalDateTimePicker] = useState("date");

  const [dueDate, setDueDate] = useState(new Date());

  const [subtasks, setSubtasks] = useState<SubtaskInterface[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [openModel, setOpenModel] = useState(false);
  const [listOptions, setListOptions] = useState<DropDownItemInterface[]>([]);

  useEffect(() => {
    if (taskId) {
      const taskRef = ref(database, `tasks/${taskId}`);
      get(taskRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const taskData = snapshot.val();
            setNewTaskName(taskData.name);
            setCompleted(taskData.completed);
            setNotes(taskData.notes || "");
            setDate(new Date(taskData.date));
            setListId(taskData.listId); // Set listId for dropdown
            setTime(taskData.time);
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

  // Fetch lists for the current userJ
  useEffect(() => {
    if (user) {
      const reference = ref(database, "lists");
      const unsubscribe = onValue(reference, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const lists = Object.keys(data)
            .filter((key) => data[key].userId === user.uid) // Filter by userId
            .map((key) => ({ value: key, label: data[key].name })); // Get listId and name
          setListOptions(lists);
        } else {
          setListOptions([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Fetch subtasks for the current task
  useEffect(() => {
    fetchSubTasks();
  }, [taskId]);

  useEffect(() => {
    setDueDate(new Date(date.toISOString().split("T")[0] + "T" + time));
  }, [date, time]);

  const fetchSubTasks = () => {
    if (taskId) {
      const subtasksRef = ref(database, "subtasks");
      const unsubscribe = onValue(subtasksRef, (snapshot) => {
        const data = snapshot.val() || {};
        const filteredSubtasks = Object.keys(data)
          .filter((key) => data[key].idtask === taskId)
          .map((key) => ({
            id: key,
            ...data[key],
          }));
        setSubtasks(filteredSubtasks);
      });
      console.log("Subtasks fetched successfully.", subtasks);
      return () => unsubscribe();
    }
  };

  const toggleComplete = () => {
    const newStatus = !completed;
    setCompleted(newStatus);

    if (newStatus) {
      const taskRef = ref(database, `tasks/${taskId}`);
      update(taskRef, { completed: newStatus })
      subtasks.forEach((subtask) => {
        const subtaskRef = ref(database, `subtasks/${subtask.id}`);
        update(subtaskRef, { completed: newStatus })
      });
    }

    updateTaskInFirebase();
  };

  const updateTaskInFirebase = async () => {
    if (!newTaskName) {
      Alert.alert("Validation Error", "Task name cannot be empty.");
      return;
    }

    try {
      const taskRef = ref(database, `tasks/${taskId}`);
      await update(taskRef, {
        id: taskId,
        listId: listId || "",
        name: newTaskName,
        completed: completed,
        date: date.toISOString().split("T")[0],
        time: time,
        lastUpdated: new Date().toISOString(),
        deadline: date.toISOString(),
        notes: notes,
      });
      Alert.alert("Success", "Task updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
      if (Platform.OS === "web") {
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update task. Please try again.");
      console.error(error);
    }
  };

  const addSubtask = () => {
    if (!newSubtaskName.trim()) {
      Alert.alert("Validation Error", "Subtask name cannot be empty.");
      return;
    }

    const subtasksRef = ref(database, "subtasks");
    const newSubtaskRef = push(subtasksRef);
    const subtaskId = newSubtaskRef.key;

    if (subtaskId) {
      set(newSubtaskRef, {
        idsubtask: subtaskId,
        idtask: taskId,
        name: newSubtaskName,
        completed: false,
      }).then(() => setNewSubtaskName(""));
    }
  };

  const toggleSubtaskComplete = async (
    subtaskId: string,
    currentStatus: boolean
  ) => {
    const subtaskRef = ref(database, `subtasks/${subtaskId}`);

    await update(subtaskRef, { completed: currentStatus }).catch(() => {
      Alert.alert("Error", "Failed to update subtask status.");
    });
  };

  const deleteSubtask = (subtaskId: string) => {
    const subtaskRef = ref(database, `subtasks/${subtaskId}`);
    remove(subtaskRef);
  };

  const showDateTimePicker = (currentMode: string) => {
    setShowDatePicker(true);
    setModalDateTimePicker(currentMode);
  };

  const handleDatePicker = () => {
    showDateTimePicker("date");
  };

  const handleTimePicker = () => {
    showDateTimePicker("time");
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (modalDateTimePicker === "date") {
      const currentDate = selectedDate || date;
      setShowDatePicker(false);
      setDate(currentDate);
    } else if (modalDateTimePicker === "time") {
      const currentTime = selectedDate || time;
      setShowDatePicker(false);
      console.log(currentTime);
      setTime(
        currentTime.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        })
      );
    }
  };

  const renderSubtasks = ({ item }: { item: TaskItemInterface }) => {
    return (
      <View style={styles.subtaskContainer}>
        <TaskItem
          item={item}
          toggleTaskCompletion={toggleSubtaskComplete}
          handDeleteTask={deleteSubtask}
        />
      </View>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Header title="Edit Task" />
        <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
          <View style={styles.formContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Task Name"
              value={newTaskName}
              onChangeText={setNewTaskName}
            />

            <Button
              icon={() => (
                <Ionicons name="checkmark-done" size={24} color="#007bff" />
              )}
              mode="contained-tonal"
              onPress={toggleComplete}
              style={styles.button}
              rippleColor={"#6fb2fa"}
              buttonColor="white"
              contentStyle={styles.buttonContent}
            >
              {completed ? "Mark Incomplete" : "Mark Complete"}
            </Button>

            {Platform.OS === "web" ? (
              <>
                <input
                  type="date"
                  value={
                    date.toISOString() !== "Invalid Date"
                      ? date.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(event) => setDate(new Date(event.target.value))}
                  style={styles.input}
                  placeholder="Start At"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  style={styles.input}
                />
              </>
            ) : (
              <>
                <View style={styles.rowButtonContainer}>
                  <Button
                    icon={() => (
                      <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="#f81e1e"
                      />
                    )}
                    mode="contained-tonal"
                    onPress={() => handleDatePicker()}
                    style={[styles.button, styles.rowButton, { width: "60%" }]}
                    rippleColor={"#6fb2fa"}
                    buttonColor="white"
                    contentStyle={styles.buttonContentRow}
                  >
                    Start At{" "}
                    {date.toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Button>
                  <Button
                    icon={() => (
                      <Ionicons name="time-outline" size={24} color="#f81e1e" />
                    )}
                    mode="contained-tonal"
                    onPress={() => handleTimePicker()}
                    style={[styles.button, styles.rowButton, { width: "35%" }]}
                    rippleColor={"#6fb2fa"}
                    buttonColor="white"
                    contentStyle={styles.buttonContentRow}
                  >
                    Time {time}
                  </Button>
                </View>
                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={isNaN(dueDate.getTime()) ? new Date() : dueDate}
                    mode={modalDateTimePicker === "date" ? "date" : "time"}
                    is24Hour
                    onChange={onDateChange}
                  />
                )}
              </>
            )}
            <Button
              icon={() => (
                <FontAwesome5 name="list-alt" size={24} color="#e3fb2e" />
              )}
              mode="contained-tonal"
              onPress={() => setOpenModel(true)}
              style={styles.button}
              rippleColor={"#6fb2fa"}
              buttonColor="white"
              contentStyle={styles.buttonContent}
            >
              {listOptions.find((item) => item.value === listId)?.label ||
                "Select List"}
            </Button>

            {/* Subtasks Section */}
            <Text style={styles.label}>Subtasks</Text>
            <FlatList
              data={subtasks}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={renderSubtasks}
            />
            <TextInput
              style={[styles.input, { borderStyle: "dashed" }]}
              placeholder="Add Subtask"
              value={newSubtaskName}
              onChangeText={setNewSubtaskName}
              onSubmitEditing={addSubtask}
            />
            <Button
              icon={() => (
                <Ionicons name="add-circle-outline" size={24} color="#f81e1e" />
              )}
              mode="contained-tonal"
              onPress={addSubtask}
              style={styles.button}
              rippleColor={"#6fb2fa"}
              buttonColor="white"
              contentStyle={[styles.buttonContent]}
            >
              Add Subtask
            </Button>
            {/* Notes Section */}
            <Text style={styles.label}>Note</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
          <Modal
            visible={openModel}
            animationType="slide"
            onRequestClose={() => setOpenModel(false)}
            transparent
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <FlatList
                  style={styles.modalList}
                  data={listOptions}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setListId(item.value);
                        setOpenModel(false);
                      }}
                    >
                      <Text>{item.label}</Text>
                      {item.value === listId && (
                        <Ionicons name="checkmark" size={24} color="green" />
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.modalSeparator} />
                  )}
                  ListHeaderComponent={() => (
                    <View style={styles.modalHeader}>
                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setOpenModel(false)}
                      >
                        <Ionicons name="close" size={24} color="gray" />
                      </TouchableOpacity>
                      <Text style={styles.modalHeaderTitle}>List</Text>
                    </View>
                  )}
                />
              </View>
            </View>
          </Modal>
        </ScrollView>
        <Button
          mode="contained-tonal"
          onPress={updateTaskInFirebase}
          style={[styles.button, { width: "100%" }]}
          rippleColor={"#6fb2fa"}
          buttonColor="#0ed50e"
          contentStyle={[styles.saveButton]}
          textColor="black"
          icon={() => (
            <Ionicons name="save-outline" size={24} color="#2592ff" />
          )}
        >
          Save
        </Button>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    padding: 10,
    backgroundColor: "white",
    flexDirection: "column",
    gap: 10,
  },
  formContainer: {
    flex: 1,
    width: "100%",
    padding: 10,
    backgroundColor: "white",
    flexDirection: "column",
    gap: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 8,
    textTransform: "uppercase",
  },
  titleInput: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
    color: "black",
    paddingStart: 10,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
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
  rowButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 15,
    width: "80%",
    maxHeight: "60%",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalList: {
    width: "100%",
  },
  modalItem: {
    padding: 10,
    fontSize: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    width: "100%",
    fontSize: 20,
    fontWeight: "bold",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "lightgrey",
    marginVertical: 5,
    width: "100%",
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    shadowColor: "#000",
    marginStart: 10,
  },
  modalButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  saveButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  subtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    backgroundColor: "white",
    padding: 10,
  },
  rowButton: {
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
});
