import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import AboutAppComponent from "../../components/contacts/AboutAppComponent";
import FAQSectionComponent from "../../components/contacts/FAQSectionComponent";
import ContactSection from "../../components/contacts/ContactSection";
import AppInfo from "../../components/contacts/AppInfo";
import { useTheme } from "../../context/themeContext";

export default function ContactScreen() {
  const navigation = useNavigation();
  const lastHeaderState = useRef(true);
  const { colors, theme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;

    const barStyle = theme === "dark" ? "light-content" : "dark-content";

    if (currentY > 50 && lastHeaderState.current) {
      navigation.setOptions({ headerShown: false });
      lastHeaderState.current = false;
      StatusBar.setBarStyle(barStyle);
    }

    if (currentY < 30 && !lastHeaderState.current) {
      navigation.setOptions({ headerShown: true });
      lastHeaderState.current = true;
      StatusBar.setBarStyle("light-content");
    }
  };

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        let fName = "";
        let lName = "";

        if (snap.exists()) {
          const data = snap.data();
          fName = data.firstName || "";
          lName = data.lastName || "";
        }

        setForm((prevForm) => ({
          ...prevForm,
          name: fName,
          lastName: lName,
          email: user.email || "",
        }));
      } catch (error) {
        console.error("Gabim gjatë marrjes së të dhënave të userit:", error);
        setForm((prevForm) => ({
          ...prevForm,
          email: auth.currentUser?.email || "",
        }));
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const validateForm = () => {
    let newErrors = {};

    if (form.message.trim().length < 6)
      newErrors.message = "Mesazhi duhet të ketë të paktën 6 karaktere.";

    if (!auth.currentUser) {
      if (!form.name.trim()) newErrors.name = "Emri kërkohet.";
      if (!form.lastName.trim()) newErrors.lastName = "Mbiemri kërkohet.";
      if (!form.email.trim()) newErrors.email = "Email-i kërkohet.";
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      let msg = "Ju lutem korrigjoni këto gabime:\n\n";

      if (validationErrors.name) msg += `• ${validationErrors.name}\n`;
      if (validationErrors.lastName) msg += `• ${validationErrors.lastName}\n`;
      if (validationErrors.email) msg += `• ${validationErrors.email}\n`;
      if (validationErrors.message) msg += `• ${validationErrors.message}\n`;

      Alert.alert("Gabime në Formular", msg);
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const messageData = {
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        message: form.message,
        timestamp: serverTimestamp(),
        isRead: false,
        userId: auth.currentUser ? auth.currentUser.uid : "Anonim",
      };

      await addDoc(collection(db, "messages"), messageData);

      Alert.alert(
        "Sukses!",
        "Mesazhi juaj u dërgua me sukses. Ekipi ynë do t’ju kontaktojë së shpejti."
      );

      setForm((prevForm) => ({ ...prevForm, message: "" }));
      setErrors({});
    } catch (error) {
      console.error("Gabim gjatë dërgimit të mesazhit: ", error);
      Alert.alert(
        "Gabim",
        "Nuk mund të dërgohej mesazhi. Ju lutem provoni përsëri më vonë."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View
      style={[styles.mainContainer, { backgroundColor: colors.background }]}
    >
      <KeyboardAwareScrollView
        style={styles.contentContainer}
        enableResetScrollToCoords={false}
        extraScrollHeight={20}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Ionicons name="information-circle" size={28} color="#17cbebff" />
            <Text style={[styles.title, { marginTop: 8, color: colors.text }]}>
              FixIt – Ndihmë & Udhëzime
            </Text>
          </View>

          <AppInfo />
          <AboutAppComponent />
          <FAQSectionComponent />

          <Text style={[styles.title, { marginTop: 10, color: colors.text }]}>
            Informacione Kontakti
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Plotësoni formularin dhe ekipi ynë do t’ju kontaktojë brenda 24
            orëve
          </Text>

          <View
            style={[styles.formContainer, { backgroundColor: colors.card }]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
                !auth.currentUser && errors.name && styles.errorInput,
              ]}
              placeholder="Emri"
              placeholderTextColor={colors.textSecondary}
              value={form.name}
              onChangeText={(text) => handleChange("name", text)}
              editable={!auth.currentUser && !isSubmitting}
              selectTextOnFocus={false}
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
            {!auth.currentUser && errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}

            <TextInput
              ref={lastNameRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
                !auth.currentUser && errors.lastName && styles.errorInput,
              ]}
              placeholder="Mbiemri"
              placeholderTextColor={colors.textSecondary}
              value={form.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
              editable={!auth.currentUser && !isSubmitting}
              selectTextOnFocus={false}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {!auth.currentUser && errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <TextInput
              ref={emailRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
                !auth.currentUser && errors.email && styles.errorInput,
              ]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={form.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              editable={!auth.currentUser && !isSubmitting}
              selectTextOnFocus={false}
              onSubmitEditing={() => messageRef.current?.focus()}
            />
            {!auth.currentUser && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              ref={messageRef}
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
                errors.message && styles.errorInput,
              ]}
              placeholder="Mesazhi (min. 6 karaktere)"
              placeholderTextColor={colors.textSecondary}
              value={form.message}
              onChangeText={(text) => handleChange("message", text)}
              multiline
              numberOfLines={4}
              editable={!isLoading && !isSubmitting}
            />
            {errors.message && (
              <Text style={styles.errorText}>{errors.message}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tabBar }]}
              onPress={handleSubmit}
              disabled={isLoading || isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isLoading
                  ? "Duke ngarkuar..."
                  : isSubmitting
                  ? "Duke dërguar..."
                  : "Dërgo Mesazhin"}
              </Text>
            </TouchableOpacity>
          </View>

          <ContactSection />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  inner: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  formContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  input: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  errorInput: {
    borderWidth: 2,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 5,
  },
});
