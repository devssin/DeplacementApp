import React, { useEffect, useRef, useState } from 'react';
import 'react-native-gesture-handler';
// import {SafeAreaView, Text} from 'react-native';
import {StackNavigator} from './src/navigation/StackNavigator';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App(): React.JSX.Element {

  const [isUploading, setIsUploading] = useState(false);
  const isUploadingRef = useRef(isUploading);
  
  useEffect(() => {
    isUploadingRef.current = isUploading;
  }, [isUploading]);


  useEffect(() => {
    const handleAppStateChange = async (nextAppState : any) => {
      
      if ( nextAppState === 'background' && !isUploadingRef.current) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
      }
      
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <>
      <StackNavigator setIsUploading={setIsUploading}/>
    </>
  );
}

export default App;