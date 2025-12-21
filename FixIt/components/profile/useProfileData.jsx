import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useProfileData() {
  const [firstName, setFirstName] = useState("Duke u ngarkuar...");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (!user) {
        setFirstName("Nuk ka përdorues të kyçur");
        setLastName("");
        setEmail("");
        setProfileImageUrl(null);
        return;
      }

      setEmail(user.email || "Nuk ka email");
      setFirstName("Duke u ngarkuar...");

      const docRef = doc(db, "users", user.uid);

      unsubscribeFirestore = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const fName = data.firstName || "";
            const lName = data.lastName || "";
            const imageUrl = data.profileImageUrl || null;

            setFirstName(fName || "Pa emër");
            setLastName(lName);
            setProfileImageUrl(imageUrl);
          } else {
            setFirstName("Pa emër");
            setLastName("Dokumenti nuk ekziston");
            setProfileImageUrl(null);
          }
        },
        (error) => {
          console.error("Gabim gjatë marrjes së dokumentit: ", error);
          setFirstName("Gabim");
          setLastName("(Shiko konsolën)");
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  return { firstName, lastName, email, profileImageUrl, setProfileImageUrl };
}
