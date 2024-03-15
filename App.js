import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, Button, Modal } from 'react-native';
import { DrawerItemList, } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import LocationScreen from './screens/location';
import FormScreen from './screens/form';
import User from './assets/user.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // Import image picker


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();



// Styles
const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    backgroundColor: '#7393B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  drawerSubText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  drawerItemSeparator: {
    borderBottomColor: '#f4f4f4',
    borderBottomWidth: 1,
  },
  drawerBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});



function CustomDrawerContent(props) {
  const [fName, setFName] = useState('');
  const [email, setEmail] = useState('');
  const [lname, setLName] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [imgUrl, setImgUrl] = useState('')
  const [area, setArea] = useState([]);


  const navigation = useNavigation(); // Use the useNavigation hook to access the navigation object

  const onPressHandler = () => {
    navigation.navigate('Location'); // Navigate to LocationScreen by specifying its name
  };

  const pickImage = async () => {
    const token = await AsyncStorage.getItem('AccessToken');
    const empId = await AsyncStorage.getItem('employeeID');

    let imageUpload = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    });

    if (!imageUpload.canceled) {
      AsyncStorage.setItem('picuri', imageUpload.assets[0].uri)
      AsyncStorage.setItem('picname', imageUpload.assets[0].uri.split('/').pop())
      AsyncStorage.setItem('pictype', 'image/jpg')
      setModalVisible(false)
      const picuri = await AsyncStorage.getItem('picuri');
      const picname = await AsyncStorage.getItem('picname');
      const pictype = await AsyncStorage.getItem('pictype');

      if (picuri !== '' && picname !== '' && pictype !== '') {
        const picData = new FormData();
        picData.append('FK_Employee_ID', empId);
        picData.append('files', {
          uri: picuri,
          name: picname,
          type: pictype
        });

        try {
          console.log(picuri)
          console.log(picname)
          console.log(pictype)
          console.log(token)
          const respo = await axios.post(`https://slcloudapi.cloudstronic.com/api/Employee/AddEmployeeImageAsync`, picData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 15000 // Set a timeout of 5 seconds
          });

          if (respo.status === 200) {
            alert('Image Uploaded');
            setImgUrl(picuri)


          } else {
            alert(respo.message);
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      } else {
        alert('Error uploading image')
      }

    }

  };

  useEffect(() => {
    const fetchName = async () => {
      try {
        const fname = await AsyncStorage.getItem('firstName');
        const lname = await AsyncStorage.getItem('lastName');
        const email = await AsyncStorage.getItem('email');
        const img = await AsyncStorage.getItem('imageURL');

        setFName(fname);
        setLName(lname);
        setEmail(email);
        setImgUrl(img);


        console.log('Image URL:', img);
      } catch (error) {
        console.error('Error fetching firstName:', error);
      }
    };

    fetchName();
  }, []);


  useEffect(() => {
    const fetchAreaCoordinates = async () => {
      try {
        const body = {
          skip: 0,
          take: 100,
          page: 1,
          pageSize: 100
        }
        const token = await AsyncStorage.getItem('AccessToken');
        const response = await axios.post(
          'https://slcloudapi.cloudstronic.com/api/Map/Get', body,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        // console.log("Response:", response);
        const responseData = response.data;
        // console.log("Response Data:", responseData);
        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          const coordinates = responseData.data[0].mapCoordinates; // Assuming coordinates are inside mapCoordinates property
          // console.log(coordinates)
          setArea(coordinates.map(coord => ({ fK_Map_ID: coord.fK_Map_ID, latitude: coord.latitude, longitude: coord.longitude })));
          console.log(area)
        } else {
          console.error("Data format is not as expected:", responseData);
          setErrorMsg("Data format is not as expected");
        }
      } catch (error) {
        console.error("Error fetching area coordinates:", error);
        setErrorMsg("Error fetching area coordinates");
      }
    }; fetchAreaCoordinates();
  }, [])



  return (
    <SafeAreaView>
      <ImageBackground source={require('./assets/bg.jpg')} style={styles.drawerHeader}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {imgUrl ? (
            <Image source={{ uri: imgUrl }} style={{ height: 80, width: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2, borderColor: 'black', backgroundColor: 'white' }} resizeMode='contain' />
          ) : (
            <Image source={User} style={{ height: 80, width: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2, borderColor: 'black', backgroundColor: 'white' }} resizeMode='contain' />
          )}
        </TouchableOpacity>
        <Text style={styles.drawerHeaderText}>{fName} {lname}</Text>
        <Text style={styles.drawerSubText}>{email}</Text>
      </ImageBackground>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20 }}>
            <TouchableOpacity onPress={pickImage} style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 18 }}>Upload Image</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={uploadFromGallery} style={{ paddingVertical: 10 }}>
                            <Text style={{ fontSize: 18 }}>Upload from Gallery</Text>
                        </TouchableOpacity> */}
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={{ paddingVertical: 10 }}>
              <Text style={{ fontSize: 18, color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DrawerItemList {...props} />

      {area.length > 0 ? <View style={{ padding: 5, borderTopWidth: 2, borderTopColor: "#ccc", marginLeft: 10 }}>
        <TouchableOpacity onPress={onPressHandler} style={{ paddingVertical: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 'bold',
                marginLeft: 5,
              }}
            >
              My Location
            </Text>
          </View>
        </TouchableOpacity>
      </View> : <View></View>}


    </SafeAreaView>
  );
}


function Root() {
  const [data, setData] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('AccessToken');
        // const token = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWdhaGlpQGdtYWlsLmNvbSIsImp0aSI6ImQxM2U4NjJiLWExNGYtNDFmNy04MWVjLWQwMWNhMTU0OTg5NyIsImV4cCI6MTcxMDAyMTg3OSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMjIiLCJhdWQiOiJVc2VyIn0.SVkTuTLsSs4FfZGtBy-vUOpYLeMkp9KvBUiT1tikmr0"; // Your token here
        const response = await axios.get(
          'https://slcloudapi.cloudstronic.com/api/VoucherManagerMaster/GetUserWiseFixedMenuList',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#F2F2F2',
          width: 250,

        },
        headerStyle: {
          backgroundColor: '#7393B3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerLabelStyle: {
          color: '#333',
          fontSize: 16,
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      {
        data.map(screen => (
          <Drawer.Screen
            key={screen.id}
            name={screen.voucherName}
          >
            {() => <FormScreen screenId={screen.id} />}
          </Drawer.Screen>
        ))
      }

      {/* <Drawer.Screen name="My Location" component={LocationScreen} /> */}
    </Drawer.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{
          title: 'Login',
          headerStyle: {
            backgroundColor: '#7393B3',
          },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen name="Location" component={LocationScreen} options={{
          title: 'My Location',
          headerStyle: {
            backgroundColor: '#7393B3',
          },
          headerTintColor: '#fff',
        }} />

        <Stack.Screen name="Root" component={Root} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
