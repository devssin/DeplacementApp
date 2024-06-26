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
interface StackNavigatorProps {
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Stack = createNativeStackNavigator<RootScreenRoutesT>();

export const StackNavigator: React.FC<StackNavigatorProps> = ({
  setIsUploading,
}) => {
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
          options={{
            title: 'Ajouter un déplacement',
            headerStyle: {
              backgroundColor: '#d32f2f',
              shadowColor: '#f9fafd',
              elevation: 0,
            },
            headerTintColor: '#fff',
          }}>
          {(props: any) => (
            <AddDeplacement {...props} setIsUploading={setIsUploading} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};
