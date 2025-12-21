import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Tabs, useRouter } from "expo-router";
import { ThemeProvider } from "../../context/themeContext";
import { auth, onAuthStateChanged } from "../../firebase";
import { checkAndSendPendingNotifications } from "../../utils/notificationService";

export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/(auth)/login");
      } else {
        setCheckingAuth(false);
        // Check and send pending notifications when user logs in
        if (user.email) {
          checkAndSendPendingNotifications(user.email);
        }
      }
    });

    return unsubscribe;
  }, []);

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor="#023e8a" />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <View style={styles.root}>
        <StatusBar backgroundColor="#023e8a" />
        <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
          <Tabs
            screenOptions={{
              headerStyle: {
                height: 75,
                backgroundColor: "#023e8a",
              },
              headerTitleAlign: "center",
              headerTintColor: "white",

              headerBackground: () => (
                <View style={{ flex: 1, backgroundColor: "#023e8a" }} />
              ),
              tabBarActiveTintColor: "#A4FFFF",
              tabBarInactiveTintColor: "white",
              tabBarStyle: {
                backgroundColor: "#023e8a",
                borderTopWidth: 0,
                height: 70,
                paddingBottom: 10,
                paddingTop: 10,
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Ballina",
                tabBarIcon: ({ focused, size }) => (
                  <Image
                    source={
                      focused
                        ? require("../../assets/home-click_icon.png")
                        : require("../../assets/home_icon.png")
                    }
                    style={{ width: size * 1.4, height: size * 1.4 }}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="ProblemsScreen"
              options={{
                title: "Raportimet",
                tabBarIcon: ({ focused, size }) => (
                  <Image
                    source={
                      focused
                        ? require("../../assets/location-click_icon.png")
                        : require("../../assets/location_icon.png")
                    }
                    style={{ width: size * 1.4, height: size * 1.4 }}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="ReportScreen"
              options={{
                title: "FixIt",
                tabBarIcon: ({ focused }) => (
                  <Image
                    source={
                      focused
                        ? require("../../assets/FixIt-click.png")
                        : require("../../assets/FixIt.png")
                    }
                    style={{ width: 80, height: 80, marginBottom: 50 }}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="ContactsHelp"
              options={{
                title: "Ndihmë",
                tabBarIcon: ({ focused, size }) => (
                  <Image
                    source={
                      focused
                        ? require("../../assets/help-click_icon.png")
                        : require("../../assets/help_icon.png")
                    }
                    style={{ width: size * 1.4, height: size * 1.4 }}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="Profile"
              options={{
                title: "Profil",
                tabBarIcon: ({ focused, size }) => (
                  <Image
                    source={
                      focused
                        ? require("../../assets/profile-click_icon.png")
                        : require("../../assets/profile_icon.png")
                    }
                    style={{ width: size * 1.4, height: size * 1.4 }}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="editProfile"
              options={{
                href: null,
                title: "Profil",
              }}
            />
            <Tabs.Screen
              name="notificationSettings"
              options={{
                href: null,
                title: "Profil",
              }}
            />
          </Tabs>
        </SafeAreaView>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#023e8a",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#023e8a",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#023e8a",
    alignItems: "center",
    justifyContent: "center",
  },
});
