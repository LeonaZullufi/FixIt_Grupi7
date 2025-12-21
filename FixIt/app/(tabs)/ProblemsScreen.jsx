import React, { useState, useEffect } from "react";
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

export default function ReportScreen() {
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

  const onRegionChangeComplete = (newRegion) => {
    let { latitude, longitude } = newRegion;

    if (latitude < LATITUDE_MIN) latitude = LATITUDE_MIN;
    if (latitude > LATITUDE_MAX) latitude = LATITUDE_MAX;
    if (longitude < LONGITUDE_MIN) longitude = LONGITUDE_MIN;
    if (longitude > LONGITUDE_MAX) longitude = LONGITUDE_MAX;

    setRegion({ ...newRegion, latitude, longitude });
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Duke ngarkuar raportet...</Text>
      </View>
    );
  }

  // ✅ FIXED BASE64 HANDLING
  const photoSource =
    selectedMarker?.photoBase64 &&
    typeof selectedMarker.photoBase64 === "string" &&
    selectedMarker.photoBase64.length > 100
      ? {
          uri: selectedMarker.photoBase64.startsWith("data:image")
            ? selectedMarker.photoBase64.replace(/\s/g, "")
            : `data:image/jpeg;base64,${selectedMarker.photoBase64.replace(
                /\s/g,
                ""
              )}`,
        }
      : null;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        customMapStyle={mapStyle}
      >
        {reports.map((report) => {
          const isMyReport = report.userEmail === currentUserEmail;
          const isFinished = report.finished === true;

          let pinColor = "blue";
          if (isMyReport) pinColor = isFinished ? "green" : "red";

          return (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
              pinColor={pinColor}
              onPress={() => setSelectedMarker(report)}
              calloutEnabled={false}
            />
          );
        })}
      </MapView>

      <Modal
        visible={!!selectedMarker}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMarker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedMarker?.description?.length > 30
                ? `${selectedMarker.description.substring(0, 30)}...`
                : selectedMarker?.description}
            </Text>

            {photoSource ? (
              <Image
                source={photoSource}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.image, styles.noImage]}>
                <Text style={{ color: "#888" }}>No photo</Text>
              </View>
            )}

            <Text style={styles.description}>
              {selectedMarker?.description}
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedMarker(null)}
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
    maxHeight: 520,
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

  noImage: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  description: {
    marginTop: 10,
    textAlign: "center",
  },

  closeButton: {
    backgroundColor: "#2196F3",
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
