import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userState, setUserState] = useState(0); // 0: Outside, 1: Inside
  const [alertShown, setAlertShown] = useState(false);

  let area = [
    {
      latitude: 24.942701,
      longitude: 67.048120
    },
    {
      latitude: 24.947390,
      longitude: 67.051961
    },
    {
      latitude: 24.941242,
      longitude: 67.060222
    },
    {
      latitude: 24.937253,
      longitude: 67.055308
    }
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      await updateLocation(); // Initial location update

      const interval = setInterval(updateLocation, 2000); // Update location every 2 seconds

      return () => clearInterval(interval);
    })();
  }, []);

  const updateLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      const isInside = geolib.isPointInPolygon(
        { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude },
        area
      );
      if (isInside && userState === 0 ) {
        setUserState(1);
        Alert.alert('Alert', 'You have entered the specified area!');
      } else if (!isInside && userState === 1) {
        setUserState(0);
        Alert.alert('Alert', 'You have exited the specified area!');
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setErrorMsg("Error fetching location");
    }
  };

  return (
    
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Polygon strokeColor='grey' fillColor='#EBF5FB' strokeWidth={2} coordinates={area} />
        </MapView>
      ) : (
        <Text>{errorMsg || 'Waiting for location permission...'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
