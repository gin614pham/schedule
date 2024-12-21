import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";

export default function _layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="list" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
