/**
 * àjó Notifications Screen
 * Based on HomeScreen blueprint - typography-first, minimal design
 */

import Header from "@/components/smt/smt-header";
import { Card } from "@/components/ui/Card";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { apiService } from "@/services/api.service";
import { NotificationOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { Feather } from "@expo/vector-icons";
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
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notificationsData, inviteData] = await Promise.all([
        apiService.listNotifications(),
        apiService.getInviteCode?.() ?? Promise.resolve(""), // fallback if method not exists
      ]);
      setNotifications(notificationsData);
      setInviteCode(inviteData ?? "");
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
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

  const getNotificationIcon = (type: string): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "payment":
        return "credit-card";
      case "invite":
        return "user-plus";
      case "reminder":
        return "bell";
      case "payout":
        return "arrow-up";
      default:
        return "bell";
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
        return colors.info || colors.primary;
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
        {/* Header */}
        <Header
          title="Notifications"
          rightButtons={[
            {
              icon: <Feather name="check-circle" size={20} color={colors.textPrimary} />,
              onPress: handleMarkAllRead,
            },
          ]}
        />

        {/* Invite Code Card */}
        <Card variant="default" padding={spacing.lg} style={styles.inviteCard}>
          <View style={styles.inviteContent}>
            <View style={styles.inviteText}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                YOUR INVITE CODE
              </AjoTypography>
              {isLoading && !inviteCode ? (
                <AjoTypography variant="body" color={colors.textTertiary}>
                  Loading...
                </AjoTypography>
              ) : (
                <AjoTypography variant="body" style={styles.inviteCode}>
                  {inviteCode || ""}
                </AjoTypography>
              )}
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Share with friends to earn rewards
              </AjoTypography>
            </View>
            <View style={styles.inviteIcon}>
              <Feather name="gift" size={24} color={colors.primary} />
            </View>
          </View>
        </Card>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <AjoTypography variant="body" color={colors.textTertiary}>
                Loading notifications...
              </AjoTypography>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="bell-off" size={48} color={colors.textTertiary} />
              <AjoTypography
                variant="body"
                color={colors.textTertiary}
                style={styles.emptyText}
              >
                No notifications yet
              </AjoTypography>
            </View>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                variant="default"
                padding={spacing.md}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.notificationUnread,
                ]}
              >
                <Pressable
                  onPress={() => handleNotificationPress(notification.id)}
                  style={styles.notificationPressable}
                >
                  <View style={styles.notificationHeader}>
                    <View
                      style={[
                        styles.notificationIcon,
                        { backgroundColor: getNotificationColor(notification.type) + "20" },
                      ]}
                    >
                      <Feather
                        name={getNotificationIcon(notification.type)}
                        size={20}
                        color={getNotificationColor(notification.type)}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <AjoTypography variant="bodySmall" color={colors.textPrimary}>
                        {notification.title}
                      </AjoTypography>
                      <AjoTypography variant="chip" color={colors.textTertiary}>
                        {formatTimestamp(notification.created_at)}
                      </AjoTypography>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </View>
                  <AjoTypography
                    variant="bodySmall"
                    color={colors.textSecondary}
                    style={styles.notificationMessage}
                  >
                    {notification.body}
                  </AjoTypography>
                </Pressable>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (same as before) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  inviteCard: {
    marginBottom: spacing.md,
    backgroundColor: "#F5FFF7",
    borderRadius: radius.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFFFA",
  },
  inviteContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inviteText: { flex: 1, rowGap: spacing.xs },
  inviteCode: {
    letterSpacing: 1,
    color: colors.primary,
  },
  inviteIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: "#D7FEE2",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationsList: {
    gap: spacing.sm,
  },
  notificationCard: {
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
  },
  notificationUnread: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  notificationPressable: {
    gap: spacing.xs,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  notificationContent: {
    flex: 1,
    rowGap: 2,
  },
  notificationMessage: {
    lineHeight: 20,
    paddingLeft: spacing.md,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  loadingState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
});