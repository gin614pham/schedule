import React, { useRef, useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { AgendaList, CalendarProvider } from "react-native-calendars";

import { themeColor } from "../../mocks/theme";
import { auth } from "@/Config/firebaseConfig";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { AgendaDataInterface, TaskInterface } from "@/interfaces/types";

const ExpandableCalendarScreen = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [taskList, setTaskList] = useState<TaskInterface[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaDataInterface[]>([]);

  useEffect(() => {
    console.log("Do Transform");
    if (Platform.OS === "web") {
      document.title = "Calendar";
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

  const fetchData = async () => {
    if (user) {
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
            .filter((task) => task.userId === user?.uid)
            .sort((current, next) => {
              return (
                new Date(current.date).getTime() - new Date(next.date).getTime()
              );
            });

          setTaskList(taskList);
        }
      });
    }
  };

  useEffect(() => {
    console.log("Do Transform in useEffect");
    fetchData();
  }, [user]);

  const transformData = (taskList: TaskInterface[]) => {
    const agendaItems: AgendaDataInterface[] = [];
    taskList.forEach((task) => {
      const { id, name, date, time } = task;
      if (!agendaItems.some((item) => item.title === date)) {
        agendaItems.push({
          title: date,
          data: [
            {
              id,
              title: name,
              hour: time,
            },
          ],
        });
      } else {
        agendaItems
          .find((item) => item.title === date)
          ?.data?.push({
            id,
            title: name,
            hour: time,
          });
      }
    });

    return agendaItems;
  };

  useEffect(() => {
    console.log("Do Transform");
    if (taskList.length > 0) {
      const agendaItems = transformData(taskList);
      setAgendaItems(agendaItems);
    }
  }, [taskList]);

  // const todayBtnTheme = useRef({
  //   todayButtonTextColor: themeColor,
  // });

  const renderItem = useCallback(({ item }: any) => {
    // return <AgendaItem item={item} />;
    return (
      <View style={styles.agendaItem}>
        <Text style={styles.agendaItemTitle}>{item.title}</Text>
        <Text style={styles.agendaItemHour}>{item.hour}</Text>
      </View>
    );
  }, []);

  const todayBtnTheme = {
    todayButtonTextColor: "#FFFFFF", // Màu chữ
    todayButtonBackgroundColor: "#007BFF", // Màu nền
    todayButtonBorderRadius: 10, // Độ bo góc
    todayButtonFontSize: 16, // Cỡ chữ
    todayButtonPaddingVertical: 8, // Padding dọc
    todayButtonPaddingHorizontal: 20, // Padding ngang
  };

  return (
    <CalendarProvider
      date={agendaItems[1]?.title || new Date().toISOString().split("T")[0]}
      showTodayButton
      theme={todayBtnTheme}
    >
      <AgendaList
        sections={agendaItems}
        renderItem={renderItem}
        scrollToNextEvent
        markToday
        dayFormat="EEEE, MMM d"
        sectionStyle={styles.section}
      />
    </CalendarProvider>
  );
};

export default ExpandableCalendarScreen;

const styles = StyleSheet.create({
  calendar: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  section: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderLeftWidth: 5,
    borderLeftColor: "#007BFF",
  },
  agendaItem: {
    backgroundColor: "#ffffff",
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    cursor: "pointer",
  },
  agendaItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  agendaItemHour: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888",
  },
});
