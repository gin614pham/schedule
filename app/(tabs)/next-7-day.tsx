import { Platform, SectionList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import Header from "@/components/header";
import { auth } from "@/Config/firebaseConfig";
import {
  dayColorStyle,
  dayStyles,
  GroupedTasks,
  TaskInterface,
  TaskItemInterface,
} from "@/interfaces/types";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import TaskItem from "@/components/taskItem";
import {
  toggleTaskCompletion,
  handleTaskPress,
  handDeleteTask,
} from "@/controller/controller";
import { FONT_SIZE } from "@/constants/theme";

const Next7Day = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [taskList, setTaskList] = useState<TaskInterface[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Next 7 Day Task";
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
      const grouped = groupTasksByDate(taskList);
      setGroupedTasks(grouped);
    }
  }, [taskList]);

  const groupTasksByDate = (tasks: TaskInterface[]) => {
    const grouped: GroupedTasks = {};

    tasks
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((task) => {
        const taskDate = new Date(task.date);
        const dateName = taskDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (!grouped[dateName]) {
          grouped[dateName] = [];
        }
        grouped[dateName].push(task);
      });

    console.log("Grouped tasks by date:", grouped);
    return grouped;
  };

  const fetchTasks = async () => {
    const db = getDatabase();
    const reference = ref(db, `tasks`);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const next7Days = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    next7Days.setHours(23, 59, 59, 999);

    await onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((task) => {
            const taskDate = new Date(task.date);
            return (
              task.userId === user?.uid &&
              taskDate >= currentDate &&
              taskDate <= next7Days
            );
          });

        setTaskList(taskList);
        console.log("Fetch tasks is done");
      }
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

  const renderSectionHeader = ({ section }: { section: any }) => {
    const styleBackgroundColor =
      dayStyles[section.title as keyof typeof dayStyles] || {};
    const styleColor =
      dayColorStyle[section.title as keyof typeof dayColorStyle] || {};

    return (
      <View style={[styles.sectionHeaderContainer, styleBackgroundColor]}>
        <Text style={[styles.sectionHeader, styleColor]}>
          {section.index === 0 ? "Today, " + section.title : section.title}
        </Text>
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Header title="All Tasks" />
        <SectionList
          sections={Object.entries(groupedTasks).map(
            ([letter, tasks], index) => ({
              title: letter,
              data: tasks,
              index,
            })
          )}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
        ></SectionList>
      </View>
    </PaperProvider>
  );
};

export default Next7Day;

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
    padding: 10,
    borderRadius: 50,
    marginVertical: 2,
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
