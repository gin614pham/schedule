import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { auth } from "../../Config/firebaseConfig";
import { router } from "expo-router";
import { updatePassword } from "firebase/auth";

const settings = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setUser(user));
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        console.log("User signed out successfully.");
        setUser(null);
        router.replace("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (!auth.currentUser) {
      alert("User not authenticated.");
      router.replace("/");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword)
        .then(() => {
          console.log("Password changed successfully.");
          setModalVisible(false);
        })
        .catch((error) => {
          console.error("Error changing password:", error);
        });
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user?.email}</Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => setNewPassword(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
            />
            <TouchableOpacity onPress={handleChangePassword}>
              <Text style={styles.modalButton}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    width: "75%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    borderRadius: 10,
    maxWidth: 200,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: "gray",
    borderRadius: 10,
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#DDDDDD",
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});
