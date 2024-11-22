import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

const AllTasks = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "All Tasks";
    }
  }, []);

  return (
    <View>
      <Text>All Tasks</Text>
    </View>
  );
};

export default AllTasks;

const styles = StyleSheet.create({});
