import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

const MyDay = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "My Day Task";
    }
  }, []);

  return (
    <View>
      <Text>My Day Task</Text>
    </View>
  );
};

export default MyDay;

const styles = StyleSheet.create({});
