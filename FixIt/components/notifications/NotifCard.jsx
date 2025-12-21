import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/themeContext";
import { useRouter } from "expo-router";

const NotifCard = memo(({ notification, onPress }) => {
  const { colors } = useTheme();
  const router = useRouter();

  const getStatusEmoji = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in_progress":
        return "🔧";
      case "completed":
        return "✔";
      default:
        return "📋";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Në pritje";
      case "in_progress":
        return "Në progres";
      case "completed":
        return "I përfunduar";
      default:
        return "E panjohur";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF3B30";
      case "in_progress":
        return "#FF9500";
      case "completed":
        return "#4CD964";
      default:
        return colors.textSecondary;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Tani";
    if (minutes < 60) return `${minutes} min më parë`;
    if (hours < 24) return `${hours} orë më parë`;
    if (days < 7) return `${days} ditë më parë`;
    return date.toLocaleDateString("sq-AL");
  };

  const handleViewDetails = () => {
    if (onPress) {
      onPress();
    }
    // Navigate to the report details or problems screen
    router.push("/(tabs)/ProblemsScreen");
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: notification.read
            ? colors.card
            : colors.modalBackground,
          borderColor: colors.border,
        },
        !notification.read && styles.unreadCard,
      ]}
      onPress={handleViewDetails}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>
            {getStatusEmoji(notification.status)}
          </Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Statusi i raportit u përditësua
          </Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formatDate(notification.createdAt)}
          </Text>
        </View>
        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: "#007AFF" }]} />
        )}
      </View>

      <View style={styles.body}>
        <Text style={[styles.placeName, { color: colors.text }]}>
          📍 {notification.placeName || "Vend i panjohur"}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Status i ri:
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(notification.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(notification.status) },
              ]}
            >
              {getStatusEmoji(notification.status)}{" "}
              {getStatusText(notification.status)}
            </Text>
          </View>
        </View>
        {notification.description && (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {notification.description}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.viewButton, { backgroundColor: colors.tabBar }]}
        onPress={handleViewDetails}
      >
        <Text style={styles.viewButtonText}>Shiko Detajet</Text>
        <Feather name="arrow-right" size={16} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

NotifCard.displayName = "NotifCard";

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  body: {
    marginBottom: 12,
  },
  placeName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default NotifCard;

