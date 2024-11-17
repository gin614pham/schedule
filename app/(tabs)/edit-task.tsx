import {
    FlatList,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    TextInput,
    Button,
    Modal,
    Alert,
  } from "react-native";
  import { useSearchParams } from "expo-router/build/hooks";
  export default function EditTaskScreen() {
    const taskId = useSearchParams().get("taskId");
    return (
      <View>
        <Text>Task ID: {taskId}</Text>
      </View>
    );
  }