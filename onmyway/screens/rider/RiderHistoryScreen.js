import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  TextInput,
  ScrollView,
  RefreshControl,
  Appearance,
} from "react-native";
import axios from "axios";
import { AuthContext } from "@/context/authContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FooterMenu from "@/components/Menus/FooterMenu";
import useLocation from "@/hooks/useLocation";

const RiderHistoryScreen = () => {
  Appearance.setColorScheme("dark");
  const { address, lat, long, errorMsg } = useLocation(); // Get current location
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otpEntered, setOtpEntered] = useState("");
  const [state] = useContext(AuthContext);
  const riderId = state?.user?._id;
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchRiderRides();
  }, []);

  const fetchRiderRides = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/ride/history/${riderId}`, {
        headers: { Authorization: `Bearer ${state?.token}` },
      });
      if (data.success) {
        setRides(data?.rides);
      }
    } catch (error) {
      console.error("Error fetching rider rides:", error);
      Alert.alert("Failed to fetch rider rides");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePickupPassenger = async (ride) => {
    if (!lat || !long) {
      Alert.alert("Location Error", "Unable to retrieve current location.");
      return;
    }

    // Navigate from current location to passenger pickup location
    const pickupLat = ride.currentLocation.coordinates.latitude;
    const pickupLong = ride.currentLocation.coordinates.longitude;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${long}&destination=${pickupLat},${pickupLong}`;
    Linking.openURL(url);

    // Update status
    try {
      const { data } = await axios.put(
        `/ride/pickup/${ride._id}`,
        {},
        { headers: { Authorization: `Bearer ${state?.token}` } }
      );
      if (data.success) {
        Alert.alert("Ride Status Updated", "Passenger has been picked up.");
        fetchRiderRides();
      } else {
        Alert.alert("Failed to update status", data?.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Failed to update ride status");
    }
  };

  const handleOtpConfirmation = async (ride) => {
    if (otpEntered.toString() === ride.passengerId.otp.toString()) {
      try {
        const { data } = await axios.put(
          `/ride/drop/${ride._id}`,
          {}, // No payload needed for this request
          { headers: { Authorization: `Bearer ${state?.token}` } }
        );

        if (data.success) {
          setOtpEntered(""); // Clear OTP field after confirmation
          Alert.alert(
            "OTP Confirmed",
            "Status changed to 'drop'. You can now drop off the passenger."
          );
          fetchRiderRides(); // Refresh the ride list to reflect status change
        } else {
          Alert.alert("Failed to update status", data.message);
        }
      } catch (error) {
        console.error("Error updating status to drop:", error);
        Alert.alert("Failed to update status to drop");
      }
    } else {
      Alert.alert("Invalid OTP", "Please enter the correct OTP.");
    }
  };
  const handleDropPassenger = async (ride) => {
    // Open Google Maps with directions from pickup to drop-off location
    const pickupLatitude = ride.currentLocation.coordinates.latitude;
    const pickupLongitude = ride.currentLocation.coordinates.longitude;
    const dropLatitude = ride.destination.coordinates.latitude;
    const dropLongitude = ride.destination.coordinates.longitude;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${pickupLatitude},${pickupLongitude}&destination=${dropLatitude},${dropLongitude}`;
    Linking.openURL(url);

    fetchRiderRides(); // Refresh the ride list to reflect status change
  };

  const handleCompleteRide = async (ride) => {
    try {
      const { data } = await axios.put(
        `/ride/complete/${ride._id}`,
        {},
        { headers: { Authorization: `Bearer ${state?.token}` } }
      );
      if (data.success) {
        Alert.alert("Ride Status Updated", "Ride has been completed.");
        fetchRiderRides();
      } else {
        Alert.alert("Failed to mark as completed", data.message);
      }
    } catch (error) {
      console.error("Error marking ride as completed:", error);
      Alert.alert("Failed to mark ride as completed");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRiderRides();
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : rides.length === 0 ? (
          <Text style={styles.noRidesText}>No rides available</Text>
        ) : (
          rides.map((ride) => (
            <View key={ride._id} style={styles.card}>
              <Text style={styles.label}>
                <Icon name="map-marker" color="#3A86FF" /> Pickup:{" "}
                <Text style={styles.value}>{ride.currentLocation.address}</Text>
              </Text>
              <Text style={styles.label}>
                <Icon name="map-marker-check" color="#3A86FF" /> Drop-off:{" "}
                <Text style={styles.value}>{ride.destination.address}</Text>
              </Text>
              <Text style={styles.label}>
                <Icon
                  name={
                    ride.status === "completed"
                      ? "check-circle-outline"
                      : ride.status === "drop"
                      ? "car"
                      : ride.status === "pickup"
                      ? "account-check"
                      : "map-marker-check"
                  }
                  color={
                    ride.status === "completed"
                      ? "#28a745" // Green for completed
                      : ride.status === "drop"
                      ? "#FF6347" // Tomato color for drop
                      : ride.status === "pickup"
                      ? "#FFD700" // Gold for pickup
                      : "#3A86FF" // Default color
                  }
                />{" "}
                Status:{" "}
                <Text style={[styles.value]}>
                  {ride.status === "completed" ? "Completed" : ride.status}
                </Text>
              </Text>
              {ride.status === "accepted" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handlePickupPassenger(ride)}
                >
                  <Text style={styles.buttonText}>Pickup Passenger</Text>
                </TouchableOpacity>
              )}
              {ride.status === "pickup" && (
                <>
                  <View style={styles.otpContainer}>
                    <Text style={styles.otpLabel}>
                      Enter OTP to confirm pickup:
                    </Text>
                    <TextInput
                      style={styles.otpInput}
                      value={otpEntered}
                      onChangeText={setOtpEntered}
                      placeholder="Enter OTP"
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => handleOtpConfirmation(ride)}
                    >
                      <Text style={styles.buttonText}>Confirm OTP</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleDropPassenger(ride)}
                  >
                    <Text style={styles.buttonText}>Drop Passenger</Text>
                  </TouchableOpacity>
                </>
              )}
              {ride.status === "drop" && (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleDropPassenger(ride)}
                  >
                    <Text style={styles.buttonText}>Drop Passenger</Text>
                  </TouchableOpacity>
                </>
              )}
              {ride.status === "drop" && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleCompleteRide(ride)}
                >
                  <Text style={styles.buttonText}>Complete Ride</Text>
                </TouchableOpacity>
              )}
              {ride.status === "completed" && (
                <Text style={styles.completedText}>Ride Completed</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
      <FooterMenu />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#1E1E1E" },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EDEDED",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingText: {
    color: "#3A86FF",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
  },
  noRidesText: {
    color: "#888",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#2E2E2E",
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    borderColor: "#3A86FF",
    borderWidth: 1,
  },
  label: { fontSize: 16, color: "#3A86FF", marginBottom: 5 },
  value: { color: "#FFF" },
  otpContainer: { marginTop: 10 },
  otpLabel: { color: "#FFF", fontSize: 14, marginBottom: 5 },
  otpInput: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: "#3A86FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  completedText: {
    color: "#3A86FF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});

export default RiderHistoryScreen;
