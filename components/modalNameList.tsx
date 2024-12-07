import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { COLORS, FONT_SIZE } from "@/constants/theme";

type Props = {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  newListName: string;
  setNewListName: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (listId?: string, listName?: string) => void;
};

const ModalAddList = ({
  modalVisible,
  setModalVisible,
  newListName,
  setNewListName,
  onSubmit,
}: Props) => {
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
          <TextInput
            style={styles.modalInput}
            placeholder="Enter List Name"
            value={newListName}
            onChangeText={setNewListName}
            textAlignVertical="top"
            multiline
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
              onPress={() => onSubmit()}
              disabled={!newListName}
            >
              <Text
                style={
                  !newListName
                    ? styles.modalButtonTextDisabled
                    : styles.modalButtonText
                }
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalAddList;

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
});
