import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import Header from "@/components/header";

const AllTasks = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "All Tasks";
    }
  }, []);

  return (
    <PaperProvider>
      <Header title="All Tasks" />
      <View>
        <Text>All Tasks</Text>
      </View>
    </PaperProvider>
  );
};

export default AllTasks;

const styles = StyleSheet.create({});
