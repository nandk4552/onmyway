import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Appearance,
} from "react-native";
import axios from "axios";
import { AuthContext } from "@/context/authContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const RideCard = ({ ride, onCancel }) => {
  Appearance.setColorScheme("dark");
  const [state] = useContext(AuthContext);
  const otp = state?.user?.otp;

  const handleCancel = async () => {
    try {
      const { data } = await axios.put(`/ride/cancel/${ride._id}`);
      if (data.success) {
        Alert.alert(
          "Ride Cancelled",
          "Your ride has been successfully cancelled."
        );
        onCancel(ride._id); // Call parent function to update the state
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Error cancelling ride:", error);
      Alert.alert("Failed to cancel ride");
    }
  };

  // Determine status color based on ride status
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      case "in_progress":
        return styles.statusInProgress;
      default:
        return styles.statusActive;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="map-marker" color="#3A86FF" size={24} />
        <Text style={styles.title}>Ride Details</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.location}>
          <Icon name="map-marker-radius" color="#3A86FF" /> Pickup:{" "}
          <Text style={styles.desc}>{ride?.currentLocation.address}</Text>
        </Text>

        <Text style={styles.location}>
          <Icon name="map-marker-check" color="#3A86FF" /> Drop-off:{" "}
          <Text style={styles.desc}>{ride?.destination.address}</Text>
        </Text>
        <Text style={[styles.status, getStatusColor(ride?.status)]}>
          Status: {ride?.status.charAt(0).toUpperCase() + ride?.status.slice(1)}
        </Text>
        {ride.fare && <Text style={styles.fare}>Fare: ${ride?.fare}</Text>}
        {otp && <Text style={styles.otp}>OTP: {otp}</Text>}
      </View>

      {ride.status === "active" && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  content: {
    paddingLeft: 10,
  },
  location: {
    color: "#3A86FF",
    fontSize: 15,
    marginBottom: 5,
  },
  status: {
    fontSize: 15,
    fontWeight: "bold",
    marginVertical: 5,
  },
  statusActive: {
    color: "#FFA500", // Orange for active
  },
  statusCompleted: {
    color: "#4CAF50", // Green for completed
  },
  statusCancelled: {
    color: "#e63946", // Red for cancelled
  },
  statusInProgress: {
    color: "#1E90FF", // Blue for in progress
  },
  fare: {
    color: "#A1C96A",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 5,
  },
  otp: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 5,
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: "#e63946",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#e63946",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
  },
  cancelButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  desc: {
    color: "#FFF",
  },
});

export default RideCard;
