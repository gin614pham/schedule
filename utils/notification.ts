import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

const requestNotificationPermission = async (): Promise<boolean> => {
  const permission = await Notifications.requestPermissionsAsync();
  return permission.granted;
};

const handleSendNotification = async (title: string, body: string) => {
  console.log("handleSendNotification");
  requestNotificationPermission();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { data: "goes here" },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
};

export { requestNotificationPermission, handleSendNotification };
