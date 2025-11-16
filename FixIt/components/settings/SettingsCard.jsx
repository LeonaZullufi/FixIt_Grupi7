import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";

export default function StatCard({ item }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: item.color || colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.statEmoji, { color: colors.text }]}>
        {item.emoji}
      </Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>
        {item.label}
      </Text>
      <Text style={[styles.statValue, { color: colors.text }]}>
        {item.value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statEmoji: { fontSize: 28 },
  statLabel: { fontWeight: "500", marginTop: 8, fontSize: 14 },
  statValue: { fontSize: 24, fontWeight: "bold", marginTop: 5 },
});
