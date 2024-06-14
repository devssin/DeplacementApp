import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';

// routes type import
import {RootScreenRoutesT} from '../types/routesT';

// screen imports
import Index from '../screen/index';
import Deplacement from '../screen/deplacement';
import AddDeplacement from '../screen/addDeplacement';
import Entery from '../screen/entery';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    border: 'transparent',
  },
};

const Stack = createNativeStackNavigator<RootScreenRoutesT>();

export const StackNavigator: React.FC = () => {


  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen
          name="entery"
          component={Entery}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="index"
          component={Index}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="deplacement"
          component={Deplacement}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="addDeplacement"
          component={AddDeplacement}
          options={({route}) => ({
            title: `Ajouter un déplacement`,
            headerStyle: {
              backgroundColor: '#d32f2f',
              shadowColor: '#f9fafd',
              elevation: 0,
            },
            headerTintColor: '#fff',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
