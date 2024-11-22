import React, { useRef, useCallback, useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { AgendaList, CalendarProvider } from "react-native-calendars";

import { agendaItems, getMarkedDates } from "../../mocks/agendaItems";
import AgendaItem from "../../mocks/AgendaItem";
import { getTheme, themeColor, lightThemeColor } from "../../mocks/theme";

const leftArrowIcon = require("../../assets/images/previous.png");
const rightArrowIcon = require("../../assets/images/next.png");
const ITEMS: any[] = agendaItems;

const ExpandableCalendarScreen = () => {
  const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Calendar";
    }
  }, []);

  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  return (
    <CalendarProvider
      date={ITEMS[1]?.title}
      showTodayButton
      // disabledOpacity={0.6}
      theme={todayBtnTheme.current}
      // todayBottomMargin={16}
    >
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        scrollToNextEvent
        markToday
        sectionStyle={styles.section}
        // dayFormat={'yyyy-MM-d'}
      />
    </CalendarProvider>
  );
};

export default ExpandableCalendarScreen;

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    backgroundColor: "lightgrey",
  },
  section: {
    backgroundColor: lightThemeColor,
    color: "grey",
    textTransform: "capitalize",
  },
});
