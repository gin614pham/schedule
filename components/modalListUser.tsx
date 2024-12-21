import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { Dispatch, SetStateAction, useState } from "react";
import { COLORS } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { MemberInterface } from "@/interfaces/types";
import { Picker } from "@react-native-picker/picker";
import { getDatabase, ref, update } from "firebase/database";
import Role from "@/constants/role";

type Props = {
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  shareSpaceName: string;
  shareSpaceID: string;
  members: MemberInterface[];
  currentRole: string;
  copyCode: () => void;
  shareSpaceCode: string;
};

const ModalListUser = ({
  modalVisible,
  setModalVisible,
  shareSpaceName,
  shareSpaceID,
  members,
  copyCode,
  currentRole,
  shareSpaceCode,
}: Props) => {
  const updateMemberRole = async (memberId: string, newRole: string) => {
    const db = getDatabase();
    const memberRef = ref(
      db,
      `shareSpaces/${shareSpaceID}/members/${memberId}`
    );
    await update(memberRef, { role: newRole });
  };

  const showToast = () => {
    Toast.show({
      type: "success",
      text1: "Copied code to clipboard",
      position: "bottom",
      visibilityTime: 2000,
    });
  };

  const renderItem = ({ item }: { item: MemberInterface }) => {
    const handleRoleChange = async (role: string) => {
      await updateMemberRole(item.id, role);
    };

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.email}>{item.email}</Text>

        <Picker
          selectedValue={item.role}
          onValueChange={(role) => handleRoleChange(role)}
          style={styles.picker}
          itemStyle={styles.textPicker}
          enabled={
            currentRole === Role.owner && item.role !== Role.owner
              ? true
              : currentRole === Role.editor && item.role !== Role.owner
          }
        >
          <Picker.Item label="Viewer" value={Role.viewer} />
          <Picker.Item label="Editor" value={Role.editor} />
          {item.role === Role.owner && (
            <Picker.Item label="Owner" value={Role.owner} />
          )}
        </Picker>
      </View>
    );
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
            <FlatList
              style={styles.flatList}
              data={members}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>

          <Text style={styles.textBody}>
            Invite people by code: {shareSpaceCode}
          </Text>

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
    width: "90%",
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
  flatList: {
    width: "100%",
    flexGrow: 1,
    gap: 0,
    maxHeight: 200,
  },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-start",
    backgroundColor: "white",
    padding: 5,
    margin: 2,
  },
  email: {
    flex: 3,
    fontSize: 14,
  },
  picker: {
    flex: 2,
    borderWidth: 0,
  },
  textPicker: {
    fontSize: 10,
    color: "#666",
  },
  role: {
    fontSize: 16,
    color: "#666",
    textTransform: "capitalize",
  },
});
