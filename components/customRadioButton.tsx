import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";

type Props = {
  label?: string;
  checked: boolean;
  onPress: () => void;
};

const CustomRadioButton = ({ label, checked, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.radioContainer}>
        <View style={[styles.radioCircle, checked && { borderWidth: 0 }]}>
          {checked && <AntDesign name="checkcircle" size={20} color="gray" />}
        </View>
        {label && <Text style={styles.radioText}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default CustomRadioButton;

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioText: {
    marginLeft: 5,
    fontSize: 16,
  },
});
