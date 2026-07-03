/**
 * àjó Notification Item Component
 * Based on Coinbase iOS notification list items
 * Supports different notification types with unread indicator
 */

import { AjoCard, AjoTypography } from "@/components/ui";
import { colors, spacing } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

export type NotificationType = "payout" | "contribution" | "member" | "rules";

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  unread?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function NotificationItem({
  type,
  title,
  message,
  timestamp,
  unread = false,
  onPress,
  style,
}: NotificationItemProps) {
  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "payout":
        return "wallet-outline";
      case "contribution":
        return "arrow-up-circle-outline";
      case "member":
        return "person-add-outline";
      case "rules":
        return "document-text-outline";
      default:
        return "notifications-outline";
    }
  };

  const getIconColor = (): string => {
    switch (type) {
      case "payout":
        return colors.success;
      case "contribution":
        return colors.primary;
      case "member":
        return colors.primary;
      case "rules":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={style}>
      <AjoCard variant="flat" padding={spacing[4]} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.left}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconColor() + "20" },
              ]}
            >
              <Ionicons name={getIcon()} size={20} color={getIconColor()} />
            </View>
            {unread && <View style={styles.unreadDot} />}
          </View>

          <View style={styles.middle}>
            <AjoTypography variant="cardTitle" style={styles.title}>
              {title}
            </AjoTypography>
            <AjoTypography
              variant="bodySmall"
              color={colors.textSecondary}
              style={styles.message}
            >
              {message}
            </AjoTypography>
          </View>

          <View style={styles.right}>
            <AjoTypography variant="bodySmall" color={colors.textTertiary}>
              {timestamp}
            </AjoTypography>
          </View>
        </View>
      </AjoCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[2],
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  left: {
    marginRight: spacing[3],
    position: "relative",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  middle: {
    flex: 1,
  },
  title: {
    marginBottom: spacing[1],
  },
  message: {
    lineHeight: 18,
  },
  right: {
    marginLeft: spacing[2],
  },
});
