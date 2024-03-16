import React, { useState, useEffect } from 'react';
import { View, Alert, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as geolib from 'geolib';

const FenceMap = ({ fences }) => {
    const [location, setLocation] = useState(null);
    const [userState, setUserState] = useState(0); // 0 for outside, 1 for inside
    const [enteredFences, setEnteredFences] = useState([]);
    const [exitedFences, setExitedFences] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const startWatchingLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    return;
                }

                const locationSubscription = await Location.watchPositionAsync(
                    { enableHighAccuracy: true },
                    (newLocation) => {
                        setLocation(newLocation);
                        checkInsideFence(newLocation.coords.latitude, newLocation.coords.longitude);
                    }
                );

                return () => {
                    locationSubscription.remove(); // Cleanup function to remove the location subscription
                };
            } catch (error) {
                console.error("Error watching location:", error);
            }
        };

        startWatchingLocation(); // Start watching location when component mounts
    }, []);

    const checkInsideFence = (latitude, longitude) => {
        let insideFence = null;
    
        // Find the currently inside fence
        for (const fence of fences) {
            if (geolib.isPointInPolygon(
                { latitude: latitude, longitude: longitude },
                fence.mapCoordinates
            )) {
                insideFence = fence.id;
                break;
            }
        }
    
        if (insideFence !== null) {
            // User is inside a fence
            if (userState === 0) {
                setUserState(1);
                setEnteredFences(prevEnteredFences => [...prevEnteredFences, insideFence]);
                console.log('Entered fence:', insideFence);
                Alert.alert('Alert', 'You have entered the area!');
            }
        } else {
            // User is outside all fences
            if (userState === 1) {
                const exitFence = enteredFences.pop();
                setUserState(0);
                setExitedFences(prevExitedFences => [...prevExitedFences, exitFence]);
                console.log('Exited fence:', exitFence);
                Alert.alert('Alert', 'You have exited the area!');

            }
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
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
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
