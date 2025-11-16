import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/themeContext";
import bannerImage from "../../assets/explore.png";

const ExploreScreen = () => {
  const navigation = useNavigation();
  const lastHeaderState = useRef(true);
  const { colors, theme } = useTheme();

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const barStyle = theme === "dark" ? "light-content" : "dark-content";

    if (currentY > 50 && lastHeaderState.current) {
      navigation.setOptions({ headerShown: false });
      lastHeaderState.current = false;
      StatusBar.setBarStyle(barStyle, true);
    }

    if (currentY < 30 && !lastHeaderState.current) {
      navigation.setOptions({ headerShown: true });
      lastHeaderState.current = true;
      StatusBar.setBarStyle(barStyle, true);
    }
  };

  const stats = [
    {
      id: 1,
      label: "Probleme të zgjidhura",
      value: 124,
      color: "#27B4E2",
      emoji: "✅",
    },
    { id: 2, label: "Në pritje", value: 37, color: "#FF6663", emoji: "🕓" },
    {
      id: 3,
      label: "Në lagjen tënde",
      value: 12,
      color: "#003F91",
      emoji: "📍",
    },
    {
      id: 4,
      label: "Përdorues aktivë",
      value: 45,
      color: "#2D2D2D",
      emoji: "👥",
    },
  ];

  const facts = [
    "Çdo raportim i vogël ndihmon ta bëjmë lagjen më të pastër 🌍.",
    "Përdoruesit e FixIt kanë zgjidhur mbi 1000 probleme këtë vit!",
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Image source={bannerImage} style={styles.banner} />

        <View
          style={[styles.welcomeContainer, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.welcome, { color: colors.text }]}>
            Mirë se erdhe!
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {stats.map((item) => (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: item.color }]}
            >
              <Text style={styles.cardTitle}>
                {item.emoji} {item.label}
              </Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.successSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Sukseset e fundit
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.successScroll}
          >
            <View
              style={[
                styles.successCard,
                { backgroundColor: colors.notification },
              ]}
            >
              <Text style={[styles.successText, { color: colors.text }]}>
                💡 Drita e rrugës në “Rr. Dëshmorët” është rregulluar
              </Text>
            </View>
            <View
              style={[
                styles.successCard,
                { backgroundColor: colors.notification },
              ]}
            >
              <Text style={[styles.successText, { color: colors.text }]}>
                🚮 Pastrimi i mbeturinave në “Rr. Iliria” u krye
              </Text>
            </View>
            <View
              style={[
                styles.successCard,
                { backgroundColor: colors.notification },
              ]}
            >
              <Text style={[styles.successText, { color: colors.text }]}>
                💧 Uji është rikthyer në “Lagjja Kalabria”
              </Text>
            </View>
          </ScrollView>
        </View>

        <View
          style={[styles.factBox, { backgroundColor: colors.notification }]}
        >
          <Text style={[styles.factTitle, { color: colors.text }]}>
            Thënie motivuese ose Fun Fact
          </Text>
          <Text style={[styles.factText, { color: colors.text }]}>
            {facts[Math.floor(Math.random() * facts.length)]}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  banner: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 10,
    paddingVertical: 12,
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    minHeight: 100,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  successSection: {
    marginTop: 10,
    paddingTop: 10,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  successScroll: {
    paddingLeft: 5,
  },
  successCard: {
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    width: 180,
    height: 100,
    justifyContent: "center",
  },
  successText: {
    fontSize: 13,
    padding: 5,
  },
  factBox: {
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  factTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  factText: {
    fontSize: 15,
    textAlign: "center",
  },
});

export default ExploreScreen;
