import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import useLocation from "@/hooks/useLocation";

const GO_MAPS_API_KEY = "AlzaSyLqy1VsGdLpKBFa4TnFmNOpwbsunEEoUCg";

const RideNavigationScreen = ({ route }) => {
  const { ride } = route.params;
  const { lat, long } = useLocation();
  const [pickupCoords, setPickupCoords] = useState(null);

  useEffect(() => {
    // Fetch pickup coordinates from ride data
    if (ride && ride.currentLocation && ride.currentLocation.coordinates) {
      setPickupCoords(ride.currentLocation.coordinates);
    } else {
      Alert.alert("Error", "Pickup location not available.");
    }
  }, [ride]);

  const openGoogleMapsToPickup = () => {
    if (!pickupCoords || !lat || !long) {
      Alert.alert("Error", "Location data is missing.");
      return;
    }

    // Google Maps URL to navigate from rider's current location to pickup location
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${long}&destination=${pickupCoords.latitude},${pickupCoords.longitude}&travelmode=driving`;

    // Open Google Maps app or browser
    Linking.openURL(googleMapsUrl).catch((err) =>
      console.error("Error opening Google Maps:", err)
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: (lat + pickupCoords?.latitude) / 2,
          longitude: (long + pickupCoords?.longitude) / 2,
          latitudeDelta: Math.abs(lat - pickupCoords?.latitude) * 1.5,
          longitudeDelta: Math.abs(long - pickupCoords?.longitude) * 1.5,
        }}
      >
        {pickupCoords && (
          <Marker
            coordinate={{
              latitude: pickupCoords.latitude,
              longitude: pickupCoords.longitude,
            }}
            title="Pickup Location"
          />
        )}
      </MapView>

      <TouchableOpacity
        style={styles.pickupButton}
        onPress={openGoogleMapsToPickup}
      >
        <Text style={styles.pickupButtonText}>Pickup Passenger</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pickupButton: {
    position: "absolute",
    bottom: 40,
    left: "10%",
    right: "10%",
    backgroundColor: "#3A86FF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pickupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RideNavigationScreen;
