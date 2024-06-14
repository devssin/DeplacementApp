import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useEffect, useState} from 'react';
import DocumentPicker from 'react-native-document-picker';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
  Image,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';

import AddDetails from '../components/addDetails';
import {MultiSelect} from 'react-native-element-dropdown';
import {DataTable} from 'react-native-paper';
import {Float} from 'react-native/Libraries/Types/CodegenTypes';
import {AddDeplacementStackNavigatorProps} from '../types/routesT';
import {jwtDecode} from 'jwt-decode';
import {decode as atob} from 'base-64';

global.atob = atob;

const AddDeplacement = ({
  route,
  navigation,
}: AddDeplacementStackNavigatorProps) => {
  const [loading, setLoading] = useState(false);
  const id = route.params?.id || 0;
  const [user, setUser] = useState<Record<string, any>>({});

  const [frasiDetails, setFraisDetails]: any = useState([]);

  const [fraisId, setFraisId]: any = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(false);
  const [villes, setVilles] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedUser, setSelectedUser]: any = useState(null);
  const [selectedDestinations, setSelectedDestinations]: Array<any> = useState(
    [],
  );
  const [motif, setMotif] = useState('');
  const [kilometrage, setKilometrage] = useState<number>(0);
  const [fraisKilo, setFraisKilo] = useState<number>(0);
  const [totalG, setTotalG] = useState<number>(0);
  const [montantAvance, setMontantAvance] = useState<number>(0);

  const [fraisJoints, setFraisJoints]: any = useState([]);
  const [sousTotal, setSousTotal] = useState(0);
  const [etat, setEtat] = useState('ouvert');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggelPicker = () => {
    setShowPicker(!showPicker);
  };

  const handleUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: ['*/*'], // Allow selecting any type of file
      });

      const formData = new FormData();
      formData.append('file', {
        uri:
          Platform.OS === 'android' ? res.uri : res.uri.replace('file://', ''),
        name: res.name,
        type: res.type,
      });
      formData.append('fraisId', fraisId);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `http://10.0.0.31:8075/note-de-frais-api/api/file/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const json = await response.json();
      if (response.status !== 200) {
        console.error(json.message);
        return;
      }
      setFraisJoints([...fraisJoints, json.file]);
      ToastAndroid.show('Fichier attacher avec succés', ToastAndroid.LONG);
      return;
    } catch (error) {
      console.error('Error while selecting file: ', error);
    }
  };

  const fetchVilles = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(
      `http://10.0.0.31:8075/note-de-frais-api/api/villes/list`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const json = await response.json();
    if (response.status !== 200) {
      return;
    }

    setVilles(json.villes);
  };

  const hadleSubmit = async (status: string) => {
    setSubmitted(true);

    const token = await AsyncStorage.getItem('userToken');
    const idModif = id > 0 ? id : fraisId;
    const data = {
      datePrevue: date,
      emplyeId: selectedUser,
      destination: selectedDestinations.map((d: any) => d).join(','),
      motif: motif,
      kilometrage: kilometrage,
      fraisKilo: fraisKilo,
      totalG: totalG,
      montant_avance: montantAvance,
      etat: status == 'ouvert' ? etat : status,
      categorie: 'deplacement',
    };

    if (date == null) {
      setError(true);
      setErrorMessage('La date est obligatoire');
      return;
    }

    if (status == 'envoye' && selectedDestinations.length == 0) {
      setError(true);
      setErrorMessage('Destination est obligatoire');
      return;
    }
    if (status == 'demande_avance' && montantAvance == 0) {
      setError(true);

      setErrorMessage("Montant d'avance est obligatoire");
    }
    if (status == 'demande_avance' && motif == '') {
      setError(true);
      setErrorMessage('Motif est obligatoire');
      return;
    }

    setEtat(status);
    

    const response = await fetch(
      `http://10.0.0.31:8075/note-de-frais-api/api/frais/${
        idModif > 0 ? 'update?id=' + idModif : 'add'
      }`,
      {
        method: idModif > 0 ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );

    const json = await response.json();

    if (response.status != 200) {
      ToastAndroid.show(json.message, ToastAndroid.LONG);
      return;
    }
    if (status == 'ouvert') {
      const lastId = id > 0 ? id : json.id;

      setFraisId(lastId);
      ToastAndroid.show('Opération effectué avec succés', ToastAndroid.LONG);
      return;
    }

    if (status == 'demande_avance') {
      ToastAndroid.show('Opération effectué avec succés', ToastAndroid.LONG);
      navigation.navigate('deplacement');
      return;
    }

    ToastAndroid.show('Opération effectué avec succés', ToastAndroid.LONG);
    navigation.navigate('deplacement');
  };

  const handleKilometrage = (text: any) => {
    if (isNaN(kilometrage)) return;
    const fraisK: Float = kilometrage * 3.5;
    setFraisKilo(fraisK);

    const total: number = Number(sousTotal) + Number(fraisK);
    setTotalG(total);
  };

  const fetchFrais = async () => {
    if (id > 0) {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `http://10.0.0.31:8075/note-de-frais-api/api/frais/consulte?id=${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );
      const json = await response.json();

      if (response.status !== 200) {
        return;
      }

      const {frais} = json;

      if (frais == null) return;
      setDate(new Date(frais.datePrevue));
      setSelectedUser(frais.emplyeId);
      setSelectedDestinations(frais.destination.split(','));
      setMotif(frais.motif);
      setKilometrage(frais.kilometrage);
      setFraisKilo(frais.fraisKilo);
      setEtat(frais.etat);
      setTotalG(frais.totalG);
      setMontantAvance(frais.montant_avance);
      setSousTotal(frais.sousTotal);
    }
  };

  const hadleChangePicker = ({type}: any, date: any) => {
    if (type === 'set') {
      setDate(date);
    }
    toggelPicker();
  };

  const fetchJoints = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `http://10.0.0.31:8075/note-de-frais-api/api/frais_joints/list?idFrais=${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const joints = await response.json();

      if (response.status !== 200) {
        return;
      }
      setFraisJoints(joints);
    } catch (exeption: any) {
      console.error(exeption);
    }
  };

  const fetchFraisDetails = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(
      `http://10.0.0.31:8075/note-de-frais-api/api/fraisdepdetails/list?idDep=${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const details = await response.json();

    if (response.status !== 200) {
      return;
    }
    setFraisDetails(details);
  };
  const handleDelete = async (iddetail: number, idDep: number) => {
    const detaiId = iddetail;
    const idFrais = idDep;
    Alert.alert('Suppression', 'Voulez-vous vraiment supprimer ce detail ?', [
      {
        text: 'Annuler',
        onPress: () => {},
      },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch(
              `http://10.0.0.31:8075/note-de-frais-api/api/fraisdepdetails/delete?id=${detaiId}&idDep=${
                fraisId > 0 ? fraisId : id
              }`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            const json = await response.json();
            if (response.status !== 200) {
              ToastAndroid.show('Operation echoué', ToastAndroid.LONG);
              return;
            }

            setFraisDetails((f: any) => f.filter((d: any) => d.id !== detaiId));
            setTotalG(json.totalG);
            setSousTotal(json.sousTotal);
            ToastAndroid.show(
              'Détail supprimer avec succés',
              ToastAndroid.LONG,
            );
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const decode = async () => {
    try {
      const token = (await AsyncStorage.getItem('userToken')) || '';
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
    } catch (error) {
      console.error('Error fetching token:', error);
      return;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      decode();
      await fetchVilles();
      if (id > 0) {
        await fetchFrais();
        await fetchFraisDetails();
        await fetchJoints();
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
      }}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="blue"
          style={{alignSelf: 'center'}}
        />
      ) : (
        <View style={{paddingBottom: 30}}>
          <View style={styles.flex}>
            <Text style={styles.headerTitle}>Nom Et Prenom :</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '400',
              }}>
              {user.fullname}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.headerTitle}>Service :</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '400',
              }}>
              {user.departement}
            </Text>
          </View>

          <View>
            <Text style={styles.labelStyle}>Date :</Text>
            <Pressable disabled={etat != 'ouvert'} onPress={toggelPicker}>
              <TextInput
                style={styles.input}
                value={date.toLocaleDateString()}
                editable={false}
              />
            </Pressable>
            {showPicker && (
              <DateTimePicker
                mode="date"
                value={date}
                display="default"
                onChange={hadleChangePicker}
              />
            )}
          </View>

          <View>
            <Text style={styles.labelStyle}>Destination :</Text>
            <MultiSelect
              disable={etat != 'ouvert'}
              data={villes}
              labelField={'ville'}
              valueField={'ville'}
              value={selectedDestinations}
              onChange={(item: any) =>
                setSelectedDestinations(item.map((i: any) => i) as any)
              }
              placeholder={'Selectioner Ville'}
              style={styles.dropdown}
              search
              searchField="ville"
              inputSearchStyle={styles.inputSearchStyle}
              searchPlaceholder="Chercher une ville"
            />
          </View>

          <View>
            <Text style={styles.labelStyle}>Motif :</Text>
            <TextInput
              style={[styles.input, {height: 60}]}
              multiline
              numberOfLines={3}
              onChangeText={(text: any) => setMotif(text)}
              value={motif}
              editable={etat == 'ouvert'}
            />
          </View>
          <View>
            <Text style={styles.labelStyle}>Montant d'avance :</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={text => setMontantAvance(Number(text))}
              value={isNaN(montantAvance) ? '0' : montantAvance.toString()}
              editable={id == 0 || montantAvance == 0 || etat == 'ouvert'}
            />
          </View>

          <View>
            <Text style={styles.labelStyle}>Kilometrage :</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={text => setKilometrage(Number(text))}
              onBlur={handleKilometrage}
              value={isNaN(kilometrage) ? '0' : kilometrage.toString()}
              editable={etat != 'envoye'}
            />
          </View>
          <View style={[styles.flex, {justifyContent: 'space-between'}]}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <Text style={styles.labelStyle}>Frais Kilometrage :</Text>
              <Text style={{fontSize: 13, fontWeight: '400', color: 'black'}}>
                {fraisKilo ? fraisKilo.toString() : 0}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
              <Text style={styles.labelStyle}>Total Generale :</Text>
              <Text style={{fontSize: 13, fontWeight: '400', color: 'black'}}>
                {totalG}
              </Text>
            </View>
          </View>
          {error && (
            <Text style={{color: 'red', marginTop: 10, textAlign: 'left'}}>
              {errorMessage}
            </Text>
          )}
          {(id > 0 || fraisId > 0) && etat != 'envoye' && (
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Pressable
                onPress={() => setShow(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <Image source={require('../assets/plus-blue-icon.png')} />
                <Text style={{color: 'blue', textAlign: 'center'}}>
                  Ajouter Details
                </Text>
              </Pressable>

              <Pressable
                onPress={handleUpload}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <Image source={require('../assets/folder-icon.png')} />
                <Text style={{color: 'blue', textAlign: 'center'}}>
                  Attacher un documenet
                </Text>
              </Pressable>
            </View>
          )}

          {frasiDetails.length > 0 && (
            <View>
              <Text style={styles.labelStyle}>Details :</Text>

              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Libelle</DataTable.Title>
                  <DataTable.Title>Montant</DataTable.Title>
                  <DataTable.Title>action</DataTable.Title>
                </DataTable.Header>

                {frasiDetails.map((f: any, index: any) => (
                  <>
                    <DataTable.Row key={f.id} onPress={() => {}}>
                      <DataTable.Cell>{f.libelle}</DataTable.Cell>

                      <DataTable.Cell>{f.montant}</DataTable.Cell>
                      <DataTable.Cell>
                        {etat != 'envoye' && (
                          <Pressable
                            onPress={() => {
                              handleDelete(f.id, f.idDep);
                            }}>
                            <Image
                              source={require('../assets/trash-icon.png')}
                              style={{width: 25, height: 25}}
                            />
                          </Pressable>
                        )}
                      </DataTable.Cell>
                    </DataTable.Row>
                  </>
                ))}
                <DataTable.Row>
                  <DataTable.Cell textStyle={{fontWeight: 'bold'}}>
                    Sous Total
                  </DataTable.Cell>
                  <DataTable.Cell> </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{fontWeight: 'bold', fontSize: 15}}>
                    {sousTotal}
                  </DataTable.Cell>
                </DataTable.Row>
              </DataTable>
            </View>
          )}

          {fraisJoints.length > 0 && (
            <View>
              <Text style={styles.labelStyle}>Frais Joints :</Text>
              {fraisJoints.map((f: any) => (
                <Pressable
                  key={f.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 10,
                    backgroundColor: 'gray',

                    marginTop: 10,
                  }}
                  onPress={() => {
                    Linking.openURL(
                      `http://10.0.0.31:8075/note-de-frais-api/data/frais_joints/${f.source}`,
                    );
                  }}>
                  <Text style={{color: 'white'}}>{f.nom_ficher}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.flex}>
            {etat != 'envoye' && (
              <>
                <Pressable
                  style={styles.saveBtn}
                  onPress={() => hadleSubmit('ouvert')}>
                  <Text style={{color: 'white'}}>Enregistrer</Text>
                </Pressable>
                {totalG > 0 && (
                  <Pressable
                    style={styles.sendBtn}
                    onPress={() => hadleSubmit('envoye')}>
                    <Text style={{color: 'white'}}>Envoyer</Text>
                  </Pressable>
                )}
              </>
            )}
            {(id == 0 || etat == 'ouvert') && (
              <Pressable
                style={styles.requestBtn}
                onPress={() => hadleSubmit('demande_avance')}>
                <Text style={{color: 'white'}}>Demande D'avance</Text>
              </Pressable>
            )}
          </View>

          {show && (
            <AddDetails
              setShow={setShow}
              idDep={fraisId > 0 ? fraisId : id}
              details={frasiDetails}
              setDetails={setFraisDetails}
              setTotalG={setTotalG}
              setSousTotal={setSousTotal}
              datePrevue={date}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default AddDeplacement;

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    minHeight: '100%',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  flex: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },

  labelStyle: {
    color: 'black',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
    padding: 10,
    marginTop: 10,
    width: '100%',
    borderRadius: 5,
  },
  dropdown: {
    height: 50,
    backgroundColor: 'transparent',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 5,
    marginTop: 10,
    padding: 10,
    color: 'black',
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: 'black',
  },
  saveBtn: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestBtn: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
  },
  toastText: {
    fontSize: 10,
  },
});
