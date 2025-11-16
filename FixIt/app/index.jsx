// app/index.jsx
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";      // 🔹 Vëre: ../ se jemi direkt brenda /app
import { doc, getDoc } from "firebase/firestore";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setChecking(false);
        router.replace("/(auth)/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role || "user" : "user";

        setChecking(false);

        if (role === "admin") {
          router.replace("/(admin)/AdminDashboard");
        } else {
          router.replace("/(tabs)/"); // home i userit të thjeshtë
        }
      } catch (err) {
        console.log("Error checking role:", err);
        setChecking(false);
        router.replace("/(auth)/login");
      }
    });

    return () => unsub();
  }, []);

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Duke kontrolluar përdoruesin...</Text>
      </View>
    );
  }

  // Nuk kthejmë asgjë sepse sapo bëhet replace
  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
