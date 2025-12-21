import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { collection, onSnapshot, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase.js";

const { width } = Dimensions.get("window");

const mapStyle = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

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

  useEffect(() => {
    const q = query(collection(db, "reports"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Duke ngarkuar hartën...</Text>
      </View>
    );
  }

  const photoSource =
    selectedMarker?.photoBase64 &&
    typeof selectedMarker.photoBase64 === "string" &&
    selectedMarker.photoBase64.length > 100
      ? {
          uri: selectedMarker.photoBase64.startsWith("data:image")
            ? selectedMarker.photoBase64.replace(/\s/g, "")
            : `data:image/jpeg;base64,${selectedMarker.photoBase64.replace(/\s/g, "")}`,
        }
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.legendBar}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "red" }]} />
          <Text style={styles.legendLabel}>Rap. e  mia (Pritje)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "blue" }]} />
          <Text style={styles.legendLabel}>Rap. e të tjerëve (Pritje)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "brown" }]} />
          <Text style={styles.legendLabel}>Në Progres</Text>
        </View>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        customMapStyle={mapStyle}
      >
        {reports
          .filter(report => report.status === "pending" || report.status === "in_progress")
          .map((report) => {
            const isMyReport = report.userEmail === currentUserEmail;
            let pinColor = "blue";

            if (report.status === "in_progress") {
              pinColor = "orange";
            } else if (report.status === "pending" && isMyReport) {
              pinColor = "red";
            }

            return (
              <Marker
                key={report.id}
                coordinate={{ latitude: report.latitude, longitude: report.longitude }}
                pinColor={pinColor}
                onPress={() => setSelectedMarker(report)}
              />
            );
          })}
      </MapView>

      <Modal 
        visible={!!selectedMarker} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setSelectedMarker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMarker?.problemTitle}</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: selectedMarker?.status === 'in_progress' ? 'orange' : '#2196F3' }]}>
              <Text style={styles.statusText}>
                {selectedMarker?.status === 'in_progress' ? 'NË PROGRES' : 'NË PRITJE'}
              </Text>
            </View>

            {photoSource ? (
              <Image source={photoSource} style={styles.largeImage} resizeMode="cover" />
            ) : (
              <View style={[styles.largeImage, styles.noImagePlaceholder]}>
                <Text style={{ color: "#999" }}>Nuk ka foto</Text>
              </View>
            )}

            <Text style={styles.modalDescription}>{selectedMarker?.description}</Text>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedMarker(null)}>
              <Text style={styles.closeButtonText}>Mbyll</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  legendBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 3,
    zIndex: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLabel: { fontSize: 12, fontWeight: "600", color: "#555" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)", 
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%", 
    borderRadius: 25,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
    textTransform: "capitalize", 
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  largeImage: {
    width: width * 0.8, 
    height: 250,        
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  noImagePlaceholder: {
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalDescription: {
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  }
});