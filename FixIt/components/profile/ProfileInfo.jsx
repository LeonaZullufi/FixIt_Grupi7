import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";

export default function ProfileInfo({ firstName, lastName, email }) {
  const { colors } = useTheme();
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <View style={styles.container}>
      <Text style={[styles.name, { color: colors.text }]}>{fullName}</Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
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
});

