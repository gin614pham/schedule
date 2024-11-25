import { Platform, SectionList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import Header from "@/components/header";
import { auth } from "@/Config/firebaseConfig";
import {
  GroupedTasks,
  TaskInterface,
  TaskItemInterface,
} from "@/interfaces/types";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import TaskItem from "@/components/taskItem";
import {
  toggleTaskCompletion,
  handleTaskPress,
  handDeleteTask,
} from "@/controller/controller";
import { FONT_SIZE } from "@/constants/theme";

const AllTasks = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [taskList, setTaskList] = useState<TaskInterface[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "All Tasks";
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

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    if (taskList.length > 0) {
      const grouped = groupTasksByAlphabet(taskList);
      setGroupedTasks(grouped);
    }
  }, [taskList]);

  const fetchTasks = async () => {
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
          .filter((task) => task.userId === user?.uid);

        setTaskList(taskList);
        console.log("Fetch tasks is done");
        console.log(taskList);
      }
    });
  };

  const groupTasksByAlphabet = (tasks: TaskInterface[]) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const groupedTasks: GroupedTasks = {};

    tasks
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((task) => {
        const firstLetter = task.name.charAt(0).toUpperCase();
        if (alphabet.includes(firstLetter)) {
          groupedTasks[firstLetter] = groupedTasks[firstLetter] || [];
          groupedTasks[firstLetter].push(task);
        } else {
          groupedTasks["#"] = groupedTasks["#"] || [];
          groupedTasks["#"].push(task);
        }
      });

    return groupedTasks;
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

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{section.title}</Text>
      <View style={styles.divider} />
    </View>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Header title="All Tasks" />
        <SectionList
          sections={Object.entries(groupedTasks).map(([letter, tasks]) => ({
            title: letter,
            data: tasks,
          }))}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
        ></SectionList>
      </View>
    </PaperProvider>
  );
};

export default AllTasks;

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
  sectionHeaderContainer: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  sectionHeader: {
    fontSize: FONT_SIZE.large,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "gray",
    marginBottom: 10,
  },
});
