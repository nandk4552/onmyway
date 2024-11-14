import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MI from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AuthContext } from "@/context/authContext";

const FooterMenu = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [state] = useContext(AuthContext);
  const isRider = state?.user?.role === "rider";

  return (
    <View style={styles.footer}>
      {isRider ? (
        <>
          {/* Admin Dashboard Menu Item */}
          <TouchableOpacity
            onPress={() => navigation.navigate("RiderDashboard")}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <Icon
              name={
                route.name === "RiderDashboard"
                  ? "speedometer"
                  : "speedometer-outline"
              }
              color={route.name === "RiderDashboard" ? "#3A86FF" : "#ccc"}
              size={24}
            />
            <Text
              style={[
                styles.menuText,
                route.name === "RiderDashboard" && styles.activeText,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("RiderHistoryScreen")}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <Icon
              name={
                route.name === "RiderHistoryScreen" ? "list" : "list-outline"
              } // Use "history" or "clipboard-list"
              color={route.name === "RiderHistoryScreen" ? "#3A86FF" : "#ccc"}
              size={24}
            />
            <Text
              style={[
                styles.menuText,
                route.name === "RiderHistoryScreen" && styles.activeText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* User Menu Items */}
          <TouchableOpacity
            onPress={() => navigation.navigate("UserHome")}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <Icon
              name={route.name === "UserHome" ? "home" : "home-outline"}
              color={route.name === "UserHome" ? "#3A86FF" : "#ccc"}
              size={24}
            />
            <Text
              style={[
                styles.menuText,
                route.name === "UserHome" && styles.activeText,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("MyRides")} // Navigate to "MyRides" screen
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <MI
              name={route.name === "MyRides" ? "bike-fast" : "bike"} // Adjust icon for rides to bike
              color={route.name === "MyRides" ? "#3A86FF" : "#ccc"} // Color change based on active route
              size={24}
            />
            <Text
              style={[
                styles.menuText,
                route.name === "MyRides" && styles.activeText, // Style text based on active route
              ]}
            >
              My Rides
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate("Account")}
        style={styles.menuItem}
        activeOpacity={0.7}
      >
        <Icon
          name={route.name === "Account" ? "person" : "person-outline"}
          color={route.name === "Account" ? "#3A86FF" : "#ccc"}
          size={24}
        />
        <Text
          style={[
            styles.menuText,
            route.name === "Account" && styles.activeText,
          ]}
        >
          Account
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1c1c1e",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
    height: 70,
  },
  menuItem: {
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 5,
  },
  activeText: {
    color: "#3A86FF",
    fontWeight: "bold",
  },
});

export default FooterMenu;
