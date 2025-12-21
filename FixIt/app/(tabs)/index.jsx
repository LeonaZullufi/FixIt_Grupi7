import React, { useRef, useEffect, useState } from "react";
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
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function ExploreScreen() {
  const navigation = useNavigation();
  const lastHeaderState = useRef(true);
  const { colors, theme } = useTheme();

  const [stats, setStats] = useState({
    solved: 0,
    pending: 0,
    inProcess: 0,
    activeUsers: 0,
    mineTotal: 0,
    loading: true,
  });

  const [latestCompleted, setLatestCompleted] = useState([]);

  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const barStyle = theme === "dark" ? "light-content" : "dark-content";

    if (y > 50 && lastHeaderState.current) {
      navigation.setOptions({ headerShown: false });
      lastHeaderState.current = false;
      StatusBar.setBarStyle(barStyle, true);
    }

    if (y < 30 && !lastHeaderState.current) {
      navigation.setOptions({ headerShown: true });
      lastHeaderState.current = true;
      StatusBar.setBarStyle(barStyle, true);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    const email = user?.email ?? null;

    const unsubReports = onSnapshot(collection(db, "reports"), (snap) => {
      let solved = 0;
      let pending = 0;
      let inProcess = 0;
      let mineTotal = 0;

      snap.forEach((d) => {
        const r = d.data();
        if (r.status === "completed") solved++;
        if (r.status === "pending") pending++;
        if (email && r.userEmail === email) mineTotal++;
        if (email && r.userEmail === email && r.status === "in_progress")
          inProcess++;
      });

      setStats((p) => ({
        ...p,
        solved,
        pending,
        inProcess,
        mineTotal,
        loading: false,
      }));
    });

    const unsubUsers = onSnapshot(
      query(collection(db, "users"), where("status", "==", "active")),
      (snap) => {
        setStats((p) => ({ ...p, activeUsers: snap.size }));
      }
    );

    return () => {
      unsubReports();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    const qCompleted = query(
      collection(db, "reports"),
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(qCompleted, (snap) => {
      setLatestCompleted(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Image source={bannerImage} style={styles.banner} />

        <View style={[styles.welcomeBox, { backgroundColor: colors.primary }]}>
          <Text style={styles.welcomeTitle}>Mirë se erdhe!</Text>
          {!stats.loading && (
            <Text style={styles.welcomeSub}>
              Ke raportuar {stats.mineTotal} probleme në lagjen tënde
            </Text>
          )}
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, styles.active]}>
            <Text style={styles.cardLabel}>👥 Aktivë</Text>
            <Text style={styles.cardValue}>{stats.activeUsers}</Text>
          </View>

          <View style={[styles.card, styles.solved]}>
            <Text style={styles.cardLabel}>✅ Të zgjidhura</Text>
            <Text style={styles.cardValue}>{stats.solved}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.card, styles.process]}>
            <Text style={styles.cardLabel}>⚙️ Në proces</Text>
            <Text style={styles.cardValue}>{stats.inProcess}</Text>
          </View>

          <View style={[styles.card, styles.pending]}>
            <Text style={styles.cardLabel}>🕓 Në pritje</Text>
            <Text style={styles.cardValue}>{stats.pending}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sukseset e fundit
        </Text>

        {latestCompleted.map((item) => (
          <View
            key={item.id}
            style={[styles.successCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.successLine} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                {item.problemTitle || "Problem pa titull"}
              </Text>
              {item.placeName && (
                <Text style={[styles.successMeta, { color: colors.text }]}>
                  📍 {item.placeName}
                </Text>
              )}
              {item.description && (
                <Text style={[styles.successDesc, { color: colors.text }]}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },

  banner: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 16,
  },

  welcomeBox: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 18,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
  },

  welcomeSub: {
    fontSize: 14,
    marginTop: 4,
    color: "black",
    opacity: 0.9,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  card: {
    width: "48%",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },

  cardLabel: {
    fontSize: 14,
    color: "white",
    marginBottom: 6,
    fontWeight: "500",
  },

  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },

  active: { backgroundColor: "#2D2D2D" },
  solved: { backgroundColor: "#27B4E2" },
  process: { backgroundColor: "#003F91" },
  pending: { backgroundColor: "#FF6663" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 12,
  },

  successCard: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  successLine: {
    width: 4,
    borderRadius: 4,
    backgroundColor: "#27e22dff",
    marginRight: 12,
  },

  successTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  successMeta: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },

  successDesc: {
    fontSize: 13,
    marginTop: 6,
    opacity: 0.9,
  },
});
