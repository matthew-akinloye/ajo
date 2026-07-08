/**
 * àjó Profile Screen
 * Minimal, typography-first design – matches HomeScreen blueprint
 */

import Header from "@/components/smt/smt-header";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { AjoTypography } from "@/components/ui/AjoTypography";
import ReusableBottomSheet, { ReusableBottomSheetRef } from "@/components/smt/smt-bottom-sheet";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import { UserOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserOut | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [trustNarrative, setTrustNarrative] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bottom sheet refs
  const messageSheetRef = useRef<ReusableBottomSheetRef>(null);
  const promptSheetRef = useRef<ReusableBottomSheetRef>(null);
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

  // Prompt sheet state
  const [promptData, setPromptData] = useState<{
    title: string;
    placeholder: string;
    secureTextEntry: boolean;
    onConfirm?: (value: string) => void;
    onCancel?: () => void;
  }>({
    title: "",
    placeholder: "",
    secureTextEntry: false,
  });
  const [promptInputValue, setPromptInputValue] = useState("");

  // Confirm sheet state (for logout)
  const [confirmData, setConfirmData] = useState<{
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    title: "",
    message: "",
  });

  // --- Helpers to show sheets ---
  const showMessageSheet = (title: string, message: string, isSuccess: boolean, onOk?: () => void) => {
    setMessageData({ title, message, isSuccess, onOk });
    messageSheetRef.current?.snapToIndex(0);
  };

  const showPromptSheet = (
    title: string,
    placeholder: string,
    secureTextEntry: boolean,
    onConfirm: (value: string) => void,
    onCancel?: () => void
  ) => {
    setPromptData({ title, placeholder, secureTextEntry, onConfirm, onCancel });
    setPromptInputValue("");
    promptSheetRef.current?.snapToIndex(0);
  };

  const showConfirmSheet = (title: string, message: string, onConfirm: () => void) => {
    setConfirmData({ title, message, onConfirm });
    confirmSheetRef.current?.snapToIndex(0);
  };

  // --- Load data ---
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [me, walletData, inviteData] = await Promise.all([
        apiService.getMe(),
        apiService.getWallet(),
        apiService.getInviteCode?.() ?? Promise.resolve("AJO-2024-X7K9"),
      ]);
      setUser(me);
      setInviteCode(inviteData?.code ?? inviteData ?? "AJO-2024-X7K9");

      let narrative = `${me.full_name} is building a strong savings history and continues to participate actively in the community.`;
      if (walletData) {
        narrative += ` Current wallet balance: ₦${walletData.balance.toLocaleString()}.`;
      }
      setTrustNarrative(narrative);
    } catch (error) {
      console.error("Failed to load profile data:", error);
      showMessageSheet("Error", "Could not load profile data.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfileData();
    setIsRefreshing(false);
  };

  // --- Actions ---
  const handleLogout = async () => {
    await logout();
    router.replace("/landing");
  };

  const handleSettingPress = (setting: string) => {
    if (setting === "notifications") {
      router.push("/notifications");
      return;
    }

    if (setting === "security") {
      showPromptSheet(
        "Verify PIN",
        "Enter your 4-digit PIN",
        true,
        async (pin) => {
          if (!pin || pin.length !== 4) {
            showMessageSheet("Invalid PIN", "Please enter a 4-digit PIN.", false);
            return;
          }
          try {
            await apiService.verifyPin({ pin });
            showMessageSheet("Success", "Your PIN was verified successfully.", true);
          } catch (error) {
            showMessageSheet(
              "Verification failed",
              error instanceof Error ? error.message : "Please try again.",
              false
            );
          }
        }
      );
      return;
    }

    if (setting === "verify") {
      showPromptSheet(
        "Verify identity",
        "Enter your document value (e.g., NIN)",
        false,
        async (value) => {
          if (!value) {
            showMessageSheet("Missing value", "Please provide a document value.", false);
            return;
          }
          try {
            await apiService.submitVerification({ type: "nin", value_or_url: value });
            showMessageSheet(
              "Submitted",
              "Your verification request is now pending review.",
              true
            );
          } catch (error) {
            showMessageSheet(
              "Submission failed",
              error instanceof Error ? error.message : "Please try again.",
              false
            );
          }
        }
      );
      return;
    }

    // All other settings
    showMessageSheet("Coming soon", `${setting.replace("-", " ")} will be available soon.`, false);
  };

  const handleLogoutPress = () => {
    showConfirmSheet(
      "Log Out",
      "Are you sure you want to log out?",
      handleLogout
    );
  };

  // --- Render ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <AjoTypography variant="body" color={colors.textTertiary}>
            Loading profile...
          </AjoTypography>
        </View>
      </SafeAreaView>
    );
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
          title="Profile"
          rightButtons={[
            {
              icon: <Feather name="settings" size={20} color={colors.textPrimary} />,
              onPress: () => handleSettingPress("settings"),
            },
          ]}
        />

        {user && (
          <>
            {/* User Card */}
            <Card variant="default" padding={spacing.lg} style={styles.userCard}>
              <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                  <Feather name="user" size={28} color={colors.primary} />
                </View>
                <View style={styles.userInfo}>
                  <AjoTypography variant="h3" style={styles.userName}>
                    {user.full_name}
                  </AjoTypography>
                  <AjoTypography variant="chip" color={colors.textTertiary}>
                    {user.email ?? "No email provided"}
                  </AjoTypography>
                </View>
                {user.verification_status === "verified" && (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check-circle" size={16} color={colors.success} />
                  </View>
                )}
              </View>
            </Card>

            {/* Trust Score Card */}
            <Card variant="default" padding={spacing.xl} style={styles.trustCard}>
              <View style={styles.trustHeader}>
                <AjoTypography variant="h3" style={styles.trustTitle}>
                  Trust Score
                </AjoTypography>
                <View style={styles.trustScoreBadge}>
                  <AjoTypography variant="h2" color={colors.success}>
                    {user.trust_score}
                  </AjoTypography>
                </View>
              </View>

              <View style={styles.trustProgress}>
                <ProgressRing
                  progress={user.trust_score / 100}
                  size={90}
                  strokeWidth={7}
                  color={colors.success}
                  backgroundColor={colors.divider}
                />
              </View>

              <AjoTypography
                variant="body"
                color={colors.textSecondary}
                style={styles.trustNarrative}
              >
                {trustNarrative}
              </AjoTypography>
            </Card>

            {/* Invite Code Card */}
            <Card variant="default" padding={spacing.lg} style={styles.inviteCard}>
              <View style={styles.inviteContent}>
                <View style={styles.inviteText}>
                  <AjoTypography variant="chip" color={colors.textTertiary}>
                    YOUR INVITE CODE
                  </AjoTypography>
                  <AjoTypography variant="h2" style={styles.inviteCode}>
                    {inviteCode || "AJO-2024-X7K9"}
                  </AjoTypography>
                  <AjoTypography variant="chip" color={colors.textTertiary}>
                    Share with friends to earn rewards
                  </AjoTypography>
                </View>
                <View style={styles.inviteIcon}>
                  <Feather name="gift" size={24} color={colors.primary} />
                </View>
              </View>
            </Card>

            {/* Settings List */}
            <View style={styles.settingsSection}>
              <AjoTypography variant="monoSmall" style={styles.settingsTitle}>
                Settings
              </AjoTypography>

              <View style={styles.settingsList}>
                <SettingItem
                  icon="user"
                  label="Edit Profile"
                  onPress={() => handleSettingPress("edit-profile")}
                />
                <SettingItem
                  icon="lock"
                  label="Security"
                  onPress={() => handleSettingPress("security")}
                />
                <SettingItem
                  icon="shield"
                  label="Verify Identity"
                  onPress={() => handleSettingPress("verify")}
                />
                <SettingItem
                  icon="bell"
                  label="Notifications"
                  onPress={() => handleSettingPress("notifications")}
                />
                <SettingItem
                  icon="help-circle"
                  label="Help & Support"
                  onPress={() => handleSettingPress("help")}
                />
                <SettingItem
                  icon="file-text"
                  label="Terms & Privacy"
                  onPress={() => handleSettingPress("terms")}
                />
              </View>
            </View>

            {/* Logout Button */}
            <Pressable style={styles.logoutButton} onPress={handleLogoutPress}>
              <AjoTypography variant="button" color={colors.error}>
                Log Out
              </AjoTypography>
            </Pressable>
          </>
        )}
      </ScrollView>

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
            <View style={styles.messageIcon}>
              <Feather
                name={messageData.isSuccess ? "check-circle" : "alert-circle"}
                size={48}
                color={messageData.isSuccess ? colors.success : colors.error}
              />
            </View>
            <AjoTypography variant="h2" style={styles.messageTitle}>
              {messageData.title}
            </AjoTypography>
            <AjoTypography variant="body" color={colors.textSecondary} style={styles.messageBody}>
              {messageData.message}
            </AjoTypography>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                close();
                if (messageData.onOk) messageData.onOk();
              }}
            >
              <AjoTypography variant="button" color={colors.buttonText}>
                OK
              </AjoTypography>
            </TouchableOpacity>
          </View>
        )}
      </ReusableBottomSheet>

      {/* Prompt Sheet */}
      <ReusableBottomSheet
        ref={promptSheetRef}
        snapPoints={["40%"]}
        initialIndex={-1}
        enablePanDownToClose
        onClose={() => {
          if (promptData.onCancel) promptData.onCancel();
        }}
      >
        {({ close }) => (
          <View style={styles.promptSheetContent}>
            <AjoTypography variant="h2" style={styles.promptTitle}>
              {promptData.title}
            </AjoTypography>
            <TextInput
              style={styles.promptInput}
              placeholder={promptData.placeholder}
              placeholderTextColor={colors.textTertiary}
              keyboardType={promptData.secureTextEntry ? "default" : "numeric"}
              secureTextEntry={promptData.secureTextEntry}
              autoFocus
              value={promptInputValue}
              onChangeText={setPromptInputValue}
              onSubmitEditing={() => {
                if (promptInputValue && promptData.onConfirm) {
                  promptData.onConfirm(promptInputValue);
                  close();
                }
              }}
            />
            <View style={styles.promptButtons}>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptCancelButton]}
                onPress={() => {
                  if (promptData.onCancel) promptData.onCancel();
                  close();
                }}
              >
                <AjoTypography variant="button" color={colors.textPrimary}>
                  Cancel
                </AjoTypography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptConfirmButton]}
                onPress={() => {
                  if (promptInputValue && promptData.onConfirm) {
                    promptData.onConfirm(promptInputValue);
                    close();
                  }
                }}
              >
                <AjoTypography variant="button" color={colors.buttonText}>
                  Confirm
                </AjoTypography>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ReusableBottomSheet>

      {/* Confirm Sheet (for logout) */}
      <ReusableBottomSheet
        ref={confirmSheetRef}
        snapPoints={["auto"]}
        initialIndex={-1}
        enablePanDownToClose
      >
        {({ close }) => (
          <View style={styles.confirmSheetContent}>
            <Feather name="log-out" size={40} color={colors.error} />
            <AjoTypography variant="h2" style={styles.confirmTitle}>
              {confirmData.title}
            </AjoTypography>
            <AjoTypography variant="body" color={colors.textSecondary} style={styles.confirmMessage}>
              {confirmData.message}
            </AjoTypography>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancelButton]}
                onPress={close}
              >
                <AjoTypography variant="button" color={colors.textPrimary}>
                  Cancel
                </AjoTypography>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmDangerButton]}
                onPress={() => {
                  close();
                  if (confirmData.onConfirm) confirmData.onConfirm();
                }}
              >
                <AjoTypography variant="button" color={colors.buttonText}>
                  Log Out
                </AjoTypography>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ReusableBottomSheet>
    </SafeAreaView>
  );
}

// --- Setting Item Component ---
function SettingItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Feather name={icon} size={20} color={colors.textSecondary} />
        <AjoTypography variant="body" style={styles.settingLabel}>
          {label}
        </AjoTypography>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textTertiary} />
    </Pressable>
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
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  // User Card
  userCard: {
    marginBottom: spacing.md,
    backgroundColor: "#F5FFF7",
    borderRadius: radius.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFFFA",
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 2,
  },
  verifiedBadge: {
    marginLeft: spacing.sm,
  },
  // Trust Card
  trustCard: {
    marginBottom: spacing.md,
    alignItems: "center",
    backgroundColor: "#FEFEFC",
    borderWidth: 1,
    borderColor: "#D7FEE2",
    borderRadius: radius.lg,
  },
  trustHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.md,
  },
  trustTitle: {
    color: colors.textPrimary,
  },
  trustScoreBadge: {
    backgroundColor: colors.success + "15",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
  },
  trustProgress: {
    marginBottom: spacing.md,
  },
  trustNarrative: {
    textAlign: "center",
    lineHeight: 22,
  },
  // Invite Card
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
  inviteText: {
    flex: 1,
    rowGap: spacing.xs,
  },
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
  // Settings
  settingsSection: {
    marginBottom: spacing.md,
  },
  settingsTitle: {
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  settingsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  settingLabel: {
    color: colors.textPrimary,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },

  // ---- Bottom Sheet Content Styles ----
  messageSheetContent: {
    padding: spacing.lg,
    alignItems: "center",
  },
  messageIcon: { marginBottom: spacing.md },
  messageTitle: {
    marginBottom: spacing.sm,
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
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  promptSheetContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  promptTitle: {
    textAlign: "center",
    marginBottom: spacing.md,
  },
  promptInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  promptButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  promptButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  promptCancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptConfirmButton: {
    backgroundColor: colors.primary,
  },
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
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  confirmCancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmDangerButton: {
    backgroundColor: colors.error,
  },
});