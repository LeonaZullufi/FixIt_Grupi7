import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { collection, onSnapshot, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase.js";


const mapStyle = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const LATITUDE_MIN = 40.8;
const LATITUDE_MAX = 44.3;
const LONGITUDE_MIN = 19.8;
const LONGITUDE_MAX = 22.8;

const imageMap = {
  "Gropa1.png": require("../../assets/ProblemOnMap/Gropa1.png"),
  "Gropa2Prizren.jpg": require("../../assets/ProblemOnMap/Gropa2Prizren.jpg"),
  "KanalizimNeRruge.jpg": require("../../assets/ProblemOnMap/KanalizimNeRruge.jpg"),
  "KendiLojrave.jpg": require("../../assets/ProblemOnMap/KendiLojrave.jpg"),
  "MbeturinaSkenderaj.jpg": require("../../assets/ProblemOnMap/MbeturinaSkenderaj.jpg"),
  "NdriqimPrishtine.jpg": require("../../assets/ProblemOnMap/NdriqimPrishtine.jpg"),
};


const ProblemMarker = React.memo(({ report, isMyReport, onPress }) => {
  const pinColor = isMyReport
    ? report.finished
      ? "green"
      : "red"
    : "blue";

  return (
    <Marker
      coordinate={{
        latitude: report.latitude,
        longitude: report.longitude,
      }}
      pinColor={pinColor}
      onPress={() => onPress(report)}
      calloutEnabled={false}
    />
  );
});


export default function ProblemsScreen() {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [region, setRegion] = useState({
    latitude: 42.6,
    longitude: 20.9,
    latitudeDelta: 0.55,
    longitudeDelta: 0.65,
  });

  const auth = getAuth();
  const currentUserEmail = auth.currentUser?.email || "";


  const onRegionChangeComplete = useCallback((newRegion) => {
    let latitude = newRegion.latitude;
    let longitude = newRegion.longitude;

    if (latitude < LATITUDE_MIN) latitude = LATITUDE_MIN;
    if (latitude > LATITUDE_MAX) latitude = LATITUDE_MAX;
    if (longitude < LONGITUDE_MIN) longitude = LONGITUDE_MIN;
    if (longitude > LONGITUDE_MAX) longitude = LONGITUDE_MAX;

    if (
      latitude !== newRegion.latitude ||
      longitude !== newRegion.longitude
    ) {
      setRegion({ ...newRegion, latitude, longitude });
    } else {
      setRegion(newRegion);
    }
  }, []);


  useEffect(() => {
    const q = query(collection(db, "reports"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  const reportsWithOwnership = useMemo(() => {
    return reports.map((r) => ({
      ...r,
      isMyReport: r.userEmail === currentUserEmail,
    }));
  }, [reports, currentUserEmail]);

  const openMarker = useCallback((report) => {
    setSelectedMarker(report);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const photoSource = useMemo(() => {
    if (!selectedMarker?.photoName) return null;
    return imageMap[selectedMarker.photoName];
  }, [selectedMarker]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Duke ngarkuar raportet...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        customMapStyle={mapStyle}
      >
        {reportsWithOwnership.map((report) => (
          <ProblemMarker
            key={report.id}
            report={report}
            isMyReport={report.isMyReport}
            onPress={openMarker}
          />
        ))}
      </MapView>


      <Modal
        visible={!!selectedMarker}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedMarker?.description?.length > 30
                ? `${selectedMarker.description.substring(0, 30)}...`
                : selectedMarker?.description}
            </Text>

            {photoSource ? (
              <Image source={photoSource} style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: "#eee" }]}>
                <Text style={{ color: "#999" }}>No photo</Text>
              </View>
            )}

            <Text style={{ marginTop: 10, textAlign: "center" }}>
              {selectedMarker?.description}
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Text style={{ color: "white" }}>Mbyll</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, width: "100%" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: 340,
    maxHeight: 500,
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  image: {
    width: 300,
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
