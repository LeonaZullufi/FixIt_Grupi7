import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import SettingItem from "./SettingItem";
import { useTheme } from "../../context/themeContext";

export default function SettingsList({
  settings,
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
    <FlatList
      data={settings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SettingItem
          item={item}
          languages={languages}
          expandedSetting={expandedSetting}
          setExpandedSetting={setExpandedSetting}
          language={language}
          setLanguage={setLanguage}
          setNotifications={setNotifications}
          handleSettingPress={handleSettingPress}
          theme={theme}
          setTheme={setTheme}
          themes={themes}
        />
      )}
      ItemSeparatorComponent={() => (
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  separator: { height: 1, marginVertical: 5 },
});
