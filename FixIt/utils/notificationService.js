import * as Notifications from "expo-notifications";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permissions not granted");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

/**
 *
 * @param {string} userEmail
 * @param {string} reportId
 * @param {string} placeName
 * @param {string} status
 * @param {string} description
 */
export const saveReportStatusNotification = async (
  userEmail,
  reportId,
  placeName,
  status,
  description = ""
) => {
  try {
    const getStatusMessage = (status) => {
      switch (status) {
        case "pending":
          return "Raporti juaj është pranuar dhe është në pritje";
        case "in_progress":
          return "Raporti juaj është në proces rregullimi";
        case "completed":
          return "Raporti juaj është përfunduar dhe problemi është rregulluar!";
        default:
          return "Statusi i raportit tuaj është përditësuar";
      }
    };

    const statusEmoji = {
      pending: "⏳",
      in_progress: "🔧",
      completed: "✔",
    };

    const title = `${
      statusEmoji[status] || "📋"
    } Statusi i raportit u përditësua`;
    const body = `${getStatusMessage(status)} - ${placeName}`;

    await addDoc(collection(db, "notifications"), {
      userEmail,
      reportId,
      placeName,
      status,
      description,
      title,
      body,
      read: false,
      notificationSent: false,
      createdAt: new Date(),
    });

    console.log("Notification saved to Firestore");
    return true;
  } catch (error) {
    console.error("Error saving notification:", error);
    return false;
  }
};

/**
 *
 * @param {object} notification
 */
export const sendPushNotification = async (notification) => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("Cannot send notification: permissions not granted");
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: {
          reportId: notification.reportId,
          status: notification.status,
          placeName: notification.placeName,
        },
        sound: true,
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
};

/**
 *
 * @param {string} userEmail
 */
export const checkAndSendPendingNotifications = async (userEmail) => {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userEmail", "==", userEmail),
      where("read", "==", false),
      where("notificationSent", "==", false)
    );

    const snapshot = await getDocs(notificationsQuery);

    if (snapshot.empty) {
      console.log("No pending notifications to send");
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("Cannot send notifications: permissions not granted");
      return;
    }

    const promises = snapshot.docs.map(async (docSnap) => {
      const notification = { id: docSnap.id, ...docSnap.data() };

      await sendPushNotification(notification);

      await updateDoc(doc(db, "notifications", docSnap.id), {
        notificationSent: true,
      });
    });

    await Promise.all(promises);
    console.log(`Sent ${snapshot.docs.length} pending notification(s)`);
  } catch (error) {
    console.error("Error checking and sending pending notifications:", error);
  }
};

export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
};
