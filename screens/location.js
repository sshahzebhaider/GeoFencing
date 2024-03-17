import React, { useState, useEffect } from 'react';
import { View, Alert, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as geolib from 'geolib';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import uuid from 'react-native-uuid';

const FenceMap = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [fences, setFences] = useState([]);
    let movementList = [];

    
    useEffect(() => {
        const fetchAreaCoordinates = async () => {
            // console.log(uuid.v4())
            try {
                const body = {
                    skip: 0,
                    take: 100,
                    page: 1,
                    pageSize: 100
                };
                const token = await AsyncStorage.getItem('AccessToken');
                const response = await axios.post(
                    'http://65.21.231.108:2323/api/Map/Get',
                    body,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                // console.log("Response:", response);
                const responseData = response.data;
                console.log(responseData.data);
                setFences(responseData.data);
            } catch (error) {
                console.error("Error fetching area coordinates:", error);
                setErrorMsg("Error fetching area coordinates");
            }
        };

        fetchAreaCoordinates();
    }, []);



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
                        if (fences.length > 0) {
                            checkInsideFence(
                                newLocation.coords.latitude,
                                newLocation.coords.longitude
                            );
                        }
                        setLocation(newLocation);
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
    }, [fences]);


    const sendInData = async (latitude, longitude, time, fenceId) => {
        const userId = await AsyncStorage.getItem('UserId')
        const token = await AsyncStorage.getItem('AccessToken');

        const apiData = {
            positionDate: time,
            fK_Employee_ID: userId,
            fK_Map_ID: fenceId,
            latitude: latitude,
            longitude: longitude,
            attendanceMode: 0
        };

        try {
            console.log(apiData);
            const result = await axios.post(`http://65.21.231.108:2323/api/EmployeePositionOnMap/Add`, apiData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 15000 // Set a timeout of 5 seconds
            });
            if(result.status === 200){
                console.log("Location data sent")
            }else{
                console.log("Error sending data")
            }
        } catch (e) {
            console.log("Error sending data: ", e)
        }
    }

    const sendOutData = async (latitude, longitude, time, fenceId) => {
        const userId = await AsyncStorage.getItem('UserId')
        const token = await AsyncStorage.getItem('AccessToken');

        const apiData = [{
            positionDate: time,
            fK_Employee_ID: userId,
            fK_Map_ID: fenceId,
            latitude: latitude,
            longitude: longitude,
            attendanceMode: 1
        }];

        try {
            console.log(apiData);
            const result = await axios.post(`http://65.21.231.108:2323/api/EmployeePositionOnMap/Add`, apiData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 15000 // Set a timeout of 5 seconds
            });
            if(result.status === 200){
                console.log("Location data sent")
            }else{
                console.log("Error sending data")
            }
        } catch (e) {
            console.log("Error sending data: ", e)
        }
    }


    const checkInsideFence = (latitude, longitude) => {

        for (const fence of fences) {

            const lastMovement = movementList.slice().reverse().find(movement => movement.fenceId === fence.id);
            console.log(lastMovement);

            if (geolib.isPointInPolygon({ latitude: latitude, longitude: longitude }, fence.mapCoordinates)) {

                const movement = {
                    id: uuid.v4(),
                    time: new Date(),
                    fenceId: fence.id,
                    status: 'isInside',
                    isUpload: false,
                    latitude: latitude,
                    longitude: longitude
                };


                if (lastMovement === undefined) {
                    movementList.push(movement);
                    sendInData(movement.latitude, movement.longitude, movement.time, movement.fenceId)
                }


                else {
                    if (lastMovement.fenceId === fence.id && lastMovement.status != 'isInside') {
                        movementList.push(movement);
                        sendInData(movement.latitude, movement.longitude, movement.time, movement.fenceId)

                    }

                }
            }
            else {
                const movement = {

                    time: new Date(),
                    fenceId: fence.id,
                    status: 'outSide',
                    isUpload: false,
                    latitude: latitude,
                    longitude: longitude
                };
                if (lastMovement === undefined) {
                    movementList.push(movement);
                    sendOutData(movement.latitude, movement.longitude, movement.time, movement.fenceId)
                }
                else {
                    if (lastMovement.fenceId === fence.id && lastMovement.status != 'outSide') {
                        movementList.push(movement);
                        sendOutData(movement.latitude, movement.longitude, movement.time, movement.fenceId)

                    }

                }
            }

        }
        //console.log(movementList);
        // if (insideFence !== null) {
        //     // User is inside a fence
        //     if (userState === 0) {
        //         setUserState(1);
        //         setEnteredFences(prevEnteredFences => [...prevEnteredFences, insideFence]);
        //        // console.log('Entered fence:', insideFence);
        //        // Alert.alert('Alert', 'You have entered the area!');
        //         insideFence = null;
        //     }
        // } else {
        //     // User is outside all fences
        //     if (userState === 1) {
        //         const exitFence = enteredFences.pop();
        //         setUserState(0);
        //         setExitedFences(prevExitedFences => [...prevExitedFences, exitFence]);
        //        // console.log('Exited fence:', exitFence);
        //        // Alert.alert('Alert', 'You have exited the area!');
        //     }
        // }
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
