import { AuthContext } from "@/context/authContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext, useEffect, useState } from "react";
import { Text, View } from "react-native";
import Account from "../../screens/Account";
import Login from "../../screens/auth/Login";
import Register from "../../screens/auth/Register";
import RideNavigationScreen from "../../screens/rider/RideNavigationScreen";
import RiderDashboard from "../../screens/rider/RiderDashboard";
import RiderHistoryScreen from "../../screens/rider/RiderHistoryScreen";
import MyRides from "../../screens/user/MyRides";
import UserHome from "../../screens/user/UserHome";
import HeaderMenu from "./HeaderMenu";

const Stack = createNativeStackNavigator();

const ScreenMenu = () => {
  const [state] = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // Check authentication and role
  const authUser = state?.user && state?.token;
  const isRider = state?.user?.role === "rider";

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Set delay for 1 second (1000 ms)

    return () => clearTimeout(timer); // Cleanup the timer on unmount
  }, []);

  if (loading) {
    return (
      // You can replace this with your own loading component
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Login">
      {authUser ? (
        isRider ? (
          // Admin Routes
          <>
            <Stack.Screen
              name="RiderDashboard"
              component={RiderDashboard}
              options={{
                title: "Rider Dashboard",
                headerBackTitle: "Back",
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="RideNavigationScreen"
              component={RideNavigationScreen}
              options={{
                title: "RideNavigationScreen",
                headerBackTitle: "Back",
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="RiderHistoryScreen"
              component={RiderHistoryScreen}
              options={{
                title: "Rider History",
                headerBackTitle: "Back",
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="Account"
              component={Account}
              options={{
                title: "Account",
                headerBackTitle: "Back",
                headerRight: () => <HeaderMenu />,
              }}
            />
          </>
        ) : (
          // User Routes
          <>
            <Stack.Screen
              name="UserHome"
              component={UserHome}
              options={{
                title: "OnMyWay",
                headerRight: () => <HeaderMenu />,
              }}
            />
            <Stack.Screen
              name="MyRides"
              component={MyRides}
              options={{
                title: "OnMyWay",
                headerRight: () => <HeaderMenu />,
              }}
            />

            <Stack.Screen
              name="Account"
              component={Account}
              options={{
                title: "Account",
                headerBackTitle: "Back",
                headerRight: () => <HeaderMenu />,
              }}
            />
          </>
        )
      ) : (
        // Public Routes (for unauthenticated users)
        <>
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default ScreenMenu;
