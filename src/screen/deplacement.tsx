import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  Alert,
} from 'react-native';
import {verifyToken} from '../hooks/verifyToken';
import {DataTable, Text} from 'react-native-paper';
import {ScrollView} from 'react-native';
import {DeplacementStackNavigatorProps} from '../types/routesT';
import {Image} from 'react-native';
import {useIsFocused} from '@react-navigation/native';

const Deplacement: React.FC<DeplacementStackNavigatorProps> = ({
  route,
  navigation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [frais, setFrais] = useState<Array<any>>([]);
  const [page, setPage] = useState<number>(0);
  const [numberOfItemsPerPageList] = useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0],
  );

  const focus = useIsFocused();

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  useEffect(() => {
    setIsLoading(true);
    const handleBackPress = () => {
      if (navigation.isFocused()) {
        Alert.alert('Quitter', 'Voulez vous quitter l\'application ?', [
          {
            text: 'Non',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Oui',
            onPress: () => {
              AsyncStorage.clear()
                .then(() => {
                  BackHandler.exitApp();
                })
                .catch(error => {
                  console.error('Error clearing AsyncStorage:', error);
                });
            },
          },
        ]);
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  useEffect(() => {
    const checkTokenAndFetchData = async () => {
      const isValidToken = await verifyToken();

      if (!isValidToken) {
        navigation.navigate('index');
        return;
      }

      fetchData();
    };

    if (focus) {
      checkTokenAndFetchData();
    }
  }, [focus]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        throw new Error('Token is invalid or not found');
      }

      const response = await fetch(
        `http://10.0.0.31:8075/note-de-frais-api/api/frais/list?categorie=deplacement`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const json = await response.json();

      setFrais(json);
    } catch (error) {
      setFrais([]); // Ensure frais is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token === null || token === undefined || token === '') {
        return false;
      }
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
      return false;
    }
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    const paddingToBottom = 10;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  return (
    <View style={{ flex: 1 }}>
    <View
      style={{
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#d32f2f',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
      }}
    >
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '900' }}>
        Deplacement
      </Text>
    </View>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: 'white',
          minHeight: '100%',
          position: 'relative',
        }}
      >
        <View style={{ elevation: 2 }}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#d32f2f" />
          ) : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title>Montant</DataTable.Title>
                <DataTable.Title>Motif</DataTable.Title>
              </DataTable.Header>

              {frais.map((f) => (
                <DataTable.Row
                  style={{
                    backgroundColor:
                      f.etat === 'demande_avance'
                        ? '#81e6fc'
                        : f.etat === 'envoye'
                        ? '#7fc994'
                        : '#f7c99e',
                  }}
                  key={f.id}
                  onPress={() =>
                    navigation.navigate('addDeplacement', {
                      id: f.id,
                      deplacements: frais,
                    })
                  }
                >
                  <DataTable.Cell>{f.datePrevue}</DataTable.Cell>
                  <DataTable.Cell>{f.totalG}</DataTable.Cell>
                  <DataTable.Cell>{f.motif}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          )}
        </View>
      </View>
    </ScrollView>
    <Pressable
      style={styles.floatingButton}
      onPress={() => navigation.navigate('addDeplacement')}
    >
      <Image source={require('../assets/plus-white-icon.png')} />
    </Pressable>
  </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute', 
    bottom: 20,           
    right: 20,            
    height: 50,           
    width: 50,            
    borderRadius: 25,     
    backgroundColor: '#d32f2f',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
});

export default Deplacement;
