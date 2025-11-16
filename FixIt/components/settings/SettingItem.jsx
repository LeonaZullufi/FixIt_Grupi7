import React from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import DropdownList from "./DropdownList";

export default function SettingItem({
  item,
  languages,
  expandedSetting,
  setExpandedSetting,
  language,
  setLanguage,
  setNotifications,
  handleSettingPress,
  theme,
  setTheme,
  themes,
}) {
  return (
    <View style={styles.settingItemContainer}>
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Feather
            name={item.icon}
            size={20}
            color={item.isLogout ? "#FF3B30" : "#333"}
          />
          <Text
            style={[styles.settingText, item.isLogout && styles.logoutText]}
          >
            {item.label}
          </Text>
        </View>

        {item.type === "switch" ? (
          <Switch
            value={item.value}
            onValueChange={setNotifications}
            thumbColor="#fff"
            trackColor={{ true: "#6e5eff", false: "#ccc" }}
          />
        ) : (
          <TouchableOpacity
            onPress={() => handleSettingPress(item)}
            style={styles.settingRight}
          >
            {item.label === "Language" ? (
              <Text style={styles.settingValue}>{language}</Text>
            ) : (
              item.value && (
                <Text style={styles.settingValue}>
                  {item.label === "Tema"
                    ? theme === "dark"
                      ? "Errët"
                      : "Dritë"
                    : item.value}
                </Text>
              )
            )}
            <Feather
              name={
                expandedSetting === item.id ? "chevron-up" : "chevron-right"
              }
              size={18}
              color={item.isLogout ? "#FF3B30" : "#999"}
            />
          </TouchableOpacity>
        )}
      </View>

      {expandedSetting === item.id && item.label === "Gjuha" && (
        <DropdownList
          options={languages}
          selected={language}
          onSelect={(lang) => {
            setLanguage(lang);
            setExpandedSetting(null);
          }}
        />
      )}

      {expandedSetting === item.id && item.label === "Tema" && (
        <DropdownList
          options={themes}
          selected={theme === "dark" ? "Errët" : "Dritë"}
          onSelect={(selected) => {
            setTheme(selected);
            setExpandedSetting(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  settingItemContainer: { marginBottom: 10 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingRight: { flexDirection: "row", alignItems: "center" },
  settingText: { fontSize: 16, color: "#333", marginLeft: 12 },
  settingValue: { fontSize: 14, color: "#666", marginRight: 8 },
  logoutText: { color: "#FF3B30", fontWeight: "500" },
  dropdown: {
    backgroundColor: "#f0f0f5",
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 4,
  },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 16 },
  selectedDropdownItem: { backgroundColor: "#e0e0ff", borderRadius: 8 },
  dropdownText: { fontSize: 16, color: "#333" },
  selectedDropdownText: { fontWeight: "bold", color: "#6e5eff" },
});
