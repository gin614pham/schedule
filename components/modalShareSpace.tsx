import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import { COLORS, FONT_SIZE } from "@/constants/theme";
import createShareCode from "@/utils/shareCode";
import { getDatabase, ref, push, set, get } from "firebase/database";

type Props = {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  newListName: string;
  setNewListName: React.Dispatch<React.SetStateAction<string>>;
  userID: string;
};

const ModalShareSpace = ({
  modalVisible,
  setModalVisible,
  newListName,
  setNewListName,
  userID,
}: Props) => {
  const [isCreating, setIsCreating] = React.useState(true);

  useEffect(() => {
    setNewListName("");
  }, [isCreating]);

  const onSubmitHandler = async () => {
    if (!newListName.trim()) {
      Alert.alert("Validation Error", "List name cannot be empty.");
      return;
    }

    const db = getDatabase();
    const listsRef = ref(db, "shareSpaces");
    const newListRef = push(listsRef);
    const shareCode = createShareCode();

    try {
      await set(newListRef, {
        id: newListRef.key,
        userId: userID,
        name: newListName,
        members: {
          [userID]: {
            role: "owner",
          },
        },
        shareCode: shareCode,
      });

      console.log("List added!");
      setModalVisible(false);
      setNewListName("");
    } catch (error) {
      console.error("Error adding list: ", error);
      Alert.alert("Error", "Failed to add the list.");
    }
  };

  const onJoinHandler = async () => {
    if (!newListName.trim()) {
      Alert.alert("Validation Error", "Code cannot be empty.");
      return;
    }

    const db = getDatabase();
    const listsRef = ref(db, "shareSpaces");

    const snapshot = await get(listsRef);
    const data = snapshot.val();

    const list: any = Object.values(data || {}).find(
      (item: any) => item.shareCode === newListName
    );

    if (!list) {
      Alert.alert("Error", "Invalid code.");
      return;
    }
    const memberRef = ref(db, `shareSpaces/${list.id}/members/${userID}`);
    await set(memberRef, {
      role: "viewer",
    })
      .then(() => {
        setModalVisible(false);
        setNewListName("");
        Alert.alert("Success", "You have joined the space.");
      })
      .catch((error) => {
        console.error("Error adding list: ", error);
        Alert.alert("Error", "Failed to add the list.");
      });
  };

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      onRequestClose={() => setModalVisible(false)}
      transparent
      onDismiss={() => setNewListName("")}
      // disable all other modals
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalTabs}>
            <TouchableOpacity
              style={[styles.modalButton, isCreating && styles.isSelect]}
              onPress={() => setIsCreating(true)}
            >
              <Text
                style={[
                  [
                    styles.modalButtonText,
                    isCreating ? { color: COLORS.blue } : { color: "black" },
                  ],
                ]}
              >
                Create Share Space
              </Text>
            </TouchableOpacity>
            <View style={styles.modalSeparator} />
            <TouchableOpacity
              style={[styles.modalButton, !isCreating && styles.isSelect]}
              onPress={() => setIsCreating(false)}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  !isCreating ? { color: COLORS.blue } : { color: "black" },
                ]}
              >
                Join Share Space
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder={
              isCreating ? "Enter Share Space Name" : "Enter Share Space ID"
            }
            value={newListName}
            onChangeText={setNewListName}
            textAlignVertical="top"
            multiline
            maxLength={isCreating ? 30 : 10}
            autoCapitalize={isCreating ? "none" : "characters"}
          />
          <View style={styles.modalButtonsLayout}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                setNewListName("");
              }}
            >
              <Text style={[[styles.modalButtonText, { color: "black" }]]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <View style={styles.modalSeparator} />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                if (isCreating) {
                  onSubmitHandler();
                } else {
                  onJoinHandler();
                }
              }}
              disabled={!newListName}
            >
              <Text
                style={
                  !newListName
                    ? styles.modalButtonTextDisabled
                    : styles.modalButtonText
                }
              >
                {isCreating ? "Create" : "Join"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalShareSpace;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    flexGrow: 1,
  },
  modalContainer: {
    flexDirection: "column",
    backgroundColor: COLORS.background,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: "30%",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalTabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 0,
    flexGrow: 1,
    gap: 0,
  },
  modalInput: {
    width: "100%",
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: COLORS.subBackground,
    flexGrow: 9,
    borderWidth: 0,
  },
  modalButtonsLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 0,
    flexGrow: 1,
    gap: 0,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: {
    fontSize: FONT_SIZE.medium,
    fontWeight: "bold",
    color: COLORS.blue,
  },
  modalButtonTextDisabled: {
    fontSize: FONT_SIZE.medium,
    fontWeight: "bold",
    color: COLORS.disabled,
  },
  modalSeparator: {
    height: "90%",
    width: 1,
    backgroundColor: COLORS.disabled,
    alignSelf: "center",
  },
  isSelect: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.blue,
  },
});
