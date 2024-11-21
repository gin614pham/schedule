import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWindowDimensions } from "react-native";

/**
 * A set of tabs for the main app screens.
 *
 * This component handles the layout of the main tabs for the app. It uses
 * the `Tabs` component from `expo-router` to create a tab bar with four items:
 * "Home", "My Day", "Next 7 Days", and "All Tasks". The tab bar is displayed at
 * the bottom of the screen on smaller screens (less than 1000px wide) and on the
 * left side of the screen on larger screens (1000px wide or larger). The tab
 * bar is also hidden when the keyboard is shown.
 *
 * The tabs are configured to use the "shift" animation when switching between
 * them. This animation is used to smoothly transition between the different
 * screens.
 *
 * The component also uses the `Ionicons` component from `@expo/vector-icons` to
 * display icons in the tab bar. The icons are colored based on the active or
 * inactive color of the tab bar.
 */

export default function TabsLayout() {
  const { width: withScreen } = useWindowDimensions();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "gray",
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: "white",
        },
        tabBarHideOnKeyboard: true,
        tabBarPosition: withScreen < 1000 ? "bottom" : "left",
        tabBarVariant: withScreen < 1000 ? "standard" : ("automatic" as any),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
          animation: "shift",
        }}
      />
      <Tabs.Screen
        name="myday"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="sunny" size={24} color={color} />
          ),
          animation: "shift",
        }}
      />
      <Tabs.Screen
        name="next-7-day"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
          animation: "shift",
        }}
      />
      <Tabs.Screen
        name="all-tasks"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkmark" size={24} color={color} />
          ),
          animation: "shift",
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
          animation: "shift",
        }}
      />
    </Tabs>
  );
}
