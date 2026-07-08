/**
 * àjó Join Circle Screen
 * Join a circle using invite code or browse available circles
 */

import Header from "@/components/smt/smt-header";
import AjoButton from "@/components/ui/AjoButton";
import { AjoCard } from "@/components/ui/AjoCard";
import AjoInput from "@/components/ui/AjoInput";
import { AjoTypography } from "@/components/ui/AjoTypography";
import ReusableBottomSheet, { ReusableBottomSheetRef } from "@/components/smt/smt-bottom-sheet";
import { apiService } from "@/services/api.service";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JoinCircleScreen() {
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bottom sheet refs
  const messageSheetRef = useRef<ReusableBottomSheetRef>(null);
  const confirmSheetRef = useRef<ReusableBottomSheetRef>(null);

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

  // Confirm sheet state
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message: string;
    circleName: string;
    onConfirm: () => void;
  }>({
    title: "",
    message: "",
    circleName: "",
    onConfirm: () => {},
  });

  // Show message bottom sheet
  const showMessage = (title: string, message: string, isSuccess: boolean, onOk?: () => void) => {
    setMessageData({ title, message, isSuccess, onOk });
    messageSheetRef.current?.snapToIndex(0);
  };

  // Show confirm bottom sheet
  const showConfirm = (title: string, message: string, circleName: string, onConfirm: () => void) => {
    setConfirmData({ title, message, circleName, onConfirm });
    confirmSheetRef.current?.snapToIndex(0);
  };

  // Handle joining by invite code
  const handleJoinByInvite = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      showMessage("Missing Code", "Please enter an invite code.", false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Preview the invite to get circle info
      const preview = await apiService.previewInvite(code);
      if (!preview || !preview.circle) {
        showMessage("Invalid Code", "This invite code does not exist or has expired.", false);
        return;
      }

      // Show confirmation with circle details
      showConfirm(
        `Join "${preview.circle.name}"?`,
        `You are about to join the circle "${preview.circle.name}" with a contribution amount of ₦${preview.circle.contribution_amount.toLocaleString()} per ${preview.circle.frequency}.`,
        preview.circle.name,
        async () => {
          // Actually accept the invite
          try {
            const membership = await apiService.acceptInvite(code);
            showMessage(
              "Success",
              `You have successfully joined "${preview.circle.name}"!`,
              true,
              () => {
                // Navigate to circle detail
                router.push(`/(tabs)/circle/${membership.circle_id}`);
              }
            );
            setInviteCode("");
          } catch (error: any) {
            showMessage(
              "Error",
              error.message || "Failed to join the circle.",
              false
            );
          }
        }
      );
    } catch (error: any) {
      showMessage(
        "Error",
        error.message || "Invalid invite code. Please check and try again.",
        false
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to explore tab
  const handleBrowse = () => {
    router.push("/explore" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Join a Circle"
            rightButtons={[
              {
                icon: <Feather name="x" size={24} color={colors.textPrimary} />,
                onPress: () => router.back(),
              },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <AjoTypography variant="tab" style={styles.title}>
              Join a Circle
            </AjoTypography>
            <AjoTypography
              variant="body"
              color={colors.textSecondary}
              style={styles.subtitle}
            >
              Enter an invite code or browse available circles to join a savings
              group.
            </AjoTypography>
          </View>

          {/* Invite Code Section */}
          <AjoCard padding={spacing.lg} style={styles.card}>
            <View style={styles.sectionHeader}>
              <Feather name="link" size={20} color={colors.primary} />
              <AjoTypography variant="cardTitle" style={styles.sectionTitle}>
                Join with Invite Code
              </AjoTypography>
            </View>
            <AjoTypography
              variant="bodySmall"
              color={colors.textTertiary}
              style={styles.sectionDescription}
            >
              Enter the invite code shared by a friend to join their circle.
            </AjoTypography>

            <AjoInput
              placeholder="Enter invite code (e.g., AJO-X7K9)"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              containerStyle={styles.input}
              leftIcon={
                <Feather name="key" size={20} color={colors.textTertiary} />
              }
            />

            <AjoButton
              title="Join Circle"
              onPress={handleJoinByInvite}
              loading={isSubmitting}
              disabled={!inviteCode.trim() || isSubmitting}
              style={styles.joinButton}
            />
          </AjoCard>

          {/* Browse Section */}
          <AjoCard padding={spacing.lg} style={styles.card}>
            <View style={styles.sectionHeader}>
              <Feather name="search" size={20} color={colors.primary} />
              <AjoTypography variant="cardTitle" style={styles.sectionTitle}>
                Browse Circles
              </AjoTypography>
            </View>
            <AjoTypography
              variant="bodySmall"
              color={colors.textTertiary}
              style={styles.sectionDescription}
            >
              Explore public circles that are open to new members.
            </AjoTypography>

            <TouchableOpacity
              style={styles.browseButton}
              onPress={handleBrowse}
            >
              <View style={styles.browseButtonContent}>
                <Feather name="compass" size={20} color={colors.primary} />
                <AjoTypography variant="body" color={colors.primary}>
                  Browse Available Circles
                </AjoTypography>
              </View>
              <Feather name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>
          </AjoCard>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Feather name="info" size={16} color={colors.textTertiary} />
            <AjoTypography
              variant="bodySmall"
              color={colors.textSecondary}
              style={styles.infoText}
            >
              When you join a circle, you'll need to make your first
              contribution to activate your membership.
            </AjoTypography>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---- Bottom Sheets ---- */}

      {/* Message Sheet */}
      <ReusableBottomSheet
        ref={messageSheetRef}
        snapPoints={["auto"]}
        initialIndex={-1}
        enablePanDownToClose
      >
        {({ close }) => (
          <View style={styles.messageSheetContent}>
            <Feather
              name={messageData.isSuccess ? "check-circle" : "alert-circle"}
              size={48}
              color={messageData.isSuccess ? colors.success : colors.error}
            />
            <AjoTypography variant="h2" style={styles.messageTitle}>
              {messageData.title}
            </AjoTypography>
            <AjoTypography variant="body" color={colors.textSecondary} style={styles.messageBody}>
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
        snapPoints={["auto"]}
        initialIndex={-1}
        enablePanDownToClose
      >
        {({ close }) => (
          <View style={styles.confirmSheetContent}>
            <Feather name="users" size={40} color={colors.primary} />
            <AjoTypography variant="h2" style={styles.confirmTitle}>
              {confirmData.title}
            </AjoTypography>
            <AjoTypography variant="body" color={colors.textSecondary} style={styles.confirmMessage}>
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
                  confirmData.onConfirm();
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    lineHeight: 23,
  },
  sectionDescription: {
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  input: {
    marginBottom: spacing.md,
  },
  joinButton: {
    width: "100%",
  },
  browseButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  browseButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  // Message sheet
  messageSheetContent: {
    padding: spacing.lg,
    alignItems: "center",
  },
  messageTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  messageBody: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  messageButton: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  // Confirm sheet
  confirmSheetContent: {
    padding: spacing.lg,
    alignItems: "center",
  },
  confirmTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  confirmMessage: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
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