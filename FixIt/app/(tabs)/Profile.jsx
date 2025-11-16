// import React, { useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Modal,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import SettingsCard from "../../components/settings/SettingsCard";
// import SettingsScreen from "../../components/settings/SettingsScreen";
// import { useNavigation } from "expo-router";
// import { auth } from "../../firebase";
// import { useEffect } from "react";

// export default function ProfileScreen() {
//   const navigation = useNavigation();
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerTitle: "Profil",
//       headerRight: () => (
//         <TouchableOpacity
//           onPress={() => setIsModalVisible(true)}
//           style={{ marginRight: 50 }}
//         >
//           <Ionicons name="settings-outline" size={24} color="white" />
//         </TouchableOpacity>
//       ),
//       headerStyle: {
//         backgroundColor: "#023e8a",
//         height: 75,
//       },
//       headerTitleAlign: "center",
//       headerTintColor: "white",
//     });
//   }, [navigation]);

//   useEffect(() => {
//     const user = auth.currentUser;

//     if (user) {
//       setEmail(user.email);
//       setName(user.displayName ?? "Pa emër");
//     }
//   }, []);

//   const stats = [
//     {
//       id: "1",
//       label: "Raportimet e mia",
//       value: 28,
//       color: "#F5A623",
//       emoji: "📋",
//     },
//     {
//       id: "2",
//       label: "Të rregulluar",
//       value: 12,
//       color: "#4CD964",
//       emoji: "✅",
//     },
//     { id: "3", label: "Në progres", value: 9, color: "#007AFF", emoji: "🔄" },
//     { id: "4", label: "Në pritje", value: 7, color: "#FF3B30", emoji: "🕓" },
//   ];

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.profileContainer}>
//             <Ionicons name="person-circle-outline" size={90} color="#023e8a" />
//             <Text style={styles.name}>{name}</Text>
//             <Text style={styles.email}>{email}</Text>
//           </View>

//           <View style={styles.statsContainer}>
//             {stats.map((item) => (
//               <SettingsCard key={item.id} item={item} />
//             ))}
//           </View>
//         </ScrollView>

//         <Modal
//           visible={isModalVisible}
//           animationType="slide"
//           transparent={true}
//           onRequestClose={() => setIsModalVisible(false)}
//         >
//           <View style={styles.modalContainer}>
//             <View style={styles.modalContent}>
//               <SettingsScreen onClose={() => setIsModalVisible(false)} />
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingTop: 40,
//     paddingHorizontal: 20,
//   },
//   profileContainer: {
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   name: {
//     color: "#000",
//     fontSize: 22,
//     fontWeight: "bold",
//     marginTop: 8,
//   },
//   email: {
//     color: "#000",
//     opacity: 0.7,
//     marginTop: 4,
//     fontSize: 16,
//   },
//   statsContainer: {
//     backgroundColor: "#f2f2f2",
//     borderRadius: 30,
//     paddingVertical: 25,
//     paddingHorizontal: 15,
//     marginBottom: 40,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.2)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: "100%",
//   },
// });
import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsCard from "../../components/settings/SettingsCard";
import SettingsScreen from "../../components/settings/SettingsScreen";
import { useNavigation } from "expo-router";
import { auth } from "../../firebase";
// 1. Import useTheme
import { useTheme } from "../../context/themeContext"; // Adjust path if necessary

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 2. Get the theme and colors
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Profil",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={{ marginRight: 50 }}
        >
          {/* 3. Use theme color for the settings icon */}
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.tabInactive}
          />
        </TouchableOpacity>
      ),
      headerStyle: {
        // 4. Use theme color for header background
        backgroundColor: colors.tabBar,
        height: 75,
      },
      headerTitleAlign: "center",
      // 5. Use theme color for header text
      headerTintColor: colors.tabInactive,
    });
  }, [navigation, colors]); // Add 'colors' as a dependency

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setEmail(user.email);
      setName(user.displayName ?? "Pa emër");
    }
  }, []);

  const stats = [
    // ... stats array remains the same
    {
      id: "1",
      label: "Raportimet e mia",
      value: 28,
      color: "#F5A623",
      emoji: "📋",
    },
    {
      id: "2",
      label: "Të rregulluar",
      value: 12,
      color: "#4CD964",
      emoji: "✅",
    },
    { id: "3", label: "Në progres", value: 9, color: "#007AFF", emoji: "🔄" },
    { id: "4", label: "Në pritje", value: 7, color: "#FF3B30", emoji: "🕓" },
  ];

  return (
    // 6. Use theme color for SafeAreaView background
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* 7. Use theme color for main container background */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileContainer}>
            {/* 8. Use theme color for icon */}
            <Ionicons
              name="person-circle-outline"
              size={90}
              color={colors.tabBar}
            />
            {/* 9. Use theme color for text */}
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {email}
            </Text>
          </View>

          {/* 10. Use theme color for stats container background */}
          <View
            style={[styles.statsContainer, { backgroundColor: colors.card }]}
          >
            {stats.map((item) => (
              <SettingsCard key={item.id} item={item} /> // (Assuming SettingsCard will also be updated)
            ))}
          </View>
        </ScrollView>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          {/* 11. Use theme color for modal overlay (using modalOverlay from themeContext) */}
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.modalOverlay },
            ]}
          >
            <View style={styles.modalContent}>
              <SettingsScreen onClose={() => setIsModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  email: {
    opacity: 0.7, // Keep this for light opacity effect
    marginTop: 4,
    fontSize: 16,
  },
  statsContainer: {
    borderRadius: 30,
    paddingVertical: 25,
    paddingHorizontal: 15,
    marginBottom: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "100%",
  },
});
