import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, Button } from 'react-native';
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
    marginBottom: 10,
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
  const navigation = useNavigation(); // Use the useNavigation hook to access the navigation object

  const onPressHandler = () => {
    navigation.navigate('Location'); // Navigate to LocationScreen by specifying its name
  };

  return (
    <SafeAreaView>
      <ImageBackground source={require('./assets/bg.jpg')} style={styles.drawerHeader}>
        <Image source={User} style={{ height: 80, width: 80, borderRadius: 40, marginBottom: 10 }} />
        <Text style={styles.drawerHeaderText}>Ali Ali</Text>
        <Text style={styles.drawerSubText}>it@topsungroup.pk</Text>
      </ImageBackground>

      {/* <View style={styles.drawerItemSeparator} /> */}
      <DrawerItemList {...props} />
      {/* <View style={styles.drawerItemSeparator} /> */}
      <View style={{ padding: 5, borderTopWidth: 2, borderTopColor: "#ccc", marginLeft: 10 }}>
        <TouchableOpacity onPress={onPressHandler} style={{ paddingVertical: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* <Ionicons name="share-social-outline" size={22} /> */}
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

      </View>


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
          'http://65.21.231.76:2020/api/VoucherManagerMaster/GetUserWiseFixedMenuList',
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
            component={() => <FormScreen screenId={screen.id} />}
          />
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
