import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "expo-router/build/hooks";
import { Button, Provider, Text } from "react-native-paper";
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
import {
  MemberInterface,
  SubtaskInterface,
  TaskInterface,
  TaskItemInterface,
} from "@/interfaces/types";
import { EmptyTask } from "@/constants/task";
import { auth } from "@/Config/firebaseConfig";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { fetchMembersEmail } from "@/utils/shareSpace";
import Role from "@/constants/role";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import TaskItem from "@/components/taskItem";

const EditShareTask = () => {
  const taskId = useSearchParams().get("taskId");
  const shareSpaceId = useSearchParams().get("shareSpaceId");

  const [user, setUser] = useState(auth.currentUser);
  const [members, setMembers] = useState<MemberInterface[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskInterface>(EmptyTask);
  const [editTask, setEditTask] = useState<TaskInterface>(EmptyTask);
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [modalDateTimePicker, setModalDateTimePicker] = useState("date");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [openModel, setOpenModel] = useState(false);
  const [subtasks, setSubtasks] = useState<SubtaskInterface[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState("");

  const fetchTasks = async () => {
    const db = getDatabase();
    const tasksRef = ref(db, `tasks/${taskId}`);

    try {
      await onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCurrentTask(data);
          setEditTask(data);
          setDate(new Date(data.date));
          setTime(data.time);
        }
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchMembers = async () => {
    const db = getDatabase();
    const reference = ref(db, `shareSpaces/${shareSpaceId}/members`);

    await onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const memberPromise = Object.keys(data).map(async (key) => {
          const email = await fetchMembersEmail(key);
          return {
            id: key,
            email: email,
            role: data[key].role,
          };
        });

        Promise.all(memberPromise).then((members) => {
          setMembers(members);
        });
      }
    });
  };

  const fetchSubTasks = () => {
    if (taskId) {
      const db = getDatabase();
      const subtasksRef = ref(db, "subtasks");
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
      return () => unsubscribe();
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Edit Task";
    }

    fetchTasks();
    fetchMembers();

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
    confirmPermissionEdit();
  }, [currentTask, members]);

  useEffect(() => {
    setDueDate(new Date(date.toISOString().split("T")[0] + "T" + time));
  }, [date, time]);

  useEffect(() => {
    fetchSubTasks();
  }, [taskId]);

  const confirmPermissionEdit = () => {
    setIsEditing(false);
    if (user?.uid === currentTask.userId) {
      setIsEditing(true);
      return;
    }

    members.forEach((member) => {
      if (member.id === user?.uid) {
        if (member.role !== Role.viewer) {
          setIsEditing(true);
        }
      }
    });
  };

  const handlePressComplete = () => {
    setEditTask({ ...editTask, completed: !editTask.completed });
  };

  const renderIconComplete = (): JSX.Element => {
    return editTask.completed ? (
      <Ionicons name="remove-sharp" size={24} color="#ff2e47" />
    ) : (
      <Ionicons name="checkmark-done" size={24} color="#007bff" />
    );
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

  const toggleSubtaskComplete = async (
    subtaskId: string,
    currentStatus: boolean
  ) => {
    if (!isEditing) {
      return;
    }

    const db = getDatabase();
    const subtaskRef = ref(db, `subtasks/${subtaskId}`);

    await update(subtaskRef, { completed: currentStatus }).catch(() => {
      Alert.alert("Error", "Failed to update subtask status.");
    });
  };

  const deleteSubtask = (subtaskId: string) => {
    if (!isEditing) {
      return;
    }
    const db = getDatabase();
    const subtaskRef = ref(db, `subtasks/${subtaskId}`);
    remove(subtaskRef);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (modalDateTimePicker === "date") {
      const currentDate = selectedDate || date;
      setShowDatePicker(false);
      setDate(currentDate);
    } else if (modalDateTimePicker === "time") {
      const currentTime = selectedDate || time;
      setShowDatePicker(false);
      setTime(
        currentTime.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        })
      );
    }
  };

  const addSubtask = () => {
    if (!newSubtaskName.trim()) {
      Alert.alert("Validation Error", "Subtask name cannot be empty.");
      return;
    }
    const db = getDatabase();
    const subtasksRef = ref(db, "subtasks");
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

  const updateTaskInFirebase = async () => {
    if (!editTask?.name.trim()) {
      Alert.alert("Validation Error", "Task name cannot be empty.");
      return;
    }
    console.log("Updating task in Firebase...");

    const db = getDatabase();
    const taskRef = ref(db, `tasks/${taskId}`);
    console.log("Task ref:", editTask.notes);

    try {
      await update(taskRef, {
        id: taskId,
        listId: shareSpaceId || "",
        name: editTask.name,
        completed: editTask.completed,
        date: date.toISOString().split("T")[0],
        time: time,
        lastUpdated: new Date().toISOString(),
        deadline: dueDate.toISOString(),
        notes: editTask.notes,
        userId: editTask.userId,
      });
      console.log("Task updated successfully!");
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
      console.error("Error updating task in Firebase:", error);
      Alert.alert("Error", "Failed to update task.");
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
              value={editTask?.name}
              onChangeText={(text) => setEditTask({ ...editTask, name: text })}
              editable={isEditing}
            />

            <Text variant="bodyMedium">
              Status: {editTask?.completed ? "Completed" : "Not Completed"}
            </Text>

            <Button
              mode="contained-tonal"
              rippleColor={"#6fb2fa"}
              buttonColor="white"
              style={styles.button}
              icon={() => renderIconComplete()}
              onPress={handlePressComplete}
              disabled={!isEditing}
            >
              {editTask?.completed
                ? "Mark as Uncompleted"
                : "Mark as Completed"}
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
                  disabled={!isEditing}
                />
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  style={styles.input}
                  disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                )}
              </>
            )}

            <Button
              icon={() => (
                <Ionicons name="person-outline" size={24} color="#FFC107" />
              )}
              mode="contained-tonal"
              onPress={() => setOpenModel(true)}
              style={styles.button}
              rippleColor={"#6fb2fa"}
              buttonColor="white"
              contentStyle={styles.buttonContent}
              disabled={!isEditing}
            >
              Assigned To:{" "}
              {members.find((item) => item.id === editTask?.userId)?.email ||
                "Select List"}
            </Button>

            <Text variant="titleMedium" style={styles.label}>
              Subtasks:
            </Text>

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
              editable={isEditing}
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
              disabled={!isEditing}
            >
              Add Subtask
            </Button>

            <Text variant="titleMedium" style={styles.label}>
              Note
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add Notes"
              value={editTask?.notes}
              onChangeText={(text) => setEditTask({ ...editTask, notes: text })}
              multiline
              editable={isEditing}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained-tonal"
            onPress={updateTaskInFirebase}
            style={[styles.button, { flex: 1 }]}
            rippleColor={"#FF9800"}
            buttonColor="#FFC107"
            contentStyle={[styles.saveButton]}
            textColor="black"
            icon={() => (
              <Ionicons name="save-outline" size={24} color="#FFC107" />
            )}
            disabled={!isEditing}
          >
            Save
          </Button>
          <Button
            mode="contained-tonal"
            onPress={() => router.back()}
            style={[styles.button, { flex: 1 }]}
            rippleColor={"#2ecc71"}
            buttonColor="#1a9555"
            contentStyle={[styles.saveButton]}
            textColor="black"
            icon={() => (
              <MaterialCommunityIcons
                name="exit-run"
                size={24}
                color="#34C759"
                scaleX={-1}
              />
            )}
          >
            Back
          </Button>
        </View>
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
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setEditTask({ ...editTask, userId: item.id });
                    setOpenModel(false);
                  }}
                >
                  <Text>{item.email}</Text>
                  {item.id === editTask?.userId && (
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
    </Provider>
  );
};

export default EditShareTask;

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
    backgroundColor: "white",
    flexDirection: "column",
    gap: 10,
  },
  formContainer: {
    flex: 1,
    width: "100%",
    padding: 5,
    backgroundColor: "white",
    flexDirection: "column",
    gap: 10,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
    color: "black",
    paddingStart: 10,
    width: "100%",
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  rowButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowButton: {
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  buttonContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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
  modalSeparator: {
    height: 1,
    backgroundColor: "lightgrey",
    marginVertical: 5,
    width: "100%",
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
  modalButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    shadowColor: "#000",
    marginStart: 10,
  },
  label: {
    fontWeight: "bold",
    marginVertical: 8,
    textTransform: "uppercase",
  },
  subtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    backgroundColor: "white",
    padding: 10,
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
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  saveButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
