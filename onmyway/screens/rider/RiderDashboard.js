// components/RiderDashboard.js

import FooterMenu from "@/components/Menus/FooterMenu";
import axios from "axios";
import React, { useCallback, useState, useEffect, useContext } from "react";
import {
  Appearance,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AuthContext } from "@/context/authContext";
import RiderCard from "./RiderCard";
import { useNavigation } from "@react-navigation/native";

const RiderDashboard = () => {
  Appearance.setColorScheme("dark");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [state] = useContext(AuthContext);
  const riderId = state?.user?._id;
  const navigation = useNavigation();
  const fetchActiveRides = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/ride/active", {
        headers: {
          Authorization: `Bearer ${state?.token}`,
        },
      });
      if (data.success) {
        setRides(data.rides);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching active rides:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await axios.put(
        `/ride/accept/${rideId}`,
        { riderId },
        {
          headers: {
            Authorization: `Bearer ${state?.token}`,
          },
        }
      );

      if (response.data.success) {
        navigation.navigate("RiderHistoryScreen");
        fetchActiveRides();
      } else {
        alert(response.data.message || "Failed to accept ride");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to accept ride";
      console.error("Error accepting ride:", errorMessage);
      alert(errorMessage);
    }
  };

  useEffect(() => {
    fetchActiveRides();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActiveRides();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading rides...</Text>
        ) : rides.length === 0 ? (
          <Text style={styles.noRidesText}>No active rides available.</Text>
        ) : (
          rides.map((ride) => (
            <RiderCard
              key={ride._id}
              ride={ride}
              onAccept={() => handleAcceptRide(ride._id)}
            />
          ))
        )}
      </ScrollView>
      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  loadingText: {
    color: "#3A86FF",
    textAlign: "center",
    marginTop: 20,
  },
  noRidesText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RiderDashboard;
