import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ headerShown: false }} />
      <Tabs.Screen name="myday" options={{ headerShown: false }} />
      <Tabs.Screen name="next-7-day" options={{ headerShown: false }} />
      <Tabs.Screen name="all-tasks" options={{ headerShown: false }} />
    </Tabs>
  );
}
