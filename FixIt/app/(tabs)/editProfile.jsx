import React, { memo } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../context/themeContext";
import { useProfileForm } from "../../hooks/useProfileForm";
import {
  ProfileHeader,
  LoadingView,
  FormInput,
} from "../../components/profile";

const EditProfile = memo(() => {
  const { colors } = useTheme();
  const { form, errors, isLoading, isSubmitting, handleChange, handleSubmit } =
    useProfileForm();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <ProfileHeader title="Edit Profile" />

      <View style={styles.content}>
        <FormInput
          label="Emri"
          value={form.firstName}
          onChangeText={(text) => handleChange("firstName", text)}
          placeholder="Shkruani emrin"
          error={errors.firstName}
          editable={!isSubmitting}
        />

        <FormInput
          label="Mbiemri"
          value={form.lastName}
          onChangeText={(text) => handleChange("lastName", text)}
          placeholder="Shkruani mbiemrin"
          error={errors.lastName}
          editable={!isSubmitting}
        />

        <FormInput
          label="Email"
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          editable={!isSubmitting}
        />

        <FormInput
          label="Password aktual (për ruajtje)"
          value={form.currentPassword}
          onChangeText={(text) => handleChange("currentPassword", text)}
          placeholder="Shkruani password-in aktual"
          secureTextEntry
          error={errors.currentPassword}
          editable={!isSubmitting}
        />

        <FormInput
          label="Password i ri (opsional)"
          value={form.newPassword}
          onChangeText={(text) => handleChange("newPassword", text)}
          placeholder="Lëreni bosh nëse nuk doni të ndryshoni"
          secureTextEntry
          error={errors.newPassword}
          editable={!isSubmitting}
        />

        <FormInput
          label="Konfirmo password-in e ri"
          value={form.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          placeholder="Përsëritni password-in e ri"
          secureTextEntry
          error={errors.confirmPassword}
          editable={!isSubmitting}
        />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tabBar }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
});

EditProfile.displayName = "EditProfile";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditProfile;
