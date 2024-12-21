import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { TaskInterface } from "@/interfaces/types";
import { Card, Icon, IconButton } from "react-native-paper";
import { COLORS } from "@/constants/theme";
import { Octicons } from "@expo/vector-icons";

type Props = {
  item: TaskInterface;
};

const TasksShareItem = (props: Props) => {
  const renderLeft = () => {
    const date =
      props.item.date.split("-")[1] + "/" + props.item.date.split("-")[2];

    return (
      <View
        style={[styles.leftCircle, props.item.completed && styles.doneColor]}
      >
        {props.item.completed ? (
          <>
            <Octicons name="check" size={14} color={COLORS.checked} />
            <Text style={[styles.leftText, { color: COLORS.checked }]}>
              Done
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.leftText}>{props.item.time}</Text>
            <Text style={styles.leftText}>{date}</Text>
          </>
        )}
      </View>
    );
  };

  const renderRight = () => {
    return (
      props.item.completed && <IconButton icon="delete" onPress={() => {}} />
    );
  };

  return (
    // <TouchableOpacity style={styles.taskContent}>
    <Card
      onPress={() => console.log("task", props.item)}
      style={[styles.taskContent, props.item.completed && { opacity: 0.7 }]}
      mode="elevated"
    >
      <Card.Title
        title={props.item.name}
        subtitle={props.item.id}
        left={renderLeft}
        right={renderRight}
      />
    </Card>
    // </TouchableOpacity>
  );
};

export default TasksShareItem;

const styles = StyleSheet.create({
  taskContent: {
    flex: 1,
    margin: 2,
    backgroundColor: "white",
    borderRadius: 30,
  },
  taskText: {
    fontSize: 18,
    color: "#black",
  },
  leftCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  leftText: {
    color: COLORS.blue,
    fontSize: 12,
  },
  doneColor: {
    borderColor: COLORS.checked,
  },
});
