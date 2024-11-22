import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="task" />
      <Stack.Screen name="edit-task" />
    </Stack>
  );
};

export default _layout;
