import React, { useState, useLayoutEffect, useEffect } from "react";
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

// FIREBASE
import { auth, db } from "../../firebase";
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

// ===================== Reverse Geocoding =====================
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

export default function ReportScreen() {
  const navigation = useNavigation();

  // ===================== FORM STATE =====================
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [description, setDescription] = useState("");
  const [pinLocation, setPinLocation] = useState(null);
  const [placeName, setPlaceName] = useState("");

  // ===================== DATA STATE =====================
  const [reports, setReports] = useState([]);
  const [openedReport, setOpenedReport] = useState(null);

  // ===================== EDIT STATE =====================
  const [editDescription, setEditDescription] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);

  // ===================== UI STATE =====================
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [editPhotoVisible, setEditPhotoVisible] = useState(false);

  const [loadingReports, setLoadingReports] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // TIMER FOR NOTIFICATIONS
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // ===================== LOCAL PHOTOS =====================
  const photos = [
    require("../../assets/ProblemOnMap/Gropa1.png"),
    require("../../assets/ProblemOnMap/Gropa2Prizren.jpg"),
    require("../../assets/ProblemOnMap/NdriqimPrishtine.jpg"),
    require("../../assets/ProblemOnMap/MbeturinaSkenderaj.jpg"),
    require("../../assets/ProblemOnMap/KendiLojrave.jpg"),
    require("../../assets/ProblemOnMap/KanalizimNeRruge.jpg"),
  ];

  const photoNames = [
    "Gropa1.png",
    "Gropa2Prizren.jpg",
    "NdriqimPrishtine.jpg",
    "MbeturinaSkenderaj.jpg",
    "KendiLojrave.jpg",
    "KanalizimNeRruge.jpg",
  ];

  // ===================== HEADER =====================
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "FixIt",
      headerStyle: { height: 75, backgroundColor: "#023e8a" },
      headerTitleAlign: "center",
      headerTintColor: "white",
    });
  }, []);

  // ===================== GET USER REPORTS =====================
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

  // ===================== PLACE PIN =====================
  const placePin = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPinLocation({ latitude, longitude });
    setPlaceName(await getAddressFromCoords(latitude, longitude));
  };

  // ===================== SEND REPORT =====================
  const sendReport = async () => {
    if (!pinLocation || !selectedPhoto || !description.trim()) {
      return setErrorMessage("Plotëso foton, vendin dhe përshkrimin!");
    }

    const user = auth.currentUser;
    if (!user) return setErrorMessage("Duhet të jesh i kyçur!");

    setLoading(true);

    const imgName = photoNames[photos.indexOf(selectedPhoto)];

    try {
      await addDoc(collection(db, "reports"), {
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
        placeName,
        photoName: imgName,
        description,
        userEmail: user.email,
        createdAt: Date.now(),
        finished: false,
      });

      setSelectedPhoto(null);
      setDescription("");
      setPinLocation(null);
      setPlaceName("");
      setSuccessMessage("Raporti u dërgua me sukses!");
    } catch {
      setErrorMessage("Gabim gjatë dërgimit.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== DELETE REPORT =====================
  const deleteReport = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "reports", id));
      setOpenedReport(null);
      setSuccessMessage("Raporti u fshi.");
    } catch {
      setErrorMessage("Gabim gjatë fshirjes.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== UPDATE REPORT =====================
  const updateReport = async (id) => {
    setLoading(true);

    const finalPhotoName = editPhoto
      ? photoNames[photos.indexOf(editPhoto)]
      : openedReport.photoName;

    try {
      await updateDoc(doc(db, "reports", id), {
        description: editDescription,
        photoName: finalPhotoName,
      });

      setOpenedReport(null);
      setSuccessMessage("Raporti u përditësua.");
    } catch {
      setErrorMessage("Gabim gjatë përditësimit.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== RETURN PHOTO BY NAME =====================
  function getPhotoByName(name) {
    switch (name) {
      case "Gropa1.png":
        return require("../../assets/ProblemOnMap/Gropa1.png");
      case "Gropa2Prizren.jpg":
        return require("../../assets/ProblemOnMap/Gropa2Prizren.jpg");
      case "NdriqimPrishtine.jpg":
        return require("../../assets/ProblemOnMap/NdriqimPrishtine.jpg");
      case "MbeturinaSkenderaj.jpg":
        return require("../../assets/ProblemOnMap/MbeturinaSkenderaj.jpg");
      case "KendiLojrave.jpg":
        return require("../../assets/ProblemOnMap/KendiLojrave.jpg");
      case "KanalizimNeRruge.jpg":
        return require("../../assets/ProblemOnMap/KanalizimNeRruge.jpg");
      default:
        return require("../../assets/ProblemOnMap/Gropa1.png");
    }
  }

  // ===================== UI =====================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Raporto një problem</Text>

          {/* STATUS */}
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

          {/* MAP */}
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
            {pinLocation && <Marker coordinate={pinLocation} pinColor="blue" />}

            {reports.map((r) => (
              <Marker
                key={r.id}
                coordinate={{ latitude: r.latitude, longitude: r.longitude }}
                pinColor={r.finished ? "green" : "red"} // <-- NGJYRA SIPAS STATUSIT
                onPress={() => {
                  setOpenedReport(r);
                  setEditDescription(r.description);
                  setEditPhoto(null);
                }}
              />
            ))}
          </MapView>

          {/* SELECT PHOTO */}
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => setPhotoPickerVisible(true)}
          >
            <Text style={styles.photoText}>
              {selectedPhoto ? "Ndrysho Fotën" : "Zgjidh Foto"}
            </Text>
          </TouchableOpacity>

          {/* DESCRIPTION */}
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="Përshkrimi..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* ADDRESS */}
          {placeName !== "" && (
            <Text style={styles.autoAddress}>📍 {placeName}</Text>
          )}

          {/* SEND */}
          <TouchableOpacity
            style={[styles.sendButton, { marginTop: 10 }]}
            onPress={sendReport}
            disabled={loading}
          >
            <Text style={styles.sendText}>
              {loading ? "Duke dërguar..." : "Dërgo Raportin"}
            </Text>
          </TouchableOpacity>

          {/* PHOTO PICKER MODAL */}
          <Modal visible={photoPickerVisible} transparent animationType="slide">
            <View style={styles.photoModal}>
              <Text style={styles.modalTitle}>Zgjidh Foto</Text>

              <ScrollView horizontal>
                {photos.map((p, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedPhoto(p);
                      setPhotoPickerVisible(false);
                    }}
                  >
                    <Image source={p} style={styles.horizontalThumb} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.closePhotoModalBtn}
                onPress={() => setPhotoPickerVisible(false)}
              >
                <Text style={{ color: "white" }}>Mbyll</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* DETAILS MODAL */}
          <Modal visible={openedReport !== null} animationType="slide">
            {openedReport && (
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalContent}>
                  <Image
                    source={getPhotoByName(openedReport.photoName)}
                    style={styles.modalImage}
                  />

                  <Text style={styles.infoText}>
                    🏙 Vend: {openedReport.placeName}
                  </Text>
                  <Text style={styles.infoText}>
                    📍 Lat: {openedReport.latitude}
                  </Text>
                  <Text style={styles.infoText}>
                    📍 Lng: {openedReport.longitude}
                  </Text>

                  <TextInput
                    style={styles.editInput}
                    value={editDescription}
                    onChangeText={setEditDescription}
                    multiline
                  />

                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => setEditPhotoVisible(true)}
                  >
                    <Text style={styles.updateText}>Ndrysho Fotën</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => updateReport(openedReport.id)}
                  >
                    <Text style={styles.updateText}>Ruaj Ndryshimet</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteReport(openedReport.id)}
                  >
                    <Text style={styles.deleteText}>Fshi Raportin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setOpenedReport(null)}
                  >
                    <Text style={styles.closeText}>Mbyll</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </Modal>

          {/* EDIT PHOTO MODAL */}
          <Modal visible={editPhotoVisible} animationType="slide">
            <View style={styles.photoModal}>
              <Text style={styles.modalTitle}>Ndrysho Fotën</Text>

              <ScrollView horizontal>
                {photos.map((p, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setEditPhoto(p);
                      setEditPhotoVisible(false);
                    }}
                  >
                    <Image source={p} style={styles.horizontalThumb} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.closePhotoModalBtn}
                onPress={() => setEditPhotoVisible(false)}
              >
                <Text style={{ color: "white" }}>Mbyll</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===================== STYLES =====================
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
  map: {
    height: 300,
    width: "100%",
    marginTop: 10,
    borderRadius: 10,
  },
  photoButton: {
    backgroundColor: "#A4FFFF",
    marginTop: 20,
    marginHorizontal: 50,
    padding: 12,
    borderRadius: 20,
  },
  photoText: { textAlign: "center", color: "#023e8a" },
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
  photoModal: {
    backgroundColor: "white",
    marginTop: "40%",
    padding: 20,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#023e8a",
    marginBottom: 20,
  },
  horizontalThumb: {
    width: 120,
    height: 120,
    borderRadius: 15,
    marginRight: 15,
  },
  modalScroll: { paddingBottom: 80 },
  modalContent: { padding: 20 },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 15,
  },
  infoText: {
    marginTop: 7,
    fontSize: 14,
    color: "gray",
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    marginTop: 15,
    padding: 10,
  },
  updateButton: {
    backgroundColor: "#0077b6",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  updateText: { color: "white", textAlign: "center", fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "#d00000",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  deleteText: { color: "white", textAlign: "center", fontWeight: "bold" },
  closeButton: {
    backgroundColor: "#023e8a",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  closeText: { color: "white", textAlign: "center" },
});
