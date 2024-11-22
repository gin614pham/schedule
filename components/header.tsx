import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Menu, PaperProvider } from "react-native-paper";
import { router } from "expo-router";

type Props = {
  title: string;
};

const Header = (props: Props) => {
  const [visible, setVisible] = React.useState(false);

  const handSettings = () => {
    router.push("/settings");
  };
  const handPress = () => {};

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>{props.title}</Text>
        {/* <TouchableOpacity style={styles.button}>
          <Ionicons name="ellipsis-horizontal-circle" size={24} color="black" />
        </TouchableOpacity> */}
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.button}
              onPress={() => setVisible(true)}
            >
              <Ionicons
                name="ellipsis-horizontal-circle"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={handSettings}
            title="Settings"
            leadingIcon={"cog"}
          />
          <Menu.Item
            onPress={handPress}
            title="Logout"
            leadingIcon={() => <AntDesign name="logout" size={20} />}
          />
        </Menu>
      </View>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
    width: "100%",
  },
  text: {
    width: "80%",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },

  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    maxWidth: 40,
    maxHeight: 40,
  },
});
