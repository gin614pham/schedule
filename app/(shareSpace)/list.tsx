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
import { getDatabase, ref, onValue, get } from "firebase/database";
import ShareSpaceHeader from "@/components/shareSpaceHeader";
import BottomBar from "@/components/bottomBar";
import InputNewTask from "@/components/inputNewTask";
import Role from "@/constants/role";
import ModalListUser from "@/components/modalListUser";
import * as Clipboard from "expo-clipboard";
import { MemberInterface } from "@/interfaces/types";

const ListShareSpaceScreen = () => {
  const shareSpaceId = useSearchParams().get("shareSpaceId");
  const [user, setUser] = useState(auth.currentUser);
  const [role, setRole] = useState("");
  const [spaceName, setSpaceName] = useState(null);
  const [shareCode, setShareCode] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [members, setMembers] = useState<MemberInterface[]>([]);

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
      fetchMembers();
    }
  }, [user]);

  useEffect(() => {
    if (shareSpaceId) {
      fetchShareSpace();
    }
  }, [shareSpaceId]);

  const fetchRole = async () => {
    if (user) {
      const db = getDatabase();
      const listRef = ref(
        db,
        `shareSpaces/${shareSpaceId}/members/${user.uid}`
      );

      await onValue(listRef, (snapshot) => {
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
        setShareCode(data.shareCode);
      }
    });
  };

  const fetchMembers = async () => {
    const db = getDatabase();
    const reference = ref(db, `shareSpaces/${shareSpaceId}/members`);

    await onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const memberPromise = Object.keys(data).map(async (key) => {
          const email = await fetchMembersEmail(key);
          return {
            id: key,
            email: email,
            role: data[key].role,
          };
        });

        Promise.all(memberPromise).then((members) => {
          console.log(members);
          setMembers(members);
        });
      }
    });
  };

  const fetchMembersEmail = async (id: string): Promise<string> => {
    try {
      const db = getDatabase();
      const reference = ref(db, `users/${id}`);
      const snapshot = await get(reference);
      const userData = snapshot.val();
      return userData.email || "";
    } catch (error) {
      console.error("Error fetching user email:", error);
      return "";
    }
  };

  const addNewTask = () => {
    Keyboard.dismiss();
    setIsInputFocused(false);
  };

  const copyCodeInvite = async () => {
    await Clipboard.setStringAsync(shareCode);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ShareSpaceHeader
          title={spaceName || ""}
          setModalVisible={setIsModalVisible}
        />
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
        <ModalListUser
          currentRole={role}
          members={members}
          modalVisible={isModalVisible}
          setModalVisible={setIsModalVisible}
          shareSpaceName={spaceName || ""}
          shareSpaceID={shareSpaceId || ""}
          copyCode={copyCodeInvite}
        />
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
