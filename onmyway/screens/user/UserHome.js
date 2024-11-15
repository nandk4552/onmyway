import FooterMenu from "@/components/Menus/FooterMenu";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  RefreshControl,
  Appearance,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import useLocation from "@/hooks/useLocation";
import { AuthContext } from "@/context/authContext";
import Constants from "expo-constants";
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
const UserHome = () => {
  console.log("API==>", GOOGLE_MAPS_API_KEY);
  Appearance.setColorScheme("dark");
  const navigation = useNavigation();
  const { address, lat, long, errorMsg } = useLocation();
  const [authState] = useContext(AuthContext);
  const passengerId = authState?.user?._id;
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [region, setRegion] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [rideBooked, setRideBooked] = useState(false);
  const [otp, setOtp] = useState(authState?.user?.otp);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (address) setPickup(address);
    if (lat && long) {
      setRegion({
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [address, lat, long]);

  const fetchRoute = async () => {
    if (!dropoff) {
      Alert.alert("Please enter a drop-off location.");
      return;
    }

    try {
      const geoResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        // `https://maps.gomaps.pro/maps/api/geocode/json`,
        {
          params: {
            address: dropoff,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      const dropoffLocation = geoResponse.data.results[0]?.geometry.location;
      setDropoffCoords(dropoffLocation);

      if (!dropoffLocation) {
        Alert.alert("Unable to get drop-off location.");
        return;
      }

      const directionsResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json`,
        // `https://maps.gomaps.pro/maps/api/directions/json`,
        {
          params: {
            origin: `${lat},${long}`,
            destination: `${dropoffLocation.lat},${dropoffLocation.lng}`,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      const points =
        directionsResponse.data.routes[0]?.overview_polyline?.points;

      if (points) {
        const decodedPoints = decodePolyline(points);
        setRouteCoordinates(decodedPoints);

        setRegion({
          latitude: (lat + dropoffLocation.lat) / 2,
          longitude: (long + dropoffLocation.lng) / 2,
          latitudeDelta: Math.abs(lat - dropoffLocation.lat) * 1.5,
          longitudeDelta: Math.abs(long - dropoffLocation.lng) * 1.5,
        });
      } else {
        Alert.alert("No route found.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error fetching route.");
    }
  };

  const decodePolyline = (t) => {
    let points = [];
    let index = 0,
      len = t.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const bookRide = async () => {
    try {
      const response = await axios.post("/ride/book-ride", {
        pickupLocation: {
          address: pickup,
          coordinates: {
            latitude: lat,
            longitude: long,
          },
        },
        dropoffLocation: {
          address: dropoff,
          coordinates: {
            latitude: dropoffCoords.lat,
            longitude: dropoffCoords.lng,
          },
        },
        passengerId,
      });

      if (response.status === 201 && response.data.rideDetails) {
        setRideBooked(true);
        Alert.alert("Ride booked successfully!", `Your OTP: ${otp}`);
        navigation.navigate("MyRides");
        cleanUp();
      } else {
        Alert.alert("Error booking ride", response.data.message);
      }
    } catch (error) {
      console.error("Error booking ride:", error);
      Alert.alert("Error booking ride.");
    }
  };
  const cleanUp = () => {
    setDropoff("");
    setRouteCoordinates([]);
    setDropoffCoords(null);
    setRideBooked(false);
  };
  const onRefresh = () => {
    setRefreshing(true);
    cleanUp();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  return (
    <>
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContainer}
        >
          <Text style={styles.heading}>Book Your Ride</Text>

          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <View style={styles.inputWrapper}>
            <Icon name="location-on" size={24} color="#3A86FF" />
            <TextInput
              value={pickup}
              onChangeText={setPickup}
              placeholder="Pickup Location"
              placeholderTextColor="#A1A1A6"
              style={styles.inputBox}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="location-off" size={24} color="#3A86FF" />
            <TextInput
              value={dropoff}
              onChangeText={(value) => {
                setDropoff(value);
              }}
              placeholder="Drop-off Location"
              placeholderTextColor="#A1A1A6"
              style={styles.inputBox}
            />
          </View>

          {region && (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              showsUserLocation={true}
            >
              {lat && long && (
                <Marker
                  coordinate={{ latitude: lat, longitude: long }}
                  title="Current Location"
                  pinColor="red"
                />
              )}
              {dropoffCoords && (
                <Marker
                  coordinate={{
                    latitude: dropoffCoords.lat,
                    longitude: dropoffCoords.lng,
                  }}
                  title="Drop-off Location"
                  pinColor="red"
                />
              )}
              {routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#3A86FF"
                  strokeWidth={8}
                />
              )}
            </MapView>
          )}

          <TouchableOpacity style={styles.searchButton} onPress={fetchRoute}>
            <Text style={styles.buttonText}>Show Route</Text>
          </TouchableOpacity>

          {routeCoordinates.length > 0 && !rideBooked && (
            <TouchableOpacity style={styles.searchButton} onPress={bookRide}>
              <Text style={styles.buttonText}>Book Ride</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
      <FooterMenu />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E0B16", padding: 16 },
  scrollContainer: { paddingBottom: 16 },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EDEDED",
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232340",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    borderColor: "#3A86FF",
    borderWidth: 1,
  },

  inputBox: { flex: 1, color: "#EDEDED", marginLeft: 10, fontSize: 16 },
  map: { height: 300, borderRadius: 10, marginVertical: 15 },
  searchButton: {
    backgroundColor: "#3A86FF",
    marginVertical: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    textAlign: "center",
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
});

export default UserHome;
