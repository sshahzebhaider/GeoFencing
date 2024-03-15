import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Assuming you're using Expo for icons
import DatePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const Form = (ScreenKey) => {
    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [imageInfo, setImageInfo] = useState('')
    const [voucherId, setVoucherId] = useState('')
    const [items, setItems] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [picuri, setPicUri] = useState('')
    const [picname, setPicName] = useState('')
    const [pictype, setPicType] = useState('')


    // Define function to toggle modal visibility
    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    // Define function to handle image capture
    const captureImage = async () => {
        // Add code to capture image
        toggleModal(); // Close modal after action
        let permissionCamera = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionCamera.granted === false) {
            alert('Permission to access camera is required!');
            return;
        }

        let imageCaptured = await ImagePicker.launchCameraAsync();
        if (imageCaptured.canceled === false) {
            if (imageCaptured) {
                setPicUri(imageCaptured.assets[0].uri)
                setPicName(imageCaptured.assets[0].uri.split('/').pop())
                setPicType('image/jpg')
                setImageInfo('image captured');
                alert('Image Uploaded')
            }
        }
    };

    // Define function to handle image upload from gallery
    const uploadFromGallery = () => {
        // Add code to upload image from gallery
        toggleModal(); // Close modal after action
    };


    const addItem = () => {
        if (!amount || !description) {
            alert('Please enter amount and Description.');
            return;
        }

        const newItem = {
            id: Date.now(),
            date: date,
            amount: parseFloat(amount),
            description: description
        };

        setItems(prevItems => [...prevItems, newItem]);
        setAmount('');
        setDescription('');
    };

    const renderDatePicker = () => {
        return (
            <View>
                {showDatePicker && (
                    <DatePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || date;
                            setShowDatePicker(false);
                            setDate(currentDate);
                        }}
                    />
                )}
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 5, marginTop: 5 }}>
            <Text style={{ fontSize: 15, justifyContent: 'flex-start' }}>{item.description}</Text>
            <Text style={{ fontSize: 15, marginLeft: 65, justifyContent: 'center' }}>{item.amount}</Text>
            <TouchableOpacity style={{ justifyContent: 'flex-end', marginLeft: 110 }} onPress={() => deleteItem(item.id)} >
                <FontAwesome name="trash-o" size={20} color="red" />
            </TouchableOpacity>
        </View>
    );

    const deleteItem = (id) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const openCamera = async () => {
        const token = await AsyncStorage.getItem('AccessToken');

        let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Permission to access camera is required!');
            return;
        }

        let pickerResult = await ImagePicker.launchCameraAsync();
        if (pickerResult.canceled === false) {
            if (pickerResult) {
                const uri = pickerResult.assets[0].uri;
                const name = uri.split('/').pop();
                const type = 'image/jpg'; // Change the type according to the image format

                const imageData = new FormData();
                imageData.append('FK_VoucherManagerMaster_ID', ScreenKey.screenId);
                imageData.append('files', {
                    uri,
                    name,
                    type
                });

                try {
                    //   console.log(imageData);
                    const result = await axios.post(`https://slcloudapi.cloudstronic.com/api/VoucherMaster/AddVoucherImageAsync`, imageData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                        timeout: 10000 // Set a timeout of 10 seconds
                    });

                    if (result.status === 200) {
                        alert('Image submitted successfully.');
                        setItems([]);
                    } else {
                        alert(result.message);
                    }
                } catch (error) {
                    if (error.response) {
                        console.error('Error status:', error.response.status);
                        console.error('Error data:', error.response.data);
                        alert(error.response.message);
                    } else if (error.request) {
                        console.error('Error request:', error.request);
                        alert('No response received from the server. Please check your internet connection.');
                    } else {
                        console.error('Error:', error.message);
                        alert('An unexpected error occurred.');
                    }
                }
            } else {
                alert('Image URI is undefined.');
            }
        }
    };



    const submitData = async () => {


        if (items.length === 0) {
            alert('Add data');
            return;
        }


        const token = await AsyncStorage.getItem('AccessToken');

        const apiData = {
            docDate: date.toISOString(),
            fK_VoucherManagerMaster_ID: ScreenKey.screenId,
            voucherDetailsInp: items.map(item => ({
                creditAmount: item.amount,
                detailNarration: item.description,
            }))
        };

        try {
            // console.log(apiData);
            const result = await axios.post(`https://slcloudapi.cloudstronic.com/api/VoucherMaster/Add`, apiData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 15000 // Set a timeout of 5 seconds
            });

            if (result.status === 200) {
                // alert('Data submitted successfully.');
                console.log('Submitted Data ID:', result.data.data.id);
                setVoucherId(result.data.data.id)
                setItems([]);
                if (imageInfo !== '') {
                    const token = await AsyncStorage.getItem('AccessToken');
    
 
                    const picData = new FormData();
                    picData.append('FK_VoucherManagerMaster_ID', ScreenKey.screenId);
                    picData.append('FK_VoucherMaster_ID', voucherId);
                    picData.append('files', {
                        uri: picuri,
                        name: picname,
                        type: pictype
                    });

                    try {
                        console.log(picData);
                        const respo = await axios.post(`https://slcloudapi.cloudstronic.com/api/VoucherMaster/AddVoucherImageAsync`, picData, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'multipart/form-data'
                            },
                            timeout: 15000 // Set a timeout of 5 seconds
                        });

                        if (respo.status === 200) {
                            alert('Voucher submitted with image.');
                            setImageInfo('');


                        } else {
                            alert(respo.message);
                        }
                    } catch (error) {
                        console.error("Error uploading image:", error);
                    }

                }else{
                    alert('Voucher submitted without image')
                }

            } else {
                alert(result.message);
            }
        } catch (error) {
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
                alert(error.response.message);
            } else if (error.request) {
                console.error('Error request:', error.request);
                alert('No response received from the server. Please check your internet connection.');
            } else {
                console.error('Error:', error.message);
                alert('An unexpected error occurred.');
            }
        }

    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 16, marginTop: 1 }}>Select Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={{ fontSize: 16, marginBottom: 1, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 20 }}>{date.toDateString()}</Text>
            </TouchableOpacity>
            {renderDatePicker()}
            <FlatList
                style={{ marginTop: 8, marginBottom: 8, paddingHorizontal: 10, backgroundColor: '#f0f0f0' }}
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
            <TouchableOpacity style={{
                backgroundColor: '#7393B3',
                height: 35,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center'
            }} onPress={submitData}>
                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16 }}>Submit Voucher</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, marginTop: 5 }}>Enter Amount:</Text>
            <View style={{ flexDirection: 'row', }}>
                <TextInput
                    style={{ height: 45, backgroundColor: '#f0f0f0', marginBottom: 10, borderRadius: 20, paddingLeft: 10, width: 250 }}
                    onChangeText={text => setAmount(text)}
                    value={amount}
                    keyboardType="numeric"
                />
                <TouchableOpacity
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 5,
                        backgroundColor: '#7393B3',
                        width: 60,
                        height: 45,
                        borderRadius: 10,
                    }}
                    onPress={toggleModal} // Add your function to handle image submission
                >
                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 12 }}>Attach Image</Text>
                </TouchableOpacity>
            </View>
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20 }}>
                        <TouchableOpacity onPress={captureImage} style={{ paddingVertical: 10 }}>
                            <Text style={{ fontSize: 18 }}>Capture Image</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={uploadFromGallery} style={{ paddingVertical: 10 }}>
                            <Text style={{ fontSize: 18 }}>Upload from Gallery</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={toggleModal} style={{ paddingVertical: 10 }}>
                            <Text style={{ fontSize: 18, color: 'red' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Text style={{ fontSize: 16 }}>Enter Description:</Text>
            <TextInput
                style={{ height: 45, backgroundColor: '#f0f0f0', marginBottom: 20, borderRadius: 20, paddingLeft: 10 }}
                onChangeText={text => setDescription(text)}
                value={description}
            />
            <TouchableOpacity style={{
                backgroundColor: '#7393B3',
                height: 35,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center'
            }} onPress={addItem}>
                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Add to list</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    backgroundColor: '#7393B3',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 8 // For shadow effect on Android
                }}
                onPress={openCamera} // Add your function to handle image submission
            >
                <FontAwesome name="camera" size={24} color="#FFF" />
            </TouchableOpacity>


        </View >
    );
};

export default Form;
