import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import FenceMap from './FenceMap'; // Import the FenceMap component
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const App = () => {
  const [fences , setFences] = useState([])
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
        console.log(responseData.data)
        setFences(responseData.data)

      } catch (error) {
        console.error("Error fetching area coordinates:", error);
        setErrorMsg("Error fetching area coordinates");
      }
    };
    fetchAreaCoordinates();
  }, [])
  


  // Dummy data similar to the API response
  

  return (
    <SafeAreaView style={styles.container}>
      <FenceMap fences={fences} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;