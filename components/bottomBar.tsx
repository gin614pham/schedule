import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";

type Props = {
  handleShowInput: () => void;
};

const BottomBar = ({ handleShowInput }: Props) => {
  return (
    <View style={styles.addButtonContainer}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/home")}
      >
        <AntDesign name="home" size={24} color="#2592ff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={handleShowInput}>
        <Text style={styles.addButtonText}>I want to do...</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 10,
    marginBottom: 10,
  },
  homeButton: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "white",
  },
  addButton: {
    flex: 9,
    backgroundColor: "white",
    padding: 15,
    paddingStart: 25,
    borderRadius: 30,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "bold",
  },
});
