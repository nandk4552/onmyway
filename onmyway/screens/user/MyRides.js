import FooterMenu from "@/components/Menus/FooterMenu";
import { AuthContext } from "@/context/authContext";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import RideCard from "@/components/Rides/RideCard";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Appearance,
} from "react-native";

const MyRides = () => {
  Appearance.setColorScheme("dark");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [state] = useContext(AuthContext);
  const handleCancelRide = (rideId) => {
    setRides((prevRides) => prevRides.filter((ride) => ride._id !== rideId));
  };
  const getUserRides = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/ride/my-rides`, {
        headers: {
          Authorization: `Bearer ${state?.token}`,
        },
      });
      if (data.success) {
        setRides(data?.rides);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      alert("Error fetching rides");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserRides();
  };

  useEffect(() => {
    getUserRides();
  }, []);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>My Rides</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3A86FF" />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3A86FF"]}
              />
            }
          >
            {rides.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                onCancel={handleCancelRide}
              /> // Display each ride using RideCard component
            ))}
          </ScrollView>
        )}
      </View>
      <FooterMenu />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default MyRides;
