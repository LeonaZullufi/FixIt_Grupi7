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
import { auth } from "../../firebase";
import { useTheme } from "../../context/themeContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState("");
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
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.tabInactive}
          />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: colors.tabBar,
        height: 75,
      },
      headerTitleAlign: "center",
      color: colors.text,
    });
  }, [navigation, colors]);

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setEmail(user.email);
      setName(user.displayName ?? "Pa emër");
    }
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
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
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
            <View style={styles.modalContent}>
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
});
