import { Contribution } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./ui/Text";

interface ContributionItemProps {
  contribution: Contribution;
}

export const ContributionItem: React.FC<ContributionItemProps> = ({
  contribution,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const statusColor = {
    pending: colors.warning,
    paid: colors.success,
    late: colors.error,
  }[contribution.status];

  const statusLabel = {
    pending: "Pending",
    paid: "Paid",
    late: "Late",
  }[contribution.status];

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.info}>
          <Text variant="body" weight="600">
            {contribution.userName}
          </Text>
          <Text variant="bodySmall" color={colors.textTertiary}>
            {formatDate(contribution.timestamp)}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text variant="body" weight="700" color={colors.textTertiary}>
          ₦{contribution.amount.toLocaleString()}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <Text variant="bodySmall" color={statusColor} weight="600">
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  right: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
});
