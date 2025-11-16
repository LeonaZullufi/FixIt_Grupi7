import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";

const AppInfo = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        🔹 Çfarë është FixIt?
      </Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        FixIt është një aplikacion mobil që u mundëson qytetarëve të raportojnë
        probleme ose dëmtime në qytetin e tyre — si p.sh. dritat e rrugës që nuk
        punojnë, gropat në rrugë apo çështje me mbeturinat publike —
        drejtpërdrejt te autoritetet lokale.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AppInfo;
