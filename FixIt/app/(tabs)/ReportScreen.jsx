import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import * as ImagePicker from "expo-image-picker";
import { serverTimestamp } from "firebase/firestore";
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
  Alert,
  Animated,
  Easing,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation } from "expo-router";
import { useTheme } from "../../context/themeContext";
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
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=sq`,
      { headers: { "User-Agent": "FixItApp/1.0" } }
    );
    const data = await res.json();
    return data.display_name || "";
  } catch {
    return "";
  }
};

const getPinColor = (status) => {
  switch (status) {
    case "pending":
      return "red";
    case "in_progress":
      return "orange";
    case "completed":
      return "green";
    default:
      return "red";
  }
};

const ReportMarker = React.memo(({ report, onPress }) => (
  <Marker
    coordinate={{ latitude: report.latitude, longitude: report.longitude }}
    pinColor={getPinColor(report.status)}
    onPress={() => onPress(report)}
  />
));

export default function ReportScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);

  const [problemTitle, setProblemTitle] = useState(""); // 🔴 SHTUAR
  const [description, setDescription] = useState("");

  const [pinLocation, setPinLocation] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [reports, setReports] = useState([]);
  const [openedReport, setOpenedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const successAnim = useRef(new Animated.Value(0)).current;
  const [showSuccess, setShowSuccess] = useState(false);

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
        setLoadingReports(false);
        setErrorMessage("Nuk u lexuan raportet.");
      }
    );

    return unsub;
  }, []);

  const processImage = async (uri) => {
    setPhotoUri(uri);
    const res = await fetch(uri);
    const blob = await res.blob();
    const reader = new FileReader();
    reader.onload = () => setPhotoBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  };

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  }, []);

  const openPhotoPicker = useCallback(() => {
    Alert.alert("Zgjidh foton", "", [
      { text: "Kamera", onPress: takePhoto },
      { text: "Gallery", onPress: pickFromGallery },
      { text: "Anulo", style: "cancel" },
    ]);
  }, [takePhoto, pickFromGallery]);

  const removePhoto = useCallback(() => {
    Alert.alert("Largo foton", "A je i sigurt?", [
      { text: "Anulo", style: "cancel" },
      {
        text: "Largo",
        style: "destructive",
        onPress: () => {
          setPhotoUri(null);
          setPhotoBase64(null);
        },
      },
    ]);
  }, []);

  const placePin = useCallback(async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPinLocation({ latitude, longitude });
    setPlaceName(await getAddressFromCoords(latitude, longitude));
  }, []);

  const canSend = useMemo(() => {
    return !!(
      pinLocation &&
      photoBase64 &&
      problemTitle.trim().length > 0 && // 🔴 SHTUAR
      description.trim().length > 0
    );
  }, [pinLocation, photoBase64, problemTitle, description]);

  const showSuccessPopup = () => {
    setShowSuccess(true);
    successAnim.setValue(0);

    Animated.timing(successAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSuccess(false));
    }, 1800);
  };

  const sendReport = useCallback(async () => {
    if (!canSend) return;

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "reports"), {
        problemTitle, // 🔴 SHTUAR
        description,
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        placeName,
        photoBase64,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setPhotoUri(null);
      setPhotoBase64(null);
      setProblemTitle(""); // 🔴 SHTUAR
      setDescription("");
      setPinLocation(null);
      setPlaceName("");

      showSuccessPopup();
    } catch {
      setErrorMessage("Gabim gjatë dërgimit.");
    } finally {
      setLoading(false);
    }
  }, [canSend, pinLocation, photoBase64, description, placeName, problemTitle]);

  const openReport = useCallback((r) => setOpenedReport(r), []);

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

          {loadingReports && <ActivityIndicator color="#0077b6" />}
          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

          <MapView
            provider={PROVIDER_GOOGLE}
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
              <ReportMarker key={r.id} report={r} onPress={openReport} />
            ))}
          </MapView>

          {!photoUri && (
            <TouchableOpacity
              style={styles.cameraMainBtn}
              onPress={openPhotoPicker}
            >
              <Text style={styles.photoMainText}>📸 Shto foto</Text>
            </TouchableOpacity>
          )}

          {photoUri && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.changeBtn]}
                  onPress={openPhotoPicker}
                >
                  <Text style={styles.actionText}>🔄 Ndrysho</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={removePhoto}
                >
                  <Text style={styles.actionText}>❌ Largo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 🔴 EMRI I PROBLEMIT */}
          <TextInput
            style={styles.input}
            placeholder="Emri i problemit"
            value={problemTitle}
            onChangeText={setProblemTitle}
          />

          {/* PËRSHKRIMI (PA PREK) */}
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
            style={[styles.sendButton, { opacity: canSend ? 1 : 0.5 }]}
            onPress={sendReport}
            disabled={!canSend || loading}
          >
            <Text style={styles.sendText}>
              {loading ? "Duke dërguar..." : "Dërgo Raportin"}
            </Text>
          </TouchableOpacity>
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

  cameraMainBtn: {
    backgroundColor: "#0077b6",
    marginHorizontal: 50,
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  photoMainText: { color: "white", fontSize: 17, fontWeight: "600" },

  photoContainer: { alignItems: "center", marginTop: 15 },

  previewImage: {
    width: "90%",
    height: 200,
    borderRadius: 15,
  },

  photoActions: {
    flexDirection: "row",
    width: "90%",
    marginTop: 12,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  changeBtn: {
    backgroundColor: "#0077b6",
    marginRight: 8,
  },

  deleteBtn: {
    backgroundColor: "#d62828",
    marginLeft: 8,
  },

  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
});
