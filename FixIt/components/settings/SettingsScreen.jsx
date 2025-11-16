import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import SettingsList from "./SettingsList";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useTheme } from "../../context/themeContext";

export default function SettingsScreen({ onClose }) {
  const [notifications, setNotifications] = useState(true);
  const [expandedSetting, setExpandedSetting] = useState(null);
  const [language, setLanguage] = useState("Anglisht");
  const languages = ["Anglisht", "Shqip"];
  const { theme: appTheme, toggleTheme, colors } = useTheme(); // ✅ theme + colors
  const themes = ["Dritë", "Errët"];
  const router = useRouter();

  const settings = [
    {
      id: "1",
      label: "Edit Profile",
      icon: "edit-3",
      type: "button",
      isProfile: true,
    },
    { id: "2", icon: "globe", label: "Gjuha", value: language, type: "button" },
    {
      id: "3",
      icon: "moon",
      label: "Tema",
      value: appTheme === "dark" ? "Errët" : "Dritë",
      type: "button",
    },
    {
      id: "4",
      icon: "bell",
      label: "Njoftimet",
      value: notifications,
      type: "switch",
    },
    { id: "5", label: "Dil", icon: "log-out", type: "button", isLogout: true },
  ];

  const handleSettingPress = (item) => {
    if (item.isLogout) {
      signOut(auth)
        .then(() => {
          onClose();
          router.replace("/(auth)/login");
        })
        .catch((error) => console.log("❌ Error gjatë çkyçjes:", error));
      return;
    }

    if (item.label === "Gjuha" || item.label === "Tema") {
      setExpandedSetting(expandedSetting === item.id ? null : item.id);
    } else if (item.isProfile) {
      onClose();
      router.push("/editProfile");
    }
  };

  return (
    <View
      style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
    >
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: colors.modalBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[styles.modalHeader, { borderBottomColor: colors.border }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Settings
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <SettingsList
          settings={settings}
          languages={languages}
          expandedSetting={expandedSetting}
          setExpandedSetting={setExpandedSetting}
          language={language}
          setLanguage={setLanguage}
          setNotifications={setNotifications}
          handleSettingPress={handleSettingPress}
          theme={appTheme}
          setTheme={toggleTheme}
          themes={themes}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  modalTitle: { fontWeight: "bold", fontSize: 20 },
});
