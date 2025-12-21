import React, { useState, useLayoutEffect } from "react";
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsScreen from "../../components/settings/SettingsScreen";
import {
  ProfileImagePicker,
  ProfileInfo,
  ProfileStats,
  useProfileData,
  useProfileStats,
} from "../../components/editProfile";
import { useNavigation } from "expo-router";
import { useTheme } from "../../context/themeContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { colors } = useTheme();
  const { firstName, lastName, email, profileImageUrl, setProfileImageUrl } =
    useProfileData();
  const stats = useProfileStats();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStatusBarHeight: 10,
      headerTitle: "Profil",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={{
            marginRight: 15,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="settings-outline" size={25} color={"white"} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: colors.tabBar,
        height: 35,
      },
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: "bold",
        includeFontPadding: false,
        marginTop: 5,
      },
      headerTitleAlign: "center",
      headerTintColor: "white",
      headerStatusBarHeight: 0,
    });
  }, [navigation, colors.tabInactive, colors.tabBar, colors.text]);

  const handleUploadStart = () => {
    setUploadingImage(true);
  };

  const handleUploadEnd = () => {
    setUploadingImage(false);
  };

  const handleImageUpdate = (newImageUrl) => {
    setProfileImageUrl(newImageUrl);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileContainer}>
            <ProfileImagePicker
              profileImageUrl={profileImageUrl}
              uploadingImage={uploadingImage}
              onUploadStart={handleUploadStart}
              onUploadEnd={handleUploadEnd}
              onImageUpdate={handleImageUpdate}
            />
            <ProfileInfo
              firstName={firstName}
              lastName={lastName}
              email={email}
            />
          </View>

          <ProfileStats stats={stats} />
        </ScrollView>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.modalOverlay },
            ]}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
              ]}
            >
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
