/**
 * àjó Notifications Screen
 * Based on index.tsx blueprint - typography-first, minimal design
 */

import Header from "@/components/smt/smt-header";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { apiService } from "@/services/api.service";
import { NotificationOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.listNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleNotificationPress = async (notificationId: number) => {
    try {
      await apiService.markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((item) => !item.read);
    await Promise.all(unread.map((item) => apiService.markNotificationRead(item.id)));
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })),
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return "payments";
      case "invite":
        return "person-add";
      case "reminder":
        return "alarm";
      case "payout":
        return "account-balance-wallet";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "payment":
        return colors.success;
      case "invite":
        return colors.primary;
      case "reminder":
        return colors.warning;
      case "payout":
        return colors.info;
      default:
        return colors.textTertiary;
    }
  };

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Header
          title="Notifications"
          rightButtons={[
            {
              icon: (
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={colors.textPrimary}
                />
              ),
              onPress: handleMarkAllRead,
            },
          ]}
        />

        {/* Invite Code Card */}
        <Card variant="gradient" padding={spacing.lg} style={styles.inviteCard}>
          <Text
            variant="body"
            color={colors.textInverted}
            style={{ opacity: 0.8 }}
          >
            YOUR INVITE CODE
          </Text>
          <Text
            variant="subtitle"
            color={colors.textInverted}
            style={styles.inviteCode}
          >
            AJO-2024-X7K9
          </Text>
          <Text
            variant="label"
            color={colors.textInverted}
            style={{ opacity: 0.8 }}
          >
            Share with friends to earn rewards
          </Text>
        </Card>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <Text variant="body" color={colors.textTertiary}>
                Loading notifications...
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="notifications-none"
                size={48}
                color={colors.textTertiary}
              />
              <Text
                variant="body"
                color={colors.textTertiary}
                style={styles.emptyText}
              >
                No notifications yet
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                variant="default"
                padding={spacing.lg}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationUnread,
                ]}
              >
                <Pressable
                  onPress={() => handleNotificationPress(notification.id)}
                >
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationIcon}>
                      <MaterialIcons
                        name={getNotificationIcon(notification.type) as any}
                        size={24}
                        color={getNotificationColor(notification.type)}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text variant="label" style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text
                        variant="label"
                        color={colors.textTertiary}
                        style={styles.notificationTime}
                      >
                        {formatTimestamp(notification.created_at)}
                      </Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text
                    variant="label"
                    color={colors.textSecondary}
                    style={styles.notificationMessage}
                  >
                    {notification.body}
                  </Text>
                </Pressable>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
   paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,  },
  inviteCard: {
    marginBottom: spacing.md,
  },
  inviteCode: {
    marginVertical: spacing.sm,
    letterSpacing: 2,
  },
  notificationsList: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  notificationUnread: {
    borderWidth: 3,
    borderColor: colors.border,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationMessage: {
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  loadingState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.sm,
  },
});
