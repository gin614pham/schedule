import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { Dispatch, SetStateAction } from "react";
import { COLORS } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

type Props = {
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  shareSpaceName: string;
  copyCode: () => void;
};

const ModalListUser = ({
  modalVisible,
  setModalVisible,
  shareSpaceName,
  copyCode,
}: Props) => {
  const showToast = () => {
    Toast.show({
      type: "success",
      text1: "Copied code to clipboard",
      position: "bottom",
      visibilityTime: 2000,
    });
  };

  return (
    <Modal
      visible={modalVisible}
      onDismiss={() => setModalVisible(false)}
      onRequestClose={() => setModalVisible(false)}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.textHeader}>Share "{shareSpaceName}"</Text>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.textBody}>People with access</Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.buttonCopy}
              onPress={() => {
                copyCode();
                showToast();
              }}
            >
              <AntDesign name="link" size={24} color={COLORS.link} />
              <Text style={styles.buttonCopyText}>Copy Code Invite</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

export default ModalListUser;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    flexGrow: 1,
    zIndex: 0,
  },
  modalContainer: {
    flexDirection: "column",
    backgroundColor: COLORS.background,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    maxWidth: 700,
    minHeight: "10%",
    maxHeight: "80%",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 0,
    flexGrow: 1,
    gap: 0,
    marginTop: 5,
  },
  textHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    padding: 10,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
    flexGrow: 1,
    gap: 0,
    marginTop: 5,
    paddingHorizontal: 5,
  },
  buttonClose: {
    backgroundColor: COLORS.blue,
    padding: 5,
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  buttonCloseText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonCopy: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.background,
    padding: 5,
    paddingHorizontal: 15,
    width: "60%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonCopyText: {
    color: COLORS.link,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBody: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 5,
    flexGrow: 1,
    gap: 0,
    marginTop: 5,
    paddingHorizontal: 5,
  },
  textBody: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    padding: 10,
    width: "100%",
  },
});
