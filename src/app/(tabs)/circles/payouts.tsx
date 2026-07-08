/**
 * àjó Payout Management Screen
 * Manage payouts for circles you administer
 */

import Header from "@/components/smt/smt-header";
import { AjoCard } from "@/components/ui/AjoCard";
import { AjoTypography } from "@/components/ui/AjoTypography";
import AjoButton from "@/components/ui/AjoButton";
import { PinModal } from "@/components/PinModal";
import { apiService } from "@/services/api.service";
import { CircleOut, MembershipOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function PayoutsScreen() {
  const [circles, setCircles] = useState<CircleOut[]>([]);
  const [members, setMembers] = useState<MembershipOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<MembershipOut | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const circlesData = await apiService.listCircles();
      setCircles(circlesData);

      // Get all members from all circles
      const allMembers: MembershipOut[] = [];
      for (const circle of circlesData) {
        try {
          const circleMembers = await apiService.listMembers(circle.id);
          allMembers.push(...circleMembers);
        } catch (error) {
          console.error(`Failed to load members for circle ${circle.id}:`, error);
        }
      }
      setMembers(allMembers);
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

  const handleMarkPaid = (member: MembershipOut) => {
    setSelectedPayout(member);
    setShowPinModal(true);
  };

  const handlePinConfirm = async (pin: string) => {
    if (!selectedPayout) return;

    try {
      await apiService.verifyPin({ pin });
      // Note: markPayoutPaid may not exist in API yet
      // await apiService.markPayoutPaid(selectedPayout.id, { pin });
      Alert.alert("Coming Soon", "Payout marking will be available when the backend supports it.");
      await loadData();
      setShowPinModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to mark payout as paid");
    }
  };

  const getCircleName = (circleId: number) => {
    const circle = circles.find((c) => c.id === circleId);
    return circle?.name || "Unknown Circle";
  };

  const getPendingPayouts = () => {
    return members.filter((m) => m.status === "active" && m.payout_position !== null);
  };

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
        <Header title="Payout Management" />

        {/* Summary Card */}
        <AjoCard style={styles.summaryCard}>
          <AjoTypography variant="cardTitle" style={styles.sectionTitle}>
            Payout Summary
          </AjoTypography>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <AjoTypography variant="amountHero" color={colors.primary}>
                {getPendingPayouts().length}
              </AjoTypography>
              <AjoTypography variant="label" color={colors.textTertiary}>
                Pending Payouts
              </AjoTypography>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <AjoTypography variant="amountHero" color={colors.success}>
                {members.filter((m) => m.status === "active").length}
              </AjoTypography>
              <AjoTypography variant="label" color={colors.textTertiary}>
                Active Members
              </AjoTypography>
            </View>
          </View>
        </AjoCard>

        {/* Payout Queue */}
        <AjoCard style={styles.payoutsCard}>
          <AjoTypography variant="cardTitle" style={styles.sectionTitle}>
            Payout Queue
          </AjoTypography>

          {isLoading ? (
            <View style={styles.loadingState}>
              <AjoTypography
                variant="body"
                color={colors.textTertiary}
              >
                Loading payouts...
              </AjoTypography>
            </View>
          ) : getPendingPayouts().length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="account-balance-wallet"
                size={48}
                color={colors.textTertiary}
              />
              <AjoTypography
                variant="body"
                color={colors.textTertiary}
                style={styles.emptyText}
              >
                No pending payouts
              </AjoTypography>
              <AjoTypography
                variant="bodySmall"
                color={colors.textSecondary}
                style={styles.emptySubtext}
              >
                Payouts will appear here when members are due to receive their
                savings.
              </AjoTypography>
            </View>
          ) : (
            <View style={styles.payoutsList}>
              {getPendingPayouts()
                .sort((a, b) => (a.payout_position || 0) - (b.payout_position || 0))
                .map((member) => (
                  <View key={member.id} style={styles.payoutItem}>
                    <View style={styles.payoutHeader}>
                      <View style={styles.payoutInfo}>
                        <View style={styles.positionBadge}>
                          <AjoTypography variant="label" color={colors.textInverted}>
                            #{member.payout_position}
                          </AjoTypography>
                        </View>
                        <View style={styles.memberDetails}>
                          <AjoTypography variant="cardTitle">
                            Member {member.user_id}
                          </AjoTypography>
                          <AjoTypography
                            variant="bodySmall"
                            color={colors.textTertiary}
                          >
                            {getCircleName(member.circle_id)}
                          </AjoTypography>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: colors.warning + "20",
                          },
                        ]}
                      >
                        <AjoTypography
                          variant="label"
                          color={colors.warning}
                          style={{ fontSize: 10 }}
                        >
                          PENDING
                        </AjoTypography>
                      </View>
                    </View>

                    <View style={styles.payoutActions}>
                      <AjoButton
                        title="View Details"
                        variant="outline"
                        style={styles.viewButton}
                        onPress={() =>
                          Alert.alert(
                            "Payout Details",
                            `Member ${member.user_id} from ${getCircleName(member.circle_id)}\nPosition: #${member.payout_position}`
                          )
                        }
                      />
                      <AjoButton
                        title="Mark Paid"
                        style={styles.paidButton}
                        onPress={() => handleMarkPaid(member)}
                      />
                    </View>
                  </View>
                ))}
            </View>
          )}
        </AjoCard>
      </ScrollView>

      <PinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinConfirm}
        title="Confirm Payout"
        message="Enter your PIN to mark this payout as paid"
      />
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
    paddingVertical: spacing.lg,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  payoutsCard: {
    marginBottom: spacing.md,
  },
  loadingState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.md,
  },
  emptySubtext: {
    marginTop: spacing.sm,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  payoutsList: {
    gap: spacing.md,
  },
  payoutItem: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  payoutInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  positionBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  memberDetails: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  payoutActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  viewButton: {
    flex: 1,
  },
  paidButton: {
    flex: 1,
  },
});
