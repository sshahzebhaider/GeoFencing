import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerStyle: {backgroundColor: '#7393B3' }, headerTitleStyle: {
            fontWeight: 'bold', color: "white", 
          } }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerStyle: {backgroundColor: '#7393B3' }, headerTitleStyle: {
            fontWeight: 'bold', color: "white", 
          } }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
