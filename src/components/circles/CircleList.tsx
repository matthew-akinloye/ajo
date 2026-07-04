import { AjoTypography } from "@/components/ui/AjoTypography";
import { CircleOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";



interface CircleListProps {
  circles: CircleOut[];
  onPress?: (circle: Circle) => void;
  showJoinButton?: boolean;
  onJoin?: (circle: Circle) => void;
  emptyMessage?: string;
}

export function CircleList({
  circles,
  onPress,
  showJoinButton = false,
  onJoin,
  emptyMessage = "No circles yet",
}: CircleListProps) {
  const router = useRouter();

  if (circles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="users" size={32} color={colors.textTertiary} />
        <AjoTypography variant="body" color={colors.textSecondary} style={styles.emptyText}>
          {emptyMessage}
        </AjoTypography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {circles.map((circle) => (
        <TouchableOpacity
          key={circle.id}
          style={styles.card}
          onPress={() => {
            if (onPress) onPress(circle);
            else router.push(`/circle/${circle.id}`);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <AjoTypography variant="cardTitle" style={styles.name}>
              {circle.name}
            </AjoTypography>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(circle.status) }]}>
              <AjoTypography variant="chip" color={colors.textInverted}>
                {circle.status.toUpperCase()}
              </AjoTypography>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Feather name="calendar" size={14} color={colors.textTertiary} />
              <AjoTypography variant="bodySmall" color={colors.textSecondary}>
                ₦{circle.contribution_amount.toLocaleString()} / {circle.frequency}
              </AjoTypography>
            </View>
            <View style={styles.detailItem}>
              <Feather name="users" size={14} color={colors.textTertiary} />
              <AjoTypography variant="bodySmall" color={colors.textSecondary}>
                {circle.member_count}/{circle.member_capacity}
              </AjoTypography>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((circle.total_saved / circle.cycle_goal) * 100, 100)}%` },
                ]}
              />
            </View>
            <AjoTypography variant="chip" color={colors.textTertiary}>
              ₦{circle.total_saved.toLocaleString()} / ₦{circle.cycle_goal.toLocaleString()}
            </AjoTypography>
          </View>

          {showJoinButton && circle.status !== "active" && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => onJoin?.(circle)}
            >
              <AjoTypography variant="buttonSmall" color={colors.primary}>
                Join
              </AjoTypography>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "forming":
      return colors.warning;
    case "active":
      return colors.success;
    case "completed":
      return colors.textTertiary;
    default:
      return colors.surface;
  }
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  details: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  joinButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
});