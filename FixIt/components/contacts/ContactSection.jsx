import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { FontAwesome, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/themeContext";

const ContactSection = () => {
  const { colors } = useTheme();

  const primaryColor = "#17cbebff";

  return (
    <>
      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={24} color={primaryColor} />
        <Text style={[styles.text, { marginLeft: 5, color: colors.text }]}>
          Telefoni: 123456789
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Entypo name="email" size={24} color={primaryColor} />
        <Text style={[styles.text, { marginLeft: 5, color: colors.text }]}>
          Email: info@fixit.com
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Entypo name="globe" size={24} color={primaryColor} />
        <Text style={[styles.text, { marginLeft: 5, color: colors.text }]}>
          Faqja: www.fixItapp.com
        </Text>
      </View>
      <View style={styles.socialContainer}>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://facebook.com")}
        >
          <FontAwesome name="facebook" size={28} color={primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://twitter.com")}
        >
          <FontAwesome name="twitter" size={28} color={primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://linkedin.com")}
        >
          <FontAwesome name="linkedin" size={28} color={primaryColor} />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  text: {
    marginLeft: 10,
  },
  socialContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "90%",
    justifyContent: "space-around",
    marginBottom: 30,
  },
});

export default ContactSection;
