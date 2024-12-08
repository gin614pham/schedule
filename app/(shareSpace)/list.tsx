import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "expo-router/build/hooks";
import { PaperProvider } from "react-native-paper";
import { auth } from "@/Config/firebaseConfig";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import ShareSpaceHeader from "@/components/shareSpaceHeader";
import BottomBar from "@/components/bottomBar";
import InputNewTask from "@/components/inputNewTask";
import Role from "@/constants/role";

const ListShareSpaceScreen = () => {
  const shareSpaceId = useSearchParams().get("shareSpaceId");
  const [user, setUser] = useState(auth.currentUser);
  const [role, setRole] = useState(null);
  const [spaceName, setSpaceName] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");

  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "List";
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRole();
    }
  }, [user]);

  useEffect(() => {
    if (shareSpaceId) {
      fetchShareSpace();
    }
  }, [shareSpaceId]);

  const fetchRole = () => {
    if (user) {
      const db = getDatabase();
      const listRef = ref(
        db,
        `shareSpaces/${shareSpaceId}/members/${user.uid}`
      );

      onValue(listRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRole(data.role);
        }
      });
    }
  };

  const fetchShareSpace = () => {
    const db = getDatabase();
    const reference = ref(db, `shareSpaces/${shareSpaceId}`);

    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSpaceName(data.name);
      }
    });
  };

  const addNewTask = () => {
    Keyboard.dismiss();
    setIsInputFocused(false);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ShareSpaceHeader title={spaceName || ""} />
        {/* <Header title={listName} />
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {!isInputFocused ? (
            <BottomBar handleShowInput={handleShowInput} />
          ) : (
            <InputNewTask
              title={newTaskName}
              onChangeText={setNewTaskName}
              onSubmit={addNewTask}
              handleHideInput={handleHideInput}
            />
          )}
        </KeyboardAvoidingView> */}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {!isInputFocused ? (
            <BottomBar handleShowInput={() => setIsInputFocused(true)} />
          ) : (
            <InputNewTask
              title={newTaskName}
              onChangeText={setNewTaskName}
              onSubmit={addNewTask}
              handleHideInput={() => {
                setIsInputFocused(false);
                Keyboard.dismiss();
              }}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </PaperProvider>
  );
};

export default ListShareSpaceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
});
