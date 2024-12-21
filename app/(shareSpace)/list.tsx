import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "expo-router/build/hooks";
import { PaperProvider, SegmentedButtons } from "react-native-paper";
import { auth } from "@/Config/firebaseConfig";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, get, push, set } from "firebase/database";
import ShareSpaceHeader from "@/components/shareSpaceHeader";
import BottomBar from "@/components/bottomBar";
import InputNewTask from "@/components/inputNewTask";
import Role from "@/constants/role";
import ModalListUser from "@/components/modalListUser";
import * as Clipboard from "expo-clipboard";
import { MemberInterface, TaskInterface } from "@/interfaces/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import getDateAndTime from "@/utils/getDate";
import TasksShareItem from "@/components/tasksShareItem";
import { handDeleteTask } from "@/controller/controller";

const ListShareSpaceScreen = () => {
  const shareSpaceId = useSearchParams().get("shareSpaceId");
  const [user, setUser] = useState(auth.currentUser);
  const [role, setRole] = useState("");
  const [spaceName, setSpaceName] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [members, setMembers] = useState<MemberInterface[]>([]);
  const [filled, setFilled] = useState("All");
  const [tasks, setTasks] = useState<TaskInterface[]>([]);

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "List";
    }

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
    if (user) {
      fetchRole();
      fetchMembers();
    }
  }, [user]);

  useEffect(() => {
    if (shareSpaceId) {
      fetchShareSpace();
      fetchTasks();
    }
  }, [shareSpaceId]);

  const fetchRole = async () => {
    if (user) {
      const db = getDatabase();
      const listRef = ref(
        db,
        `shareSpaces/${shareSpaceId}/members/${user.uid}`
      );

      await onValue(listRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRole(data.role);
        }
      });
    }
  };

  const fetchShareSpace = () => {
    const db = getDatabase();
    const reference = ref(db, `shareSpaces/${shareSpaceId}`);

    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSpaceName(data.name);
        setShareCode(data.shareCode);
      }
    });
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
          console.log(members);
          setMembers(members);
        });
      }
    });
  };

  const fetchMembersEmail = async (id: string): Promise<string> => {
    try {
      const db = getDatabase();
      const reference = ref(db, `users/${id}`);
      const snapshot = await get(reference);
      const userData = snapshot.val();
      return userData.email || "";
    } catch (error) {
      console.error("Error fetching user email:", error);
      return "";
    }
  };

  const fetchTasks = async () => {
    if (!shareSpaceId) {
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
            .filter((task) => task.listId === shareSpaceId);

          // sort task by completion status, then by date, then by time, then by name
          taskList.sort((a, b) => {
            if (a.completed !== b.completed) {
              return a.completed - b.completed;
            } else if (a.date !== b.date) {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (a.time !== b.time) {
              const [hourA, minuteA] = a.time.split(":").map(Number);
              const [hourB, minuteB] = b.time.split(":").map(Number);
              return hourA * 60 + minuteA - (hourB * 60 + minuteB);
            } else {
              return a.name.localeCompare(b.name);
            }
          });

          setTasks(taskList);
        } else {
          setTasks([]);
        }
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const filterTasks = (): TaskInterface[] => {
    if (filled === "All") {
      return tasks;
    } else {
      return tasks.filter((task) => task.userId === user?.uid);
    }
  };

  const getMailById = (id: string) => {
    const member = members.find((member) => member.id === id);
    return member?.email || "Unknown";
  };

  const addNewTask = async () => {
    Keyboard.dismiss();
    setIsInputFocused(false);

    if (!newTaskName.trim()) {
      Alert.alert("Validation Error", "Task name cannot be empty.");
      return;
    }

    const db = getDatabase();
    const tasksRef = ref(db, `tasks`);
    const newTaskRef = push(tasksRef);

    const { onlyDate, onlyTime, currentDate } = getDateAndTime();

    try {
      await set(newTaskRef, {
        id: newTaskRef.key,
        listId: shareSpaceId,
        name: newTaskName,
        completed: false,
        date: onlyDate,
        time: onlyTime,
        lastUpdated: currentDate,
        deadline: currentDate,
        notes: "",
        userId: user?.uid,
      });

      setNewTaskName("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const copyCodeInvite = async () => {
    await Clipboard.setStringAsync(shareCode);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await handDeleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const renderTaskItem = ({ item }: { item: TaskInterface }) => (
    <TasksShareItem
      item={item}
      userName={getMailById(item.userId)}
      onPress={() => handleTaskPress(item.id, shareSpaceId!)}
      onDelete={() => handleDeleteTask(item.id)}
    />
  );

  const renderEmptyList = () => {
    return (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>No tasks found.</Text>
        <Text style={styles.emptyListText}>
          Please add a task to get started!
        </Text>
      </View>
    );
  };

  const handleTaskPress = (taskId: string, shareSpaceId: string) => {
    router.push({
      pathname: "/(shareSpace)/edit",
      params: { taskId, shareSpaceId },
    });
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ShareSpaceHeader
          title={spaceName || ""}
          setModalVisible={setIsModalVisible}
        />

        <SegmentedButtons
          value={filled}
          onValueChange={setFilled}
          buttons={[
            {
              label: "All Tasks",
              value: "All",
              icon: () => (
                <MaterialCommunityIcons
                  name="format-list-bulleted-type"
                  size={24}
                  color="black"
                />
              ),
            },
            {
              label: "Your Tasks",
              value: "Your",
              icon: () => (
                <MaterialCommunityIcons
                  name="account-details"
                  size={24}
                  color="black"
                />
              ),
            },
          ]}
          theme={{
            colors: {
              secondaryContainer: "#a6d0fd",
              outline: "#a6d0fd",
            },
          }}
        />

        <FlatList
          data={filterTasks()}
          renderItem={renderTaskItem}
          keyExtractor={(item: TaskInterface) => item.id}
          style={styles.taskList}
          ListEmptyComponent={renderEmptyList}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {!isInputFocused || role === Role.viewer ? (
            <BottomBar
              handleShowInput={() =>
                role !== Role.viewer
                  ? setIsInputFocused(true)
                  : setIsInputFocused(false)
              }
            />
          ) : (
            <InputNewTask
              title={newTaskName}
              onChangeText={setNewTaskName}
              onSubmit={addNewTask}
              handleHideInput={() => {
                setIsInputFocused(false);
                Keyboard.dismiss();
              }}
            />
          )}
        </KeyboardAvoidingView>
        <ModalListUser
          shareSpaceCode={shareCode}
          currentRole={role}
          members={members}
          modalVisible={isModalVisible}
          setModalVisible={setIsModalVisible}
          shareSpaceName={spaceName || ""}
          shareSpaceID={shareSpaceId || ""}
          copyCode={copyCodeInvite}
        />
      </View>
    </PaperProvider>
  );
};

export default ListShareSpaceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
  taskList: {
    marginVertical: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 16,
    color: "gray",
  },
});
