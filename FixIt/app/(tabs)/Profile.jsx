import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsScreen from "../../components/settings/SettingsScreen";
import { useNavigation } from "expo-router";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../../context/themeContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [firstName, setFirstName] = useState("Duke u ngarkuar...");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Profil",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={{ marginRight: 50 }}
        >
          <Ionicons name="settings-outline" size={24} color={"white"} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: colors.tabBar,
        height: 75,
      },
      headerTitleAlign: "center",
      headerTintColor: "white",
    });
  }, [navigation, colors.tabInactive, colors.tabBar, colors.text]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        setFirstName("Nuk ka përdorues të kyçur");
        setLastName("");
        return;
      }

      setEmail(user.email || "Nuk ka email");
      setFirstName("Duke u ngarkuar...");

      try {
        const docRef = doc(db, "users", user.uid);

        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();

          const fName = data.firstName || "";
          const lName = data.lastName || "";

          setFirstName(fName || "Pa emër");
          setLastName(lName);
        } else {
          setFirstName("Pa emër");
          setLastName("Dokumenti nuk ekziston");
        }
      } catch (error) {
        console.error("Gabim gjatë marrjes së dokumentit: ", error);
        setFirstName("Gabim");
        setLastName("(Shiko konsolën)");
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      } else {
        setFirstName("Nuk ka përdorues të kyçur");
        setLastName("");
        setEmail("");
      }
    });

    return unsubscribe;
  }, []);

  const stats = [
    {
      id: "1",
      label: "Raportimet e mia",
      value: 28,
      color: "#F5A623",
      emoji: "📋",
    },
    {
      id: "2",
      label: "Të rregulluar",
      value: 12,
      color: "#4CD964",
      emoji: "✅",
    },
    { id: "3", label: "Në progres", value: 9, color: "#007AFF", emoji: "🔄" },
    { id: "4", label: "Në pritje", value: 7, color: "#FF3B30", emoji: "🕓" },
  ];

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileContainer}>
            <Ionicons
              name="person-circle-outline"
              size={90}
              color={colors.tabBar}
            />
            <Text style={[styles.name, { color: colors.text }]}>
              {fullName}
            </Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {email}
            </Text>
          </View>

          <View
            style={[styles.statsContainer, { backgroundColor: colors.card }]}
          >
            {stats.map((item) => (
              <SettingsCard key={item.id} item={item} />
            ))}
          </View>
        </ScrollView>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.modalOverlay },
            ]}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
              <SettingsScreen onClose={() => setIsModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  email: {
    opacity: 0.7,
    marginTop: 4,
    fontSize: 16,
  },
  statsContainer: {
    borderRadius: 30,
    paddingVertical: 25,
    paddingHorizontal: 15,
    marginBottom: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "100%",
  },
  fontHeader: {
    color: "#fff",
  },
});
