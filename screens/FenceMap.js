import React, { useState, useEffect } from 'react';
import { View, Alert, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

const FenceMap = ({ fences }) => {
    const [location, setLocation] = useState(null);
    const [fenceId, setFenceId] = useState()


    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            await updateLocation(); // Initial location update

            const interval = setInterval(updateLocation, 2000); // Update location every 2 seconds

            return () => clearInterval(interval); // Cleanup on unmount
        })();
    }, []);

    const updateLocation = async () => {
        try {
            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
            // console.log(location)
            let insideAnyFence = false; // Track if user is inside any fence
            let userState = 0

            // Check if user is inside any fence
            for (const fence of fences) {
                if (geolib.isPointInPolygon(
                    { latitude: 24.942480, longitude: 67.055290 },    
                    fence.mapCoordinates
                )) {
                    // console.log(fence.id)
                    
                    insideAnyFence = true
                    console.log(fenceId)
                    setFenceId(fence.id)
                    break; // Exit loop once inside any fence is found
                }else{
                    // console.log(fence.id)
                    insideAnyFence = false
                    setFenceId(fence.id)
                    console.log(fenceId)

                    break; 
                }
            }

            
            // Handle user state change
            if (insideAnyFence === true && userState === 0) {
                userState = 1
                console.log(fenceId)
                Alert.alert('Alert', 'You have entered the area!');
            } else if (insideAnyFence === false && userState === 1) {
                userState = 0
                console.log(fenceId)
                Alert.alert('Alert', 'You have exited the area!');
            }
        } catch (error) {
            console.error("Error fetching location:", error);
            setErrorMsg("Error fetching location");
        }
    };

    if (!location) {
        return <View><Text>Loading...</Text></View>; // Render loading indicator until location is available
    }

    return (
        <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
            showsUserLocation = {true}
            showsMyLocationButton = {true}
        >
            {fences.map((fence) => (
                <Polygon
                    key={fence.id}
                    coordinates={fence.mapCoordinates.map(coord => ({
                        latitude: coord.latitude,
                        longitude: coord.longitude,
                    }))}
                    strokeColor='grey' fillColor='#EBF5FB' strokeWidth={2}
                />
            ))}
        </MapView>
    );
};

export default FenceMap;