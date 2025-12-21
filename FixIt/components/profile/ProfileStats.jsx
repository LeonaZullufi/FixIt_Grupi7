import React from "react";
import { View, StyleSheet } from "react-native";
import SettingsCard from "../settings/SettingsCard";
import { useTheme } from "../../context/themeContext";

export default function ProfileStats({ stats }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
      {stats.map((item) => (
        <SettingsCard key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    borderRadius: 30,
    paddingVertical: 25,
    paddingHorizontal: 15,
    marginBottom: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

