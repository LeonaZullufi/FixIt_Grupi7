import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/themeContext";
import { auth, db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfileImagePicker({
  profileImageUrl,
  uploadingImage,
  onUploadStart,
  onUploadEnd,
  onImageUpdate,
}) {
  const { colors } = useTheme();

  const pickImage = async () => {
    Alert.alert("Zgjidh Foto", "Nga dëshironi të zgjidhni foton?", [
      {
        text: "Anulo",
        style: "cancel",
      },
      {
        text: "Kamera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("Gabim", "Duhet leje për kamerën!");
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });

          if (!result.canceled && result.assets[0]) {
            const base64Image = result.assets[0].base64;
            const dataUrl = `data:image/jpeg;base64,${base64Image}`;
            await saveImageUrl(dataUrl);
          }
        },
      },
      {
        text: "Galeria",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("Gabim", "Duhet leje për galerinë!");
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });

          if (!result.canceled && result.assets[0]) {
            const base64Image = result.assets[0].base64;
            const dataUrl = `data:image/jpeg;base64,${base64Image}`;
            await saveImageUrl(dataUrl);
          }
        },
      },
    ]);
  };

  const saveImageUrl = async (url) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Gabim", "Duhet të jeni i kyçur!");
      return;
    }

    if (onUploadStart) {
      onUploadStart();
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      await updateDoc(userDocRef, {
        profileImageUrl: url,
        updatedAt: new Date().toISOString(),
      });
      if (onImageUpdate) {
        onImageUpdate(url);
      }

      Alert.alert("Sukses", "Fotoja u ruajt me sukses!");
    } catch (error) {
      console.error("Gabim gjatë ruajtjes së URL-së: ", error);
      Alert.alert("Gabim", "Nuk mund të ruhej fotoja. Provoni përsëri.");
    } finally {
      if (onUploadEnd) {
        onUploadEnd();
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={uploadingImage}
      style={styles.imageContainer}
    >
      {uploadingImage ? (
        <View
          style={[
            styles.profileImagePlaceholder,
            { backgroundColor: colors.card },
          ]}
        >
          <ActivityIndicator size="large" color={colors.tabBar} />
        </View>
      ) : profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
      ) : (
        <View
          style={[
            styles.profileImagePlaceholder,
            { backgroundColor: colors.card },
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={90}
            color={colors.tabBar}
          />
        </View>
      )}
      <View
        style={[styles.editIconContainer, { backgroundColor: colors.tabBar }]}
      >
        <Ionicons name="camera" size={20} color="white" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
});
