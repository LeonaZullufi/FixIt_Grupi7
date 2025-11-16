import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/themeContext";

const FAQSectionComponent = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        💬 Pyetjet e Bëra Shpesh (FAQ)
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        P1: A duhet të kem një llogari për të dërguar një raport?
      </Text>
      <Text style={[styles.answer, { color: colors.textSecondary }]}>
        Po, duhet të hyni në llogarinë tuaj që të mund t’i lidhim raportet me
        profilin tuaj dhe t’ju njoftojmë për përditësime.
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        P2: A mund të raportoj një problem në mënyrë anonime?
      </Text>
      <Text style={[styles.answer, { color: colors.textSecondary }]}>
        Aktualisht, raportet kërkojnë një përdorues të regjistruar. Megjithatë,
        të dhënat tuaja personale nuk ndahen publikisht.
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        P3: Sa kohë zgjat zgjidhja e problemeve?
      </Text>
      <Text style={[styles.answer, { color: colors.textSecondary }]}>
        Kjo varet nga koha e reagimit të komunës suaj lokale. Ju mund t’i ndiqni
        përditësimet në seksionin “Raportimet e mia”.
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        P4: A mund ta ndryshoj ose ta fshij një raport?
      </Text>
      <Text style={[styles.answer, { color: colors.textSecondary }]}>
        Ju mund ta ndryshoni raportin tuaj brenda 10 minutave pas dërgimit. Për
        fshirje, kontaktoni ekipin tonë të mbështetjes.
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        P5: GPS-i im nuk është i saktë — çfarë duhet të bëj?
      </Text>
      <Text style={[styles.answer, { color: colors.textSecondary }]}>
        Ju mund ta zgjidhni manualisht vendndodhjen tuaj në hartë para se ta
        dërgoni raportin.
      </Text>

      <Text style={[styles.question, { color: colors.text }]}>
        P6: Si mund të kontaktoj mbështetjen e FixIt?
      </Text>
      <Text style={[styles.answer, { color: colors.textSecondary }]}>
        Përdorni formularin e kontaktit në aplikacion ose na dërgoni email në
        info@fixit.com.
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
  question: {
    fontWeight: "600",
    marginTop: 10,
  },
  answer: {
    marginLeft: 10,
    lineHeight: 20,
  },
});

export default FAQSectionComponent;
