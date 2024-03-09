import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const App = () => {
  const navigation = useNavigation(); // Use the useNavigation hook to access the navigation object
  const [email, setEmail] = useState('it@topsungroup.pk');
  const [password, setPassword] = useState('Ba@leno99');

  const handleLogin = async () => {
    // Call your backend API to authenticate the user
    const userCredentials = {
        email: email,
        password: password,
      };
  

      try {
        const result = await axios.post(
          `http://65.21.231.76:2020/api/Account/login`,
          userCredentials,
        );
  
        console.log(result.data);

      if (result.data.responseCode == 1000) {
        // Handle successful login
        // Alert.alert('Success', 'Logged in successfully');
        AsyncStorage.setItem('AccessToken', result.data.data.token);
        console.log(result.data.data.token)
        navigation.navigate('Root'); // Use the navigation object to navigate to the 'Home' screen
      } else {
        // Handle failed login
        Alert.alert('Error', 'Invalid username or password');

      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Top Sun</Text>
        <Text style={styles.comtitle}>Communication App</Text>
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
      
         <TextInput
        style={styles.inputf}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={true}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.inputs}
        placeholder="Enter password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}> Sign In</Text>
      </TouchableOpacity>
      <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
        
      </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7393B3",
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "white",
    alignSelf: "center",
    marginTop: 50
  },
  comtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "white",
    alignSelf: "center",
    
  },
  inputf: {
    backgroundColor: "#F6F7FB",
    height: 50,
    marginBottom: 10,
    fontSize: 16,
    borderRadius: 30,
    padding: 12,
    marginTop:250
    
  },
  inputs: {
    backgroundColor: "#F6F7FB",
    height: 50,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 30,
    padding: 12,
    
  },
  backImage: {
    width: "100%",
    height: 340,
    position: "absolute",
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '50%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#7393B3',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default App;