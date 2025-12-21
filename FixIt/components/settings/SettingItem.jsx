import React from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import DropdownList from "./DropdownList";
import { useTheme } from "../../context/themeContext";

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
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.settingItemContainer,
        { backgroundColor: colors.background },
      ]}
    >
      {item.type === "switch" ? (
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Feather
              name={item.icon}
              size={20}
              color={item.isLogout ? "#FF3B30" : colors.text}
            />
            <Text
              style={[
                styles.settingText,
                { color: item.isLogout ? "#FF3B30" : colors.text },
                item.isLogout && styles.logoutText,
              ]}
            >
              {item.label}
            </Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={setNotifications}
            thumbColor="#fff"
            trackColor={{ true: colors.tabActive, false: "#ccc" }}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => handleSettingPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Feather
              name={item.icon}
              size={20}
              color={item.isLogout ? "#FF3B30" : colors.text}
            />
            <Text
              style={[
                styles.settingText,
                { color: item.isLogout ? "#FF3B30" : colors.text },
                item.isLogout && styles.logoutText,
              ]}
            >
              {item.label}
            </Text>
          </View>
          <View style={styles.settingRight}>
            {item.label === "Gjuha" ? (
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                {language}
              </Text>
            ) : (
              item.value && (
                <Text
                  style={[styles.settingValue, { color: colors.textSecondary }]}
                >
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
              color={item.isLogout ? "#FF3B30" : colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      )}

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
  settingItemContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingRight: { flexDirection: "row", alignItems: "center" },
  settingText: { fontSize: 16, marginLeft: 12 },
  settingValue: { fontSize: 14, marginRight: 8 },
  logoutText: { fontWeight: "500" },
});
