import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

const Next7Day = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Next 7 Day Task";
    }
  }, []);

  return (
    <View>
      <Text>Next 7 Day Task</Text>
    </View>
  );
};

export default Next7Day;

const styles = StyleSheet.create({});
