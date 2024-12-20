import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(task)" />
      <Stack.Screen name="(shareSpace)" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
