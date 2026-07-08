/**
 * àjó Circle Detail Screen
 * Shows detailed information about a specific circle
 */

import ReusableBottomSheet, {
  ReusableBottomSheetRef,
} from "@/components/smt/smt-bottom-sheet";
import Header from "@/components/smt/smt-header";
import AjoButton from "@/components/ui/AjoButton";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { Card } from "@/components/ui/Card";
import { PinModal, PinModalRef } from "@/components/ui/PinModal";
import { apiService } from "@/services/api.service";
import {
  CircleOut,
  ContributionOut,
  MembershipOut,
} from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function CircleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const circleId = parseInt(id, 10);

  // Data state
  const [circle, setCircle] = useState<CircleOut | null>(null);
  const [members, setMembers] = useState<MembershipOut[]>([]);
  const [contributions, setContributions] = useState<ContributionOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bottom sheet refs
  const messageSheetRef = useRef<ReusableBottomSheetRef>(null);
  const confirmSheetRef = useRef<ReusableBottomSheetRef>(null);

  // Pin modal ref
  const pinModalRef = useRef<PinModalRef>(null);

  // Message sheet state
  const [messageData, setMessageData] = useState<{
    title: string;
    message: string;
    isSuccess: boolean;
    onOk?: () => void;
  }>({
    title: "",
    message: "",
    isSuccess: false,
  });

  // Confirm sheet state (for actions like contribute/invite)
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message: string;
    action: "contribute" | "invite" | null;
  }>({
    title: "",
    message: "",
    action: null,
  });

  // --- Helpers ---
  const showMessageSheet = (
    title: string,
    message: string,
    isSuccess: boolean,
    onOk?: () => void,
  ) => {
    setMessageData({ title, message, isSuccess, onOk });
    messageSheetRef.current?.snapToIndex(0);
  };

  const showConfirmSheet = (
    title: string,
    message: string,
    action: "contribute" | "invite",
  ) => {
    setConfirmData({ title, message, action });
    confirmSheetRef.current?.snapToIndex(0);
  };

  // --- Load data ---
  useEffect(() => {
    if (circleId) {
      loadCircleData();
    }
  }, [circleId]);

  const loadCircleData = async () => {
    try {
      const [circleData, membersData, contributionsData] = await Promise.all([
        apiService.getCircle(circleId),
        apiService.listMembers(circleId),
        apiService.listContributions(circleId),
      ]);
      setCircle(circleData);
      setMembers(membersData);
      setContributions(contributionsData);
    } catch (error) {
      console.error("Failed to load circle data:", error);
      showMessageSheet("Error", "Could not load circle details.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCircleData();
    setIsRefreshing(false);
  };

  // --- Actions ---
  const handleContribute = () => {
    if (!circle) return;
    showConfirmSheet(
      "Contribute",
      `You are about to contribute ₦${circle.contribution_amount.toLocaleString()} to "${circle.name}".`,
      "contribute",
    );
  };

  const handleInvite = () => {
    if (!circle) return;
    showConfirmSheet(
      "Generate Invite",
      "Create an invite link for this circle. Anyone with the link can join.",
      "invite",
    );
  };

  const handleMembers = () => {
    // Navigate to members list or show a bottom sheet
    // For now, show a message
    showMessageSheet("Members", "View members list (coming soon)", false);
  };

  // Called when confirm sheet confirms
  const handleConfirmAction = () => {
    if (!confirmData.action) return;
    // Open PIN modal
    pinModalRef.current?.show({
      title:
        confirmData.action === "contribute"
          ? "Confirm Contribution"
          : "Generate Invite",
      subtitle:
        confirmData.action === "contribute"
          ? `Enter your PIN to contribute ₦${circle?.contribution_amount.toLocaleString()}`
          : "Enter your PIN to create an invite link",
      onConfirm: async (pin) => {
        try {
          await apiService.verifyPin({ pin });
          if (confirmData.action === "contribute" && circle) {
            await apiService.makeContribution(circle.id, { pin });
            showMessageSheet(
              "Success",
              "Contribution recorded successfully!",
              true,
              () => loadCircleData(),
            );
          } else if (confirmData.action === "invite" && circle) {
            const invite = await apiService.createInvite(circle.id, {
              invitee_contact: null,
            });
            showMessageSheet(
              "Invite Created",
              `Share this code: ${invite.code}`,
              true,
            );
          }
        } catch (error: any) {
          showMessageSheet(
            "Action Failed",
            error.message || "Please try again.",
            false,
          );
        }
      },
    });
  };

  // --- Compute progress ---
  const getProgress = () => {
    if (!circle) return 0;
    return circle.cycle_goal > 0
      ? (circle.total_saved / circle.cycle_goal) * 100
      : 0;
  };

  // --- Render ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <AjoTypography variant="body" color={colors.textTertiary}>
            Loading circle details...
          </AjoTypography>
        </View>
      </SafeAreaView>
    );
  }

  if (!circle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <AjoTypography variant="body" color={colors.textTertiary}>
            Circle not found
          </AjoTypography>
        </View>
      </SafeAreaView>
    );
  }

  const activeMembers = members.filter((m) => m.status === "active").length;

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
          title={circle.name}
          rightButtons={[
            {
              icon: (
                <Feather name="settings" size={20} color={colors.textPrimary} />
              ),
              onPress: () =>
                showMessageSheet(
                  "Settings",
                  "Circle settings (coming soon)",
                  false,
                ),
            },
          ]}
        />

        {/* Circle Status Card */}
        <Card variant="gradient" padding={spacing.xl} style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <AjoTypography
              variant="label"
              color={colors.textInverted}
              style={{ opacity: 0.8 }}
            >
              STATUS
            </AjoTypography>
            <View style={styles.statusBadge}>
              <AjoTypography variant="label" color={colors.textInverted}>
                {circle.status.toUpperCase()}
              </AjoTypography>
            </View>
          </View>
          <AjoTypography
            variant="body"
            color={colors.textInverted}
            style={styles.totalSaved}
          >
            ₦{circle.total_saved.toLocaleString()}
          </AjoTypography>
          <AjoTypography
            variant="label"
            color={colors.textInverted}
            style={{ opacity: 0.8 }}
          >
            of ₦{circle.cycle_goal.toLocaleString()} saved
          </AjoTypography>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${getProgress()}%` }]}
              />
            </View>
            <AjoTypography variant="label" color={colors.textInverted}>
              {getProgress().toFixed(0)}%
            </AjoTypography>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton} onPress={handleContribute}>
            <Feather name="plus-circle" size={24} color={colors.primary} />
            <AjoTypography variant="chip" style={styles.actionLabel}>
              Contribute
            </AjoTypography>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleInvite}>
            <Feather name="share" size={24} color={colors.primary} />
            <AjoTypography variant="chip" style={styles.actionLabel}>
              Invite
            </AjoTypography>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleMembers}>
            <Feather name="users" size={24} color={colors.primary} />
            <AjoTypography variant="chip" style={styles.actionLabel}>
              Members
            </AjoTypography>
          </Pressable>
        </View>

        {/* Circle Details */}
        <View style={styles.section}>
          <AjoTypography variant="monoSmall" style={styles.sectionTitle}>
            Circle Details
          </AjoTypography>
          <Card
            variant="default"
            padding={spacing.lg}
            style={styles.detailCard}
          >
            <View style={styles.detailRow}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Contribution Amount
              </AjoTypography>
              <AjoTypography variant="body">
                ₦{circle.contribution_amount.toLocaleString()}
              </AjoTypography>
            </View>
            <View style={styles.detailRow}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Frequency
              </AjoTypography>
              <AjoTypography variant="body">{circle.frequency}</AjoTypography>
            </View>
            <View style={styles.detailRow}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Members
              </AjoTypography>
              <AjoTypography variant="body">
                {activeMembers}/{circle.member_capacity}
              </AjoTypography>
            </View>
            <View style={styles.detailRow}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Payout Order
              </AjoTypography>
              <AjoTypography variant="body">
                {circle.payout_order}
              </AjoTypography>
            </View>
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Open Join
              </AjoTypography>
              <AjoTypography variant="body">
                {circle.open_join ? "Yes" : "No (approval required)"}
              </AjoTypography>
            </View>
          </Card>
        </View>

        {/* Recent Contributions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AjoTypography variant="monoSmall" style={styles.sectionTitle}>
              Recent Contributions
            </AjoTypography>
            <TouchableOpacity onPress={() => {}}>
              <AjoTypography variant="monoSmall" color={colors.primary}>
                View All
              </AjoTypography>
            </TouchableOpacity>
          </View>
          <Card
            variant="default"
            padding={spacing.md}
            style={styles.transactionCard}
          >
            {contributions.length === 0 ? (
              <AjoTypography
                variant="body"
                color={colors.textTertiary}
                style={styles.emptyState}
              >
                No contributions yet
              </AjoTypography>
            ) : (
              contributions.slice(0, 5).map((contribution, index) => (
                <View
                  key={contribution.id}
                  style={[
                    styles.contributionRow,
                    index < contributions.slice(0, 5).length - 1 &&
                      styles.contributionRowBorder,
                  ]}
                >
                  <View style={styles.contributionLeft}>
                    <View style={styles.contributionIcon}>
                      <Feather name="user" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.contributionInfo}>
                      <AjoTypography
                        variant="bodySmall"
                        color={colors.textPrimary}
                      >
                        Member {contribution.user_id}
                      </AjoTypography>
                      <AjoTypography variant="chip" color={colors.textTertiary}>
                        {new Date(contribution.paid_at).toLocaleDateString()}
                      </AjoTypography>
                    </View>
                  </View>
                  <View style={styles.contributionRight}>
                    <AjoTypography variant="bodySmall" color={colors.primary}>
                      ₦{contribution.amount.toLocaleString()}
                    </AjoTypography>
                    <StatusBadge status={contribution.status} />
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>
      </ScrollView>

      {/* ---- Bottom Sheets ---- */}

      {/* Message Sheet */}
      <ReusableBottomSheet
        ref={messageSheetRef}
        snapPoints={["40%"]}
        initialIndex={-1}
        enablePanDownToClose
      >
        {({ close }) => (
          <View style={styles.messageSheetContent}>
            <View style={styles.messageIcon}>
              <Feather
                name={messageData.isSuccess ? "check-circle" : "alert-circle"}
                size={48}
                color={messageData.isSuccess ? colors.success : colors.error}
              />
            </View>
            <AjoTypography variant="body" style={styles.messageTitle}>
              {messageData.title}
            </AjoTypography>
            <AjoTypography
              variant="mono"
              color={colors.textSecondary}
              style={styles.messageBody}
            >
              {messageData.message}
            </AjoTypography>
            <AjoButton
              style={styles.messageButton}
              onPress={() => {
                close();
                if (messageData.onOk) messageData.onOk();
              }}
            >
              <AjoTypography variant="button" color={colors.buttonText}>
                OK
              </AjoTypography>
            </AjoButton>
          </View>
        )}
      </ReusableBottomSheet>

      {/* Confirm Sheet */}
      <ReusableBottomSheet
        ref={confirmSheetRef}
        snapPoints={["40%"]}
        initialIndex={-1}
        enablePanDownToClose
      >
        {({ close }) => (
          <View style={styles.confirmSheetContent}>
            <Feather name="alert-circle" size={40} color={colors.warning} />
            <AjoTypography variant="body" style={styles.confirmTitle}>
              {confirmData.title}
            </AjoTypography>
            <AjoTypography
              variant="mono"
              color={colors.textSecondary}
              style={styles.confirmMessage}
            >
              {confirmData.message}
            </AjoTypography>
            <View style={styles.confirmButtons}>
              <AjoButton
                style={[styles.confirmButton, styles.confirmCancelButton]}
                onPress={close}
              >
                <AjoTypography variant="button" color={colors.textPrimary}>
                  Cancel
                </AjoTypography>
              </AjoButton>
              <AjoButton
                style={[styles.confirmButton, styles.confirmConfirmButton]}
                onPress={() => {
                  close();
                  handleConfirmAction();
                }}
              >
                <AjoTypography variant="button" color={colors.buttonText}>
                  Confirm
                </AjoTypography>
              </AjoButton>
            </View>
          </View>
        )}
      </ReusableBottomSheet>

      {/* PIN Modal */}
      <PinModal ref={pinModalRef} />
    </SafeAreaView>
  );
}

// --- Helper Components ---
function StatusBadge({ status }: { status: "paid" | "late" | "missed" }) {
  const config = {
    paid: { color: colors.success, label: "Paid" },
    late: { color: colors.warning, label: "Late" },
    missed: { color: colors.error, label: "Missed" },
  }[status];

  return (
    <View
      style={[
        styles.statusBadgeSmall,
        { backgroundColor: config.color + "20" },
      ]}
    >
      <AjoTypography
        variant="chip"
        color={config.color}
        style={{ fontSize: 10 }}
      >
        {config.label.toUpperCase()}
      </AjoTypography>
    </View>
  );
}

// --- Styles ---
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
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  statusCard: {
    marginBottom: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.textInverted + "20",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  totalSaved: {
    marginVertical: spacing.sm,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    marginTop: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.textInverted + "30",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.textInverted,
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  detailCard: {
    borderRadius: radius.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  transactionCard: {
    borderRadius: radius.lg,
  },
  emptyState: {
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  contributionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  contributionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contributionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  contributionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  contributionInfo: {
    flex: 1,
  },
  contributionRight: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  statusBadgeSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  // Bottom sheet styles
  messageSheetContent: {
    padding: spacing.xs,
    alignItems: "center",
  },
  messageIcon: { marginBottom: spacing.md },
  messageTitle: {
    marginBottom: spacing.sm,
    textAlign: "center",
    color: colors.textInverted,
  },
  messageBody: {
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
        color: colors.textInverted,

  },
  messageButton: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  confirmSheetContent: {
    padding: spacing.xs,
    alignItems: "center",
        color: colors.textInverted,

  },
  confirmTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: "center",
    color: colors.textInverted,
  },
  confirmMessage: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    color: colors.textInverted,
  },
  confirmButtons: {
    flexDirection: "row",
    width: "100%",
    gap: spacing.sm,
  },
  confirmButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  confirmCancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmConfirmButton: {
    backgroundColor: colors.primary,
  },
});
