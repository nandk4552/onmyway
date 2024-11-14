import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const HeaderMenu = () => {
  const [state, setState] = useContext(AuthContext);

  //   logout
  const handleLogout = async () => {
    setState({ token: "", user: null });
    await AsyncStorage.removeItem("@auth");
    alert("Logout successful");
  };
  return (
    <View>
      <TouchableOpacity onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" style={styles.iconStyle} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    marginBottom: 3,
    fontSize: 25,
    alignSelf: "center",
    color: "#fff",
  },
});

export default HeaderMenu;
