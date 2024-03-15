import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchFirstName = async () => {
      try {
        const firstNameFromStorage = await AsyncStorage.getItem('firstName');
        if (firstNameFromStorage !== null) {
          setFirstName(firstNameFromStorage);
        }
      } catch (error) {
        console.error('Error fetching firstName:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstName();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {firstName}</Text>
    </View>
  );
};

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
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default Home;
