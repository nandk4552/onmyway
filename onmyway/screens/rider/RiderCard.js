// components/Rides/RiderCard.js

import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Appearance,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MI from "react-native-vector-icons/MaterialIcons";

const RiderCard = ({ ride, onAccept }) => {
  Appearance.setColorScheme("dark");
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="bike" color="#3A86FF" size={24} />
        <Text style={styles.title}>Ride Details</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>
          <MI name="location-on" color="#3A86FF" /> Pickup:{" "}
          <Text style={styles.value}>{ride?.currentLocation.address}</Text>
        </Text>
        <Text style={styles.label}>
          <MI name="location-off" color="#3A86FF" /> Pickup:
          <Text style={styles.value}>{ride?.destination.address}</Text>
        </Text>
        <Text style={styles.status}>
          Status: <Text style={styles.statusText}>{ride?.status}</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
        <Text style={styles.acceptButtonText}>Accept Ride</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#FFFFFF",
  },
  content: {
    paddingLeft: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#3A86FF",
    marginBottom: 5,
  },
  value: {
    color: "#D1D1D1",
  },
  status: {
    fontSize: 16,
    color: "#CCCCCC",
    marginTop: 5,
  },
  statusText: {
    fontWeight: "bold",
    color: "#F4A261",
  },
  acceptButton: {
    paddingVertical: 12,
    backgroundColor: "#3A86FF",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#3A86FF",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  acceptButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RiderCard;
