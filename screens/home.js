import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  let latlong = {
    
  }


  useEffect(() => {
    if (location) {
      const isInside = geolib.isPointInPolygon(
        { latitude: 24.941787,
    longitude: 67.053420,},
        area
      );
      if (isInside) {
        Alert.alert('Alert', 'You are inside the specified area!');
      } else {
        Alert.alert('Alert', 'You are outside the specified area!');
      }
    }
  }, [location]);

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
        >
          <Marker
            draggable
            coordinate={{
                latitude: location.coords.latitude, longitude: location.coords.longitude
            }}
            title="You are here"
          />
          <Polygon strokeColor='grey' fillColor='#EBF5FB' strokeWidth={2} coordinates={area}/>
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
