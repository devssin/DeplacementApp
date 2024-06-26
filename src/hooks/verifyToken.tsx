import AsyncStorage from "@react-native-async-storage/async-storage";

export const verifyToken = async () => {
  const token = await AsyncStorage.getItem("userToken");
  if (token === null || token === undefined || token === "") {
    return false;
  }
  
  const res = await fetch(
    "http://10.0.0.31:8075/note-de-frais-api/api/authentification/verifyToken",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }

  );

  if (res.status !== 200) {
    return false;
  }
  const json = await res.json();
  return json;

};
