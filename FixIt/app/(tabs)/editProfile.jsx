import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "../../context/themeContext";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default function EditProfile() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [initialForm, setInitialForm] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Gabim", "Nuk ka përdorues të kyçur.");
        router.replace("/Login");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        let fName = "";
        let lName = "";

        if (docSnap.exists()) {
          const data = docSnap.data();
          fName = data.firstName || "";
          lName = data.lastName || "";
        }

        const initialData = {
          firstName: fName,
          lastName: lName,
          email: user.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };

        setForm(initialData);
        setInitialForm(initialData);
      } catch (error) {
        console.error("Gabim gjatë marrjes së dokumentit: ", error);
        Alert.alert("Gabim", "Nuk mund të ngarkoheshin të dhënat e profilit.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const validateForm = () => {
    let newErrors = {};
    const nameRegex = /^[A-Za-zÀ-ž\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!initialForm) return {};

    const emailChanged = form.email !== initialForm.email;
    const passwordChanged = form.newPassword.length > 0;
    const dataChanged =
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName;
    const requiresPassword = emailChanged || passwordChanged || dataChanged;

    if (!form.firstName.trim())
      newErrors.firstName = "Emri është i detyrueshëm.";
    else if (!nameRegex.test(form.firstName))
      newErrors.firstName = "Emri nuk është valid (vetëm shkronja).";

    if (!form.lastName.trim())
      newErrors.lastName = "Mbiemri është i detyrueshëm.";
    else if (!nameRegex.test(form.lastName))
      newErrors.lastName = "Mbiemri nuk është valid (vetëm shkronja).";

    if (!form.email.trim()) newErrors.email = "Email është i detyrueshëm.";
    else if (!emailRegex.test(form.email))
      newErrors.email = "Email nuk është në format të saktë.";

    if (requiresPassword && !form.currentPassword) {
      newErrors.currentPassword = "Password-i aktual kërkohet për ruajtje.";
    }

    if (passwordChanged) {
      if (form.newPassword.length < 6)
        newErrors.newPassword =
          "Password-i i ri duhet të ketë të paktën 6 karaktere.";

      if (form.newPassword !== form.confirmPassword)
        newErrors.confirmPassword = "Password-et e reja nuk përputhen.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async () => {
    if (isLoading || isSubmitting) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      let msg = "Ju lutem korrigjoni këto gabime:\n\n";
      Object.values(validationErrors).forEach((err) => {
        msg += `• ${err}\n`;
      });
      Alert.alert("Gabime në formular", msg);
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();
    const user = auth.currentUser;
    if (!user || !initialForm) {
      setIsSubmitting(false);
      return;
    }

    const emailChanged = form.email !== initialForm.email;
    const passwordChanged = form.newPassword.length > 0;
    const profileDataChanged =
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName;
    const requiresReauth = emailChanged || passwordChanged;

    try {
      if (requiresReauth) {
        const credential = EmailAuthProvider.credential(
          user.email,
          form.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
      }

      if (emailChanged) {
        await updateEmail(user, form.email);
      }

      if (passwordChanged) {
        await updatePassword(user, form.newPassword);
      }

      if (profileDataChanged) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          firstName: form.firstName,
          lastName: form.lastName,
        });
      }

      Alert.alert("Sukses", "Profili u përditësua me sukses!");

      setInitialForm((prev) => ({
        ...form,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      router.replace("/Profile");
    } catch (error) {
      console.error("Gabim gjatë ruajtjes së profilit:", error);

      let errorMessage =
        "Gabim gjatë ruajtjes së profilit. Ju lutem provoni përsëri.";

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMessage =
          "Password-i aktual është i pasaktë. Ju lutem shkruani password-in tuaj aktual.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "Ky email është tashmë në përdorim nga një tjetër llogari.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "Password-i i ri është shumë i dobët. Përdorni të paktën 6 karaktere.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage =
          "Kërkohet ri-kyçje e fundit. Përpara se të ndryshoni informacione sensitive, ju lutem dilni dhe kyçuni sërish.";
      }

      Alert.alert("Gabim", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: colors.text }}>Duke ngarkuar të dhënat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.replace("/Profile")}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Emri
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
            errors.firstName && styles.inputError,
          ]}
          value={form.firstName}
          onChangeText={(text) => handleChange("firstName", text)}
          placeholder="Shkruani emrin"
          placeholderTextColor={colors.textSecondary}
          editable={!isSubmitting}
        />
        {errors.firstName && (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        )}

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Mbiemri
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
            errors.lastName && styles.inputError,
          ]}
          value={form.lastName}
          onChangeText={(text) => handleChange("lastName", text)}
          placeholder="Shkruani mbiemrin"
          placeholderTextColor={colors.textSecondary}
          editable={!isSubmitting}
        />
        {errors.lastName && (
          <Text style={styles.errorText}>{errors.lastName}</Text>
        )}

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
            errors.email && styles.inputError,
          ]}
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="email@example.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSubmitting}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Password aktual (për ruajtje)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
            errors.currentPassword && styles.inputError,
          ]}
          value={form.currentPassword}
          onChangeText={(text) => handleChange("currentPassword", text)}
          placeholder="Shkruani password-in aktual"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          editable={!isSubmitting}
        />
        {errors.currentPassword && (
          <Text style={styles.errorText}>{errors.currentPassword}</Text>
        )}

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Password i ri (opsional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
            errors.newPassword && styles.inputError,
          ]}
          value={form.newPassword}
          onChangeText={(text) => handleChange("newPassword", text)}
          placeholder="Lëreni bosh nëse nuk doni të ndryshoni"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          editable={!isSubmitting}
        />
        {errors.newPassword && (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        )}

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Konfirmo password-in e ri
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
            errors.confirmPassword && styles.inputError,
          ]}
          value={form.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          placeholder="Përsëritni password-in e ri"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          editable={!isSubmitting}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

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
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  inputError: { borderColor: "#dc3545" },
  errorText: { color: "#dc3545", fontSize: 12, marginTop: 4 },
  saveButton: {
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
