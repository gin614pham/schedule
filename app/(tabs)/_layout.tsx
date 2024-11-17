import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="task" options={{ headerShown: false }}  />
      <Stack.Screen name="edit-task" options={{ headerShown: false }} />
    </Stack>
  );
}
