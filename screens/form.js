import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Assuming you're using Expo for icons
import DatePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';



const Form = (ScreenKey) => {
    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [items, setItems] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

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
        // setDate(new Date());
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



    const renderItem = ({ item, onDelete }) => (
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

    const submitData = async () => {
        console.log(ScreenKey.screenId)
        if (items.length === 0) {
            alert('Add data');
            return;
        }
    
        const apiUrl = 'http://65.21.231.76:2020/api/VoucherMaster/Add'; 
        const token = await AsyncStorage.getItem('AccessToken');
    
        const apiData = {
            docDate: date.toISOString(), // Convert date to ISO string format
            instrumentNumber: "", // Add your instrument number if available
            instrumentDate: date.toISOString(), // Convert date to ISO string format
            instrumentType: 0, // Add instrument type as per your requirement
            masterNarration: "", // Add your master narration if available
            externalRefrenceNumber: "", // Add external reference number if available
            paidReceivedTFrom: "", // Add paid/received from if available
            fK_VoucherManagerMaster_ID: ScreenKey.screenId,
            fK_ChartOfAccounts_ID: "", // Add chart of accounts ID if available
            voucherDetailsInp: items.map(item => ({
                fK_ChartOfAccounts_ID: "", // Add chart of accounts ID for each item if available
                fK_CostCenter_ID: "", // Add cost center ID for each item if available
                debitAmount: item.amount,
                creditAmount: 0, // Assuming this should be 0 for debit transactions
                detailNarration: item.description,
                fK_DiscountPolicy_ID: "", // Add discount policy ID for each item if available
                fK_DiscountPolicySlabs_ID: "", // Add discount policy slabs ID for each item if available
                fK_DiscountPolicyCollectionSlabs_ID: "" // Add discount policy collection slabs ID for each item if available
            }))
        };
    
        try {
            
            const response = await axios.post(apiUrl, apiData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.status === 200) {
                alert('Data submitted successfully.');
                setItems([]); 
            } else {
                alert('Failed to submit data.');
            }
        } catch (error) {
            alert('An error occurred while submitting data.');
            console.error('Error:', error);
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
                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}> Submit</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, marginTop: 5 }}>Enter Amount:</Text>
            <TextInput
                style={{ height: 45, backgroundColor: '#f0f0f0', marginBottom: 10, borderRadius: 20, paddingLeft: 10 }}
                onChangeText={text => setAmount(text)}
                value={amount}
                keyboardType="numeric"
            />
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
        </View >
    );
};

export default Form;
