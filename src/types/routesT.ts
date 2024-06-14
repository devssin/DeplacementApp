import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
export type RootScreenRoutesT = {
  entery  : undefined;
  index: undefined;
  addDeplacement: {id: number; deplacements: Array<any>} | undefined;
  deplacement: undefined;

};

export interface AddDeplacementStackNavigatorProps {
  route: RouteProp<RootScreenRoutesT, 'addDeplacement'>;
  navigation: StackNavigationProp<RootScreenRoutesT, 'addDeplacement'>;
}

export interface IndexStackNavigatorProps {
  route: RouteProp<RootScreenRoutesT, 'index'>;
  navigation: StackNavigationProp<RootScreenRoutesT, 'index'>;
}

export interface DeplacementStackNavigatorProps {
  route: RouteProp<RootScreenRoutesT, 'deplacement'>;
  navigation: StackNavigationProp<RootScreenRoutesT, 'deplacement'>;
}

export interface EnteryStackNavigatorProps {  
  route: RouteProp<RootScreenRoutesT, 'entery' >;
  navigation: StackNavigationProp<RootScreenRoutesT, 'entery'>;
}
