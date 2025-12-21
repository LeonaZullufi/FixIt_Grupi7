import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
} from "react-native";

import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { db, auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { router, useNavigation } from "expo-router";
import { saveReportStatusNotification } from "../../utils/notificationService";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [opened, setOpened] = useState(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Admin Dashboard",
      headerStyle: {
        backgroundColor: "#023e8a",
        height: 75,
      },
      headerTitleAlign: "center",
      headerTintColor: "white",
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)/login");
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reports"), (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (reportId, status) => {
    try {
      // Get the report data before updating
      const reportRef = doc(db, "reports", reportId);
      const reportData = reports.find((r) => r.id === reportId);
      
      if (!reportData) {
        console.error("Report not found");
        return;
      }

      // Update the report status
      await updateDoc(reportRef, { status });

      // Save notification to Firestore (will be sent when user logs in)
      if (reportData.userEmail) {
        await saveReportStatusNotification(
          reportData.userEmail,
          reportId,
          reportData.placeName || "Vend i panjohur",
          status,
          reportData.description || ""
        );
      }
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const deleteReport = async (id) => {
    await deleteDoc(doc(db, "reports", id));
    setOpened(null);
  };

  const statusLabel = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Në pritje";
      case "in_progress":
        return "🔧 Në progres";
      case "completed":
        return "✔ I përfunduar";
      default:
        return "⏳ Në pritje";
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Të gjitha raportet</Text>

        {reports.map((r) => (
          <View key={r.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.place}>{r.placeName}</Text>
              <Text style={styles.desc}>{r.description}</Text>
              <Text style={styles.status}>
                Status: {statusLabel(r.status)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => setOpened(r)}
            >
              <Text style={{ color: "white" }}>Details</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çkyçu</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Developed by Florida, Leona, Albison, Ali © 2025
        </Text>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={opened !== null} animationType="slide">
        {opened && (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Image
              source={{
                uri: `data:image/jpeg;base64,${opened.photoBase64}`,
              }}
              style={{ height: 300, width: "100%", borderRadius: 10 }}
            />

            <Text style={styles.info}>📍 {opened.placeName}</Text>
            <Text style={styles.info}>📝 {opened.description}</Text>
            <Text style={styles.info}>
              Status aktual: {statusLabel(opened.status)}
            </Text>

            {/* STATUS BUTTONS */}
            <View style={styles.statusBox}>
              <TouchableOpacity
                style={styles.statusBtn}
                onPress={() => updateStatus(opened.id, "pending")}
              >
                <Text>⏳ Në pritje</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statusBtn}
                onPress={() => updateStatus(opened.id, "in_progress")}
              >
                <Text>🔧 Në progres</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statusBtn}
                onPress={() => updateStatus(opened.id, "completed")}
              >
                <Text>✔ I përfunduar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setOpened(null)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Mbyll</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteReport(opened.id)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Fshije Raportin
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  item: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  place: { fontWeight: "bold", fontSize: 16 },
  desc: { color: "#555", marginTop: 5 },
  status: { marginTop: 5, fontWeight: "600" },
  detailsBtn: {
    backgroundColor: "#0077b6",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  info: { marginTop: 10, fontSize: 16 },
  statusBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  statusBtn: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
  },
  closeBtn: {
    backgroundColor: "#023e8a",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  deleteBtn: {
    backgroundColor: "#d00000",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#ff4d6d",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  footer: {
    marginTop: 25,
    textAlign: "center",
    color: "#888",
  },
});
