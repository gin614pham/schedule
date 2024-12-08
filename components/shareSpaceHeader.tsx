import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import { auth } from "@/Config/firebaseConfig";
import { COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Menu } from "react-native-paper";

type Props = {
  title: string;
};

const ShareSpaceHeader = (props: Props) => {
  const [visible, setVisible] = React.useState(false);
  const [countPress, setCountPress] = React.useState(0);
  const [colorIconPlanet, setColorIconPlanet] = React.useState(COLORS.shadow);
  const [nameIcon, setNameIcon] = React.useState<"planet-outline" | "planet">(
    "planet-outline"
  );

  useEffect(() => {
    if (countPress >= 7) {
      setColorIconPlanet("mediumaquamarine");
      setNameIcon("planet");
    }
  }, [countPress]);

  const handSettings = () => {
    router.push("/settings");
  };
  const handSignOut = () => {
    auth.signOut();
    router.replace("/");
  };

  const handlePress = () => {
    setCountPress(countPress + 1);
  };
  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.button}
          onPress={handlePress}
        >
          <Ionicons name={nameIcon} size={24} color={colorIconPlanet} />
        </TouchableOpacity>
        <Text style={styles.text}>{props.title}</Text>
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
            onPress={handSignOut}
            title="Logout"
            leadingIcon={() => <AntDesign name="logout" size={20} />}
          />
        </Menu>
      </View>
    </>
  );
};

export default ShareSpaceHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
    width: "100%",
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    marginBottom: 10,
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
