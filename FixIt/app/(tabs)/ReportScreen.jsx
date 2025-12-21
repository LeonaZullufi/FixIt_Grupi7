import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "expo-router";
import { useTheme } from "../../context/themeContext";

// FIREBASE
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";



const getAddressFromCoords = async (lat, lon) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=sq`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FixItApp/1.0" },
    });
    const data = await res.json();
    return data.display_name || "Adresë e panjohur";
  } catch {
    return "Adresë e panjohur";
  }
};



const ReportMarker = React.memo(({ report, onPress }) => (
  <Marker
    coordinate={{
      latitude: report.latitude,
      longitude: report.longitude,
    }}
    pinColor={report.finished ? "green" : "red"}
    onPress={() => onPress(report)}
  />
));


export default function ReportScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [description, setDescription] = useState("");
  const [pinLocation, setPinLocation] = useState(null);
  const [placeName, setPlaceName] = useState("");

  const [reports, setReports] = useState([]);
  const [openedReport, setOpenedReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  

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
    if (!user) {
      setLoadingReports(false);
      return;
    }

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

    return unsub;
  }, []);



  const takePhoto = useCallback(async () => {
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

      const res = await fetch(uri);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () =>
        setPhotoBase64(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    }
  }, []);

 

  const placePin = useCallback(
    async (e) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setPinLocation({ latitude, longitude });
      setPlaceName(await getAddressFromCoords(latitude, longitude));
      await takePhoto();
    },
    [takePhoto]
  );


  const sendReport = useCallback(async () => {
    if (!pinLocation || !photoBase64 || !description.trim()) {
      return setErrorMessage("Plotëso vendin, foton dhe përshkrimin!");
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "reports"), {
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        placeName,
        photoBase64,
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
    } catch {
      setErrorMessage("Gabim gjatë dërgimit.");
    } finally {
      setLoading(false);
    }
  }, [pinLocation, photoBase64, description, placeName]);

  

  const activeReports = useMemo(
    () => reports.filter((r) => !r.finished),
    [reports]
  );

  const openReport = useCallback((report) => {
    setOpenedReport(report);
  }, []);



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
        <View style={styles.container}>
          <Text style={styles.title}>Raporto një problem</Text>

          {loadingReports && (
            <ActivityIndicator size="small" color="#0077b6" />
          )}

          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
          {successMessage && (
            <Text style={styles.success}>{successMessage}</Text>
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

            {activeReports.map((r) => (
              <ReportMarker
                key={r.id}
                report={r}
                onPress={openReport}
              />
            ))}
          </MapView>

          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Përshkrimi..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {placeName !== "" && (
            <Text style={styles.address}>📍 {placeName}</Text>
          )}

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendReport}
            disabled={loading}
          >
            <Text style={styles.sendText}>
              {loading ? "Duke dërguar..." : "Dërgo Raportin"}
            </Text>
          </TouchableOpacity>

        

          <Modal visible={openedReport !== null} animationType="slide">
            {openedReport && (
              <FlatList
                data={[openedReport]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{ padding: 20 }}>
                    <Image
                      source={{
                        uri: `data:image/jpeg;base64,${item.photoBase64}`,
                      }}
                      style={styles.modalImage}
                    />
                    <Text style={{ marginTop: 15 }}>
                      📝 {item.description}
                    </Text>
                    <Text style={{ marginTop: 10, color: "gray" }}>
                      📍 {item.placeName}
                    </Text>

                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={() => setOpenedReport(null)}
                    >
                      <Text style={{ color: "white", textAlign: "center" }}>
                        Mbyll
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 45 },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#023e8a",
  },
  map: { height: 300, width: "100%", marginTop: 10 },
  previewImage: {
    width: "90%",
    height: 200,
    alignSelf: "center",
    marginTop: 15,
    borderRadius: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    backgroundColor: "white",
  },
  address: {
    textAlign: "center",
    marginTop: 10,
    color: "#0077b6",
    fontWeight: "bold",
  },
  sendButton: {
    backgroundColor: "#00b4d8",
    marginHorizontal: 50,
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  sendText: { textAlign: "center", color: "white", fontSize: 18 },
  error: { textAlign: "center", color: "red", marginTop: 10 },
  success: { textAlign: "center", color: "green", marginTop: 10 },
  modalImage: { width: "100%", height: 300, borderRadius: 15 },
  closeBtn: {
    marginTop: 25,
    backgroundColor: "#023e8a",
    padding: 15,
    borderRadius: 10,
  },
});
