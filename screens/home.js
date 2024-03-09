import { StyleSheet, Text, View } from 'react-native';
import React from 'react';



const Home = () => {

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Welcome</Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333333',
  },
});
