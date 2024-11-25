import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomRadioButton from "./customRadioButton";
import { Feather } from "@expo/vector-icons";
import { TaskItemInterface } from "@/interfaces/types";

type Props = {
  item: TaskItemInterface;
  listID?: string;
  toggleTaskCompletion: (id: string, completed: boolean) => void;
  handleTaskPress?: (id: string, listId: string) => void;
  handDeleteTask: (id: string) => void;
};

const TaskItem = ({
  item,
  listID,
  toggleTaskCompletion,
  handleTaskPress,
  handDeleteTask,
}: Props) => {
  const [withScreen, setWithScreen] = useState(Dimensions.get("window").width);

  useEffect(() => {
    const updateScreenSize = Dimensions.addEventListener(
      "change",
      ({ window }) => {
        setWithScreen(window.width);
      }
    );

    return () => updateScreenSize.remove();
  }, []);
  return (
    <>
      <CustomRadioButton
        checked={item.completed}
        onPress={() => toggleTaskCompletion(item.id, !item.completed)}
      />
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => handleTaskPress?.(item.id, listID || "")}
      >
        <Text style={[styles.taskText, item.completed && { color: "gray" }]}>
          {item.name}
        </Text>
        {item.completed && (
          <>
            <View style={[styles.taskSeparator, { width: withScreen - 185 }]} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handDeleteTask(item.id)}
            >
              <Feather name="delete" size={24} color="gray" />
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    </>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
  taskContent: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  taskText: {
    fontSize: 18,
    color: "#black",
  },
  taskSeparator: {
    height: 1,
    width: "75%",
    backgroundColor: "gray",
    position: "absolute",
    left: 25,
  },
  deleteButton: {
    position: "absolute",
    right: 10,
  },
});
