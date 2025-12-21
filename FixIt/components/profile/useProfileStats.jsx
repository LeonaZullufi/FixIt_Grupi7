import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function useProfileStats() {
  const [stats, setStats] = useState([
    {
      id: "1",
      label: "Raportimet e mia",
      value: 0,
      color: "#F5A623",
      emoji: "📋",
    },
    {
      id: "2",
      label: "Të rregulluar",
      value: 0,
      color: "#4CD964",
      emoji: "✅",
    },
    { id: "3", label: "Në progres", value: 0, color: "#007AFF", emoji: "🔄" },
    { id: "4", label: "Në pritje", value: 0, color: "#FF3B30", emoji: "🕓" },
  ]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return;
    }

    const reportsQuery = query(
      collection(db, "reports"),
      where("userEmail", "==", user.email)
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        let totalReports = 0;
        let finishedReports = 0;
        let inProgressReports = 0;
        let pendingReports = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          totalReports++;

          if (data.status === "completed") {
            finishedReports++;
          } else if (data.status === "in_progress") {
            inProgressReports++;
          } else {
            pendingReports++;
          }
        });

        setStats([
          {
            id: "1",
            label: "Raportimet e mia",
            value: totalReports,
            color: "#F5A623",
            emoji: "📋",
          },
          {
            id: "2",
            label: "Të rregulluar",
            value: finishedReports,
            color: "#4CD964",
            emoji: "✅",
          },
          {
            id: "3",
            label: "Në progres",
            value: inProgressReports,
            color: "#007AFF",
            emoji: "🔄",
          },
          {
            id: "4",
            label: "Në pritje",
            value: pendingReports,
            color: "#FF3B30",
            emoji: "🕓",
          },
        ]);
      },
      (error) => {
        console.error("Gabim gjatë marrjes së raporteve: ", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return stats;
}
