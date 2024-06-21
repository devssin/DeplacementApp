import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddDetails: any = ({
  setShow,
  idDep,
  details,
  setDetails,
  setTotalG,
  setSousTotal,
  datePrevue,
}: any) => {
  const slide = useRef(new Animated.Value(0)).current;
  const libelles = [
    { nom: "Hotel" },
    { nom: "Petit Déjeuné" },
    { nom: "Repas" },
    { nom: "Deplacement / Auto Car" },
    { nom: "Carburants" },
    { nom: "Parking" },
    { nom: "Divers (Frais Voiture Et Sejours)" },
  ];
  const slideUp = () => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const slideDown = () => {
    Animated.timing(slide, {
      toValue: 700,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    slideDown();
    setShow(false);
  };
  useEffect(() => {
    slideUp();
  }, []);

  const [selectedLibele, setSelectedLibele] = useState("");
  const [dateDep, setDateDep] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [showPickerDep, setShowPickerDep] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const [montant, setMontant] = useState(0);
  const [nom, setNom] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const toggelPickerDep = () => {
    setShowPickerDep(!showPickerDep);
  };
  const toggelPickerFin = () => {
    setShowPickerFin(!showPickerFin);
  };
  const hadleChangePickerDep = ({ type }: any, date: any) => {
    if (type === "set") {
      setDateDep(date);
      setDateFin(date);
    }
    toggelPickerDep();
  };
  const hadleChangePickerFin = ({ type }: any, date: any) => {
    if (type === "set") {
      setDateFin(date);
    }
    toggelPickerFin();
  };

  const handleAddDetail = async () => {
    if(selectedLibele === "") {
      setError(true);
      setErrorMessage("Le libelle est obligatoire");
      return;
    }
    if(montant === 0) {
      setError(true);
      setErrorMessage("Le montant est obligatoire");
      return;
    }

    if(datePrevue > dateDep) {
      setError(true);
      setErrorMessage("La date de debut ne doit pas etre inferieur a la date de deplacement");
      return;
    }

    if(dateDep > dateFin) {
      setError(true);
      setErrorMessage("La date de debut ne doit pas etre superieur a la date de fin");
      return;
    }
    const token = await AsyncStorage.getItem("userToken");
    const data = {
      libelle: selectedLibele,
      nom: nom,
      dateDep: dateDep,
      dateFin: dateFin,
      montant: montant,
      idDep: idDep,
    };
    
    const response = await fetch(
      `http://10.0.0.31:8075/note-de-frais-api/api/fraisDepDetails/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    
    const json = await response.json();
    

    if (response.status !== 200) {
      return;
    }
    console.log(json);

    setDetails([...details, json.data]);
    setSousTotal(json.sousTotal);
    setTotalG(json.totalG);
    closeModal();
  };

  return (
    <Pressable onPress={() => closeModal()} style={styles.backdrop}>
      <Animated.View style={styles.bottomSheet}>
        <Text style={{ fontSize: 15, fontWeight: "bold", textAlign: "center" , color:"black"}}>
          Ajouter Detail
        </Text>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "700" , color:"black" }}>Libele</Text>
          <Dropdown
            data={libelles}
            labelField={"nom"}
            valueField={"nom"}
            value={selectedLibele}
            onChange={(item: any) => setSelectedLibele(item.nom)}
            placeholder={"Selectioner une libelle"}
            style={styles.dropdown}
            searchField="nom"
            searchPlaceholder="Chercher une libelle"
            inputSearchStyle={{ color: "black" }}
          />
          <Text style={{ fontWeight: "700", marginTop: 10, color:"black" }}>Nom</Text>

          <TextInput
            onChangeText={(text) => setNom(text)}
            style={styles.input}
          />

          <Text style={{ fontWeight: "700", marginTop: 10 , color:"black"}}>Date Debut</Text>
          <Pressable onPress={toggelPickerDep}>
            <TextInput
              style={styles.input}
              value={dateDep.toLocaleDateString()}
              editable={false}
            />
          </Pressable>
          {showPickerDep && (
            <DateTimePicker
              mode="date"
              value={dateDep}
              display="spinner"
              onChange={hadleChangePickerDep}
            />
          )}
          <Text style={{ fontWeight: "700", marginTop: 10 , color:"black"}}>Date Fin</Text>
          <Pressable onPress={toggelPickerFin}>
            <TextInput
              style={styles.input}
              value={dateFin.toLocaleDateString()}
              editable={false}
            />
          </Pressable>
          {showPickerFin && (
            <DateTimePicker
              mode="date"
              value={dateFin}
              display="spinner"
              onChange={hadleChangePickerFin}
            />
          )}

          <Text style={{ fontWeight: "700", marginTop: 10, color:"black" }}>Montant</Text>

          <TextInput
            keyboardType="numeric"
            onChangeText={(text) => setMontant(Number(text))}
            style={styles.input}
          />

          {error && (
            <Text style={{ color: "red", marginTop: 10, textAlign: "left" }}>
              {errorMessage}
            </Text>
          )}
          <Pressable style={styles.button} onPress={handleAddDetail}>
            <Text style={{ color: "white" }}>Ajouter</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default AddDetails;

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    backgroundColor: "transparent",
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 5,
    marginTop: 10,
    padding: 5,
    color: "black",
  },
  backdrop: {
    position: "absolute",
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    width: "100%",
    height: "80%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    color: "black",
    borderColor: "#bcbcbc",
    paddingHorizontal: 15,
    marginTop: 10,
    
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#d32f2f",
    alignItems: "center",
    marginTop: 15,
  },
});
