import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { validateProfileForm } from "../utils/validation";
import { getErrorMessage } from "../utils/errorMessages";

const INITIAL_FORM_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const useProfileForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
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
  }, [router]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validate = useCallback(() => {
    const validationErrors = validateProfileForm(form, initialForm);
    setErrors(validationErrors);
    return validationErrors;
  }, [form, initialForm]);

  const changes = useMemo(() => {
    if (!initialForm) return null;

    return {
      emailChanged: form.email !== initialForm.email,
      passwordChanged: form.newPassword.length > 0,
      profileDataChanged:
        form.firstName !== initialForm.firstName ||
        form.lastName !== initialForm.lastName,
      requiresReauth:
        form.email !== initialForm.email || form.newPassword.length > 0,
    };
  }, [form, initialForm]);

  const handleSubmit = useCallback(async () => {
    if (isLoading || isSubmitting || !initialForm) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const msg = `Ju lutem korrigjoni këto gabime:\n\n${Object.values(
        validationErrors
      )
        .map((err) => `• ${err}`)
        .join("\n")}`;
      Alert.alert("Gabime në formular", msg);
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    const user = auth.currentUser;
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    try {
      const {
        emailChanged,
        passwordChanged,
        profileDataChanged,
        requiresReauth,
      } = changes;

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

      const updatedForm = {
        ...form,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      setForm(updatedForm);
      setInitialForm(updatedForm);

      router.replace("/Profile");
    } catch (error) {
      console.error("Gabim gjatë ruajtjes së profilit:", error);
      Alert.alert("Gabim", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoading, isSubmitting, initialForm, form, changes, validate, router]);

  return {
    form,
    errors,
    isLoading,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};
