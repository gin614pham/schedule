import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React from "react";
import { Octicons } from "@expo/vector-icons";

type Props = {
  title: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  handleHideInput: () => void;
};

const InputNewTask = (props: Props) => {
  return (
    <View style={styles.container}>
      <View></View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={props.onChangeText}
          placeholder="Enter task name"
          value={props.title}
          autoFocus
          onBlur={props.handleHideInput}
          onSubmitEditing={props.onSubmit}
        />
        <TouchableOpacity
          style={[styles.button, { opacity: !props.title ? 0.5 : 1 }]}
          onPress={props.onSubmit}
          disabled={!props.title}
        >
          <Octicons name="upload" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InputNewTask;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#4fa4f3",
  },
});
