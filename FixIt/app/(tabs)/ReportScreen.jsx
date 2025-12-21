import React, { useState, useLayoutEffect, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "expo-router";
import { useTheme } from "../../context/themeContext";
import { auth, db, storage } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/* ================= ADDRESS ================= */

async function getAddressFromCoords(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=sq`;
    const response = await fetch(url, {
      headers: { "User-Agent": "FixItApp/1.0" },
    });
    const data = await response.json();
    return data.display_name || "Adresë e panjohur";
  } catch {
    return "Adresë e panjohur";
  }
}

/* ================= UPLOAD IMAGE ================= */
const uriToBase64 = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject("Failed to convert image");
    reader.onload = () => {
      const base64data = reader.result.split(",")[1]; // REMOVE prefix
      resolve(base64data);
    };
    reader.readAsDataURL(blob);
  });
};

const uploadImageToFirebase = async (uri, email) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileName = `reports/${email}_${Date.now()}.jpg`;
  const imageRef = ref(storage, fileName);

  await uploadBytes(imageRef, blob);
  const downloadURL = await getDownloadURL(imageRef);

  return downloadURL;
};

/* ================= COMPONENT ================= */

export default function ReportScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [photoUri, setPhotoUri] = useState(null);
  const [description, setDescription] = useState("");
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [editPhotoVisible, setEditPhotoVisible] = useState(false);

  const [pinLocation, setPinLocation] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [reports, setReports] = useState([]);
  const [openedReport, setOpenedReport] = useState(null);
  const [editDescription, setEditDescription] = useState("");

  const [loadingReports, setLoadingReports] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

 useEffect(() => {
    const user = auth.currentUser;
    if (!user) return setLoadingReports(false);

    const q = query(
      collection(db, "reports"),
      where("userEmail", "==", user.email)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingReports(false);
      },
      () => {
        setLoadingReports(false);
        setErrorMessage("Nuk u lexuan raportet.");
      }
    );

    return () => unsub();
  }, []);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage("Duhet leje për kamerën!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      const base64 = await uriToBase64(uri);
      setPhotoBase64(base64);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "FixIt",
      headerStyle: { height: 75, backgroundColor: "#023e8a" },
      headerTitleAlign: "center",
      headerTintColor: "white",
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return setLoadingReports(false);

    const q = query(
      collection(db, "reports"),
      where("userEmail", "==", user.email)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingReports(false);
      },
      () => {
        setErrorMessage("Nuk u lexuan raportet.");
        setLoadingReports(false);
      }
    );

    return () => unsub();
  }, []);

  const placePin = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPinLocation({ latitude, longitude });
    setPlaceName(await getAddressFromCoords(latitude, longitude));
    await takePhoto();
  };

  const sendReport = async () => {
    if (!pinLocation || !photoUri || !description.trim()) {
      return setErrorMessage("Plotëso vendin, foton dhe përshkrimin!");
    }

    const user = auth.currentUser;
    if (!user) return setErrorMessage("Duhet të jesh i kyçur!");

    setLoading(true);

   try {
      await addDoc(collection(db, "reports"), {
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        placeName,
        photoBase64, // 🔥 BASE64 RUHET NË FIRESTORE
        description,
        userEmail: user.email,
        createdAt: Date.now(),
        finished: false,
      });

      setPhotoUri(null);
      setPhotoBase64(null);
      setDescription("");
      setPinLocation(null);
      setPlaceName("");

      setSuccessMessage("Raporti u dërgua me sukses!");
    } catch (e) {
      console.log(e);
      setErrorMessage("Gabim gjatë dërgimit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={styles.title}>Raporto një problem</Text>

          {loadingReports && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#0077b6" />
              <Text style={styles.loadingText}>Duke ngarkuar...</Text>
            </View>
          )}

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {successMessage && (
            <Text style={styles.successText}>{successMessage}</Text>
          )}

          <MapView
            style={styles.map}
            onLongPress={placePin}
            initialRegion={{
              latitude: 42.6629,
              longitude: 21.1655,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {pinLocation && (
              <Marker coordinate={pinLocation} pinColor="blue" />
            )}
            {reports.map((r) => (
              <Marker
                key={r.id}
                coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                pinColor={r.finished ? "green" : "red"}
                onPress={() => {
                  setOpenedReport(r);
                  setEditDescription(r.description);
                }}
              />
            ))}
          </MapView>

          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={{
                width: "90%",
                height: 200,
                alignSelf: "center",
                marginTop: 15,
                borderRadius: 15,
              }}
            />
          )}

          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Përshkrimi..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {placeName !== "" && (
            <Text style={styles.autoAddress}>📍 {placeName}</Text>
          )}

          <TouchableOpacity
            style={[styles.sendButton, { marginTop: 10 }]}
            onPress={sendReport}
            disabled={loading}
          >
            <Text style={styles.sendText}>
              {loading ? "Duke dërguar..." : "Dërgo Raportin"}
            </Text>
          </TouchableOpacity>

          {/* DETAILS MODAL */}
          <Modal visible={openedReport !== null} animationType="slide">
            {openedReport && (
              <ScrollView style={{ backgroundColor: colors.background }}>
                <View style={{ padding: 20 }}>
                  <Image
  source={{
    uri: `data:image/jpeg;base64,${openedReport.photoBase64}`,
  }}
  style={{ width: "100%", height: 300, borderRadius: 15 }}
/>


                  <Text style={{ marginTop: 15 }}>
                    📝 {openedReport.description}
                  </Text>

                  <Text style={{ marginTop: 10, color: "gray" }}>
                    📍 {openedReport.placeName}
                  </Text>

                  <TouchableOpacity
                    style={{
                      marginTop: 25,
                      backgroundColor: "#023e8a",
                      padding: 15,
                      borderRadius: 10,
                    }}
                    onPress={() => setOpenedReport(null)}
                  >
                    <Text style={{ color: "white", textAlign: "center" }}>
                      Mbyll
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 45 },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#023e8a",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loadingText: { marginLeft: 8, color: "#0077b6" },
  errorText: { textAlign: "center", color: "red", marginTop: 10 },
  successText: { textAlign: "center", color: "green", marginTop: 10 },
  map: { height: 300, width: "100%", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    backgroundColor: "white",
  },
  autoAddress: {
    textAlign: "center",
    marginTop: 10,
    color: "#0077b6",
    fontWeight: "bold",
    paddingHorizontal: 20,
  },
  sendButton: {
    backgroundColor: "#00b4d8",
    marginHorizontal: 50,
    padding: 15,
    borderRadius: 20,
  },
  sendText: { textAlign: "center", color: "white", fontSize: 18 },
});
