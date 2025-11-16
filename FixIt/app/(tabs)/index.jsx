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
// Importojmë useTheme hook
import { useTheme } from "../../context/themeContext";
import bannerImage from "../../assets/explore.png";

const ExploreScreen = () => {
  const navigation = useNavigation();
  const lastHeaderState = useRef(true);
  // Marrja e colors dhe theme
  const { colors, theme } = useTheme();

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    // Ngjyra e Status Bar-it ndryshon bazuar në temë
    const barStyle = theme === "dark" ? "light-content" : "dark-content";

    if (currentY > 50 && lastHeaderState.current) {
      navigation.setOptions({ headerShown: false });
      lastHeaderState.current = false;
      // Përdorim barStyle dinamik
      StatusBar.setBarStyle(barStyle, true);
    }

    if (currentY < 30 && !lastHeaderState.current) {
      navigation.setOptions({ headerShown: true });
      lastHeaderState.current = true;
      // Kur kthehet lart, e vendosim në Light Content për të parë ikonat në sfond të bardhë (në Light Mode) ose të kundërtën
      // Këtu duhet të përdorim barStyle dinamik për konsistencë, ose të mbështetemi në stilimin e Header-it të Navigation.
      // Në këtë rast, po e bëj dinamike:
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
    // Sfondi kryesor i bazuar në temë
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Image source={bannerImage} style={styles.banner} />

        {/* Ngjyra e sfondit e bazuar në temë (ose ruajtur si fiks nëse dëshirohet theks i fortë) */}
        <View
          style={[styles.welcomeContainer, { backgroundColor: colors.primary }]}
        >
          {/* Ngjyra e tekstit (e bardhë mbetet në këtë rast) */}
          <Text style={styles.welcome}>Mirë se erdhe!</Text>
        </View>

        <View style={styles.cardContainer}>
          {stats.map((item) => (
            // Cards mbeten me ngjyrat fikse (item.color) për të treguar statusin
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: item.color }]}
            >
              {/* Teksti brenda cards mbetet i bardhë për shkak të sfondit të errët */}
              <Text style={styles.cardTitle}>
                {item.emoji} {item.label}
              </Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Sukseset e fundit: Përdorim colors.card (sfond i lehtë/errët sipas temës) */}
        <View style={[styles.successSection, { backgroundColor: colors.card }]}>
          {/* Titulli i suksesit: Përdorim colors.primary ose colors.text */}
          <Text style={[styles.successTitle, { color: colors.primary }]}>
            Sukseset e fundit
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.successScroll}
          >
            {/* Success Card: Përdorim një ngjyrë të lehtë të theksit ose colors.notification */}
            <View
              style={[
                styles.successCard,
                { backgroundColor: colors.notification },
              ]}
            >
              {/* Success Text: Përdorim colors.primary ose colors.text */}
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

        {/* Fact Box: Përdorim një ngjyrë të theksit ose colors.notification */}
        <View
          style={[styles.factBox, { backgroundColor: colors.notification }]}
        >
          {/* Fact Title: Përdorim colors.primary */}
          <Text style={[styles.factTitle, { color: colors.primary }]}>
            Thënie motivuese ose Fun Fact
          </Text>
          {/* Fact Text: Përdorim colors.text */}
          <Text style={[styles.factText, { color: colors.text }]}>
            {facts[Math.floor(Math.random() * facts.length)]}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Për shkak se po përdorim background dinamik në komponent,
  // mund të heqim `container` nga këtu.
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
    // Ngjyra fikse u zëvendësua dinamikisht
    marginBottom: 20,
    borderRadius: 10,
    paddingVertical: 12,
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff", // E lëmë të bardhë për shkak të sfondit të errët të colors.primary
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
    // Ngjyrat e hijes mund të përdorin colors.shadow nëse keni
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: "#fff", // E lëmë të bardhë
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff", // E lëmë të bardhë
    marginTop: 4,
  },
  successSection: {
    marginTop: 10,
    paddingTop: 10,
    padding: 20,
    borderRadius: 12,
    // Ngjyra fikse u zëvendësua dinamikisht
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    // Ngjyra fikse u zëvendësua dinamikisht
    marginBottom: 10,
    textAlign: "center",
  },
  successScroll: {
    paddingLeft: 5,
  },
  successCard: {
    // Ngjyra fikse u zëvendësua dinamikisht
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    width: 180,
    height: 100,
    justifyContent: "center",
  },
  successText: {
    fontSize: 13,
    // Ngjyra fikse u zëvendësua dinamikisht
    padding: 5,
  },
  factBox: {
    // Ngjyra fikse u zëvendësua dinamikisht
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  factTitle: {
    fontSize: 16,
    fontWeight: "bold",
    // Ngjyra fikse u zëvendësua dinamikisht
    marginBottom: 10,
    textAlign: "center",
  },
  factText: {
    fontSize: 15,
    // Ngjyra fikse u zëvendësua dinamikisht
    textAlign: "center",
  },
});

export default ExploreScreen;
