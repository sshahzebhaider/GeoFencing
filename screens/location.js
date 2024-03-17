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



    const saveRecordsToServer = async (records) => {
        try {
            const token = await AsyncStorage.getItem('AccessToken');
            const response = await axios.post(
                'http://65.21.231.108:2323/api/EmployeePositionOnMap/Add',
                records,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const responseData = response.data;
            // console.log(responseData.data);
            return responseData.data; // Assuming you want to return the data for further processing

        } catch (error) {
            console.error("Error saving records:", error);
            throw error; // Throw the error so that the caller can handle it
        }
    };


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
                //console.log(responseData.data);
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




    const checkInsideFence = async (latitude, longitude) => {

        for (const fence of fences) {

            const lastMovement = movementList.slice().reverse().find(movement => movement.fenceId === fence.id);
            //console.log(lastMovement);

            if (geolib.isPointInPolygon({ latitude: latitude, longitude: longitude }, fence.mapCoordinates)) {

                const movement = {
                    mobileId: uuid.v4(),
                    time: new Date(),
                    fenceId: fence.id,
                    status: 0,
                    isUpload: false,
                    latitude: latitude,
                    longitude: longitude
                };
                if (lastMovement === undefined) {
                    await movementList.push(movement);
                    const records = [
                        {
                            id: movement.mobileId,
                            positionDate: movement.time,
                            fK_Map_ID: movement.fenceId,
                            fK_Employee_ID: await AsyncStorage.getItem('employeeID'),
                            latitude: movement.latitude,
                            longitude: movement.longitude,
                            attendanceMode: movement.status
                        }
                    ];

                    await saveRecordsToServer(records)
                        .then(data => {

                        })
                        .catch(error => {

                            console.error("Error saving records:", error);
                            setErrorMsg("Error saving records");
                        });

                }
                else {
                    if (lastMovement.fenceId === fence.id && lastMovement.status != 0) {
                        await movementList.push(movement);
                        const records = [
                            {
                                id: movement.mobileId,
                                positionDate: movement.time,
                                fK_Map_ID: movement.fenceId,
                                fK_Employee_ID: await AsyncStorage.getItem('employeeID'),
                                latitude: movement.latitude,
                                longitude: movement.longitude,
                                attendanceMode: movement.status
                            }
                        ];

                        await saveRecordsToServer(records)
                            .then(data => {

                            })
                            .catch(error => {

                                console.error("Error saving records:", error);
                                setErrorMsg("Error saving records");
                            });


                    }

                }
            }
            else {
                const movement = {
                    mobileId: uuid.v4(),
                    time: new Date(),
                    fenceId: fence.id,
                    status: 1,
                    isUpload: false,
                    latitude: latitude,
                    longitude: longitude
                };
                if (lastMovement === undefined) {
                    await movementList.push(movement);

                    const records = [
                        {
                            id: movement.mobileId,
                            positionDate: movement.time,
                            fK_Map_ID: movement.fenceId,
                            fK_Employee_ID: await AsyncStorage.getItem('employeeID'),
                            latitude: movement.latitude,
                            longitude: movement.longitude,
                            attendanceMode: movement.status
                        }
                    ];

                    await saveRecordsToServer(records)
                        .then(data => {

                        })
                        .catch(error => {

                            console.error("Error saving records:", error);
                            setErrorMsg("Error saving records");
                        });







                }
                else {
                    if (lastMovement.fenceId === fence.id && lastMovement.status != 1) {
                        await movementList.push(movement);
                        const records = [
                            {
                                id: movement.mobileId,
                                positionDate: movement.time,
                                fK_Map_ID: movement.fenceId,
                                fK_Employee_ID: await AsyncStorage.getItem('employeeID'),
                                latitude: movement.latitude,
                                longitude: movement.longitude,
                                attendanceMode: movement.status
                            }
                        ];

                        await saveRecordsToServer(records)
                            .then(data => {

                            })
                            .catch(error => {

                                console.error("Error saving records:", error);
                                setErrorMsg("Error saving records");
                            });


                    }

                }
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
