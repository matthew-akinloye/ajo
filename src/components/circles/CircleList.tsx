import { AjoTypography } from "@/components/ui/AjoTypography";
import { CircleOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CircleListProps {
  circles: CircleOut[]; // ✅ uses real API type
  onPress?: (circle: CircleOut) => void;
  showJoinButton?: boolean;
  onJoin?: (circle: CircleOut) => void;
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
        <AjoTypography
          variant="body"
          color={colors.textSecondary}
          style={styles.emptyText}
        >
          {emptyMessage}
        </AjoTypography>
        <AjoTypography
          variant="bodySmall"
          color={colors.textTertiary}
          style={styles.emptySubtext}
        >
          Create or join a circle to get started.
        </AjoTypography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {circles.map((circle) => {
        const progress =
          circle.cycle_goal > 0
            ? Math.min((circle.total_saved / circle.cycle_goal) * 100, 100)
            : 0;

        const statusColor = getStatusColor(circle.status);

        return (
          <TouchableOpacity
            key={circle.id}
            style={styles.card}
            onPress={() => {
              if (onPress) {
                onPress(circle);
              } else {
                router.push(`/circles/${circle.id}`);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.header}>
              <AjoTypography variant="cardTitle" style={styles.name}>
                {circle.name}
              </AjoTypography>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <AjoTypography variant="chip" color={colors.textInverted}>
                  {circle.status.toUpperCase()}
                </AjoTypography>
              </View>
            </View>

            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Feather
                  name="calendar"
                  size={14}
                  color={colors.textTertiary}
                />
                <AjoTypography variant="bodySmall" color={colors.textSecondary}>
                  ₦{circle.contribution_amount.toLocaleString()} /{" "}
                  {circle.frequency}
                </AjoTypography>
              </View>
              <View style={styles.detailItem}>
                <Feather name="users" size={14} color={colors.textTertiary} />
                <AjoTypography variant="bodySmall" color={colors.textSecondary}>
                  Capacity: {circle.member_capacity}
                </AjoTypography>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                ₦{circle.total_saved.toLocaleString()} / ₦
                {circle.cycle_goal.toLocaleString()}
              </AjoTypography>
            </View>

            {showJoinButton && circle.status === "forming" && (
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
        );
      })}
    </View>
  );
}

function getStatusColor(status: CircleOut["status"]): string {
  switch (status) {
    case "forming":
      return colors.warning || "#F59E0B";
    case "active":
      return colors.success || "#10B981";
    case "completed":
      return colors.textTertiary || "#9CA3AF";
    default:
      return colors.surface || "#E5E7EB";
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
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
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
    borderRadius: radius.md,
    backgroundColor: colors.primary + "10",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    marginTop: spacing.sm,
  },
  emptySubtext: {
    textAlign: "center",
    color: colors.textTertiary,
  },
});
