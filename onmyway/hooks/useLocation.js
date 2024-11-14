import * as Location from "expo-location";
import { useEffect, useState } from "react";

const useLocation = () => {
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getUserCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let { coords } = await Location.getCurrentPositionAsync({});
      if (coords) {
        const { latitude, longitude } = coords;
        setLat(latitude);
        setLong(longitude);

        try {
          let response = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (response.length > 0) {
            const { street, city, region, country } = response[0];
            setAddress(
              `${street ? street + ", " : ""}${city ? city + ", " : ""}${
                region ? region + ", " : ""
              }${country || ""}`
            );
          } else {
            setErrorMsg("Unable to retrieve address.");
          }
        } catch (error) {
          console.error("Error with reverse geocoding:", error);
          setErrorMsg("Error fetching address.");
        }
      } else {
        setErrorMsg("Unable to retrieve location coordinates.");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setErrorMsg("Error accessing location services.");
    }
  };

  useEffect(() => {
    getUserCurrentLocation();
  }, []);

  return { address, lat, long, errorMsg };
};

export default useLocation;
