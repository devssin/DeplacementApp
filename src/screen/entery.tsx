import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { IndexStackNavigatorProps } from '../types/routesT'
import { Image } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { verifyToken } from '../hooks/verifyToken'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Entery : React.FC<IndexStackNavigatorProps> = ({route, navigation}) => {

    const checkLogin = async () => {
        
        verifyToken().then(res => {
          if (res) {
            navigation.navigate('deplacement'); 
          }else{
            navigation.navigate('index');
          }
        });
        
    };

    useEffect(() => {
        setTimeout(() => {
            checkLogin();
        }, 2000);

    }, []);
    
  return (
    <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}>
      <Image source={require('../assets/logo.com.png')} />
      <ActivityIndicator size="large" color="#0000ff" />

    </View>
  )
}

export default Entery