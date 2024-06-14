import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
// import {SafeAreaView, Text} from 'react-native';
import {StackNavigator} from './src/navigation/StackNavigator';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App(): React.JSX.Element {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState : any) => {
      
      if ( nextAppState === 'background' ) {
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
      <StackNavigator />
    </>
  );
}

export default App;