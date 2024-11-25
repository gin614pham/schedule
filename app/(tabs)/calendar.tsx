import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  View,
  Text,
  DefaultSectionT,
  SectionListData,
} from "react-native";
import { AgendaList, CalendarProvider } from "react-native-calendars";

import { themeColor } from "../../mocks/theme";
import { auth } from "@/Config/firebaseConfig";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { AgendaDataInterface, TaskInterface } from "@/interfaces/types";
import { COLORS, FONT_SIZE } from "@/constants/theme";

const ExpandableCalendarScreen = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [taskList, setTaskList] = useState<TaskInterface[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaDataInterface[]>([]);
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });

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

  const renderItem = useCallback(({ item }: any) => {
    return (
      <View style={styles.agendaItem}>
        <Text style={styles.agendaItemTitle}>{item.title}</Text>
        <Text style={styles.agendaItemHour}>{item.hour}</Text>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <CalendarProvider
        date={
          new Date(agendaItems[0]?.title).toLocaleString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "numeric",
            year: "numeric",
          }) || new Date().toLocaleString()
        }
        showTodayButton
        theme={todayBtnTheme.current}
      >
        <AgendaList
          sections={agendaItems}
          renderItem={renderItem}
          scrollToNextEvent
          markToday
          sectionStyle={styles.section}
        />
      </CalendarProvider>
    </View>
  );
};

export default ExpandableCalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
  },
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
    marginHorizontal: 10,
    backgroundColor: COLORS.background,
    marginVertical: 4,
    padding: 15,
    borderRadius: 10,
    cursor: "pointer",
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  agendaItemTitle: {
    fontSize: FONT_SIZE.medium,
    color: COLORS.blue,
    fontWeight: "700",
  },
  agendaItemHour: {
    fontSize: FONT_SIZE.small,
    fontWeight: "400",
    color: COLORS.blue,
  },
});
