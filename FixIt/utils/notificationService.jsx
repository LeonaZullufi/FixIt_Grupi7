import * as Notifications from "expo-notifications";
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
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
 * Save notification to Firestore (without sending push notification)
 * Push notification will be sent when user logs in
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

    // Only save to Firestore, don't send push notification yet
    await addDoc(collection(db, "notifications"), {
      userEmail,
      reportId,
      placeName,
      status,
      description,
      title,
      body,
      read: false,
      notificationSent: false, // Track if push notification was sent
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
 * Send push notification for a single notification document
 * @param {object} notification - Notification document from Firestore
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
      trigger: null, // Show immediately
    });

    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
};

/**
 * Check for unread notifications and send push notifications when user logs in
 * @param {string} userEmail - Email of the logged in user
 */
export const checkAndSendPendingNotifications = async (userEmail) => {
  try {
    // Query unread notifications that haven't been sent yet
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

    // Send push notifications for each unread notification
    const promises = snapshot.docs.map(async (docSnap) => {
      const notification = { id: docSnap.id, ...docSnap.data() };
      
      // Send push notification
      await sendPushNotification(notification);
      
      // Mark as sent
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
