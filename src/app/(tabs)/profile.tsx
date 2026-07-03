/**
 * àjó Profile Screen
 * Based on index.tsx blueprint - typography-first, minimal design
 */

import Header from "@/components/smt/smt-header";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import { UserOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserOut | null>(null);
  const [trustNarrative, setTrustNarrative] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [me, walletData] = await Promise.all([apiService.getMe(), apiService.getWallet()]);
      setUser(me);
      setTrustNarrative(`${me.full_name} is building a strong savings history and continues to participate actively in the community.`);
      if (walletData) {
        setTrustNarrative((current) => `${current} Current wallet balance: ₦${walletData.balance.toLocaleString()}.`);
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfileData();
    setIsRefreshing(false);
  };

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
      Alert.prompt(
        "Verify PIN",
        "Enter your 4-digit PIN",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Verify",
            onPress: async (pin) => {
              if (!pin || pin.length !== 4) {
                Alert.alert("Invalid PIN", "Please enter a 4-digit PIN.");
                return;
              }
              try {
                await apiService.verifyPin({ pin });
                Alert.alert("Success", "Your PIN was verified successfully.");
              } catch (error) {
                Alert.alert("Verification failed", error instanceof Error ? error.message : "Please try again.");
              }
            },
          },
        ],
        "secure-text",
      );
      return;
    }

    if (setting === "verify") {
      Alert.prompt(
        "Verify identity",
        "Enter your document value",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit",
            onPress: async (value) => {
              if (!value) {
                Alert.alert("Missing value", "Please provide a document value.");
                return;
              }
              try {
                await apiService.submitVerification({ type: "nin", value_or_url: value });
                Alert.alert("Submitted", "Your verification request is now pending review.");
              } catch (error) {
                Alert.alert("Submission failed", error instanceof Error ? error.message : "Please try again.");
              }
            },
          },
        ],
        "plain-text",
      );
      return;
    }

    Alert.alert("Coming soon", `${setting.replace("-", " ")} will be available soon.`);
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
        <Header
          title="Profile"
          rightButtons={[
            {
              icon: (
                <MaterialIcons
                  name="settings"
                  size={24}
                  color={colors.textPrimary}
                />
              ),
              onPress: () => handleSettingPress("settings"),
            },
          ]}
        />

        {isLoading ? (
          <View style={styles.loadingState}>
            <Text variant="body" color={colors.textTertiary}>
              Loading profile...
            </Text>
          </View>
        ) : (
          user && (
            <>
              {/* User Card */}
              <Card
                variant="gradient"
                padding={spacing.xl}
                style={styles.userCard}
              >
                <View style={styles.avatarSection}>
                  <View style={styles.avatar}>
                    <MaterialIcons
                      name="person"
                      size={26}
                      color={colors.textInverted}
                    />
                  </View>
                  <View style={styles.userInfo}>
                    <Text
                      variant="body"
                      color={colors.textInverted}
                      style={styles.userName}
                    >
                      {user.full_name}
                    </Text>
                    <Text
                      variant="label"
                      color={colors.textInverted}
                      style={{ opacity: 0.8 }}
                    >
                      {user.email ?? "No email provided"}
                    </Text>
                  </View>
                  {user.verification_status === "verified" && (
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons
                        name="verified"
                        size={12}
                        color={colors.textInverted}
                      />
                    </View>
                  )}
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text
                      variant="body"
                      color={colors.textInverted}
                      style={styles.statValue}
                    >
                      0
                    </Text>
                    <Text
                      variant="label"
                      color={colors.textInverted}
                      style={{ opacity: 0.8 }}
                    >
                      Circles
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text
                      variant="h1"
                      color={colors.textInverted}
                      style={styles.statValue}
                    >
                      ₦0
                    </Text>
                    <Text
                      variant="label"
                      color={colors.textInverted}
                      style={{ opacity: 0.8 }}
                    >
                      Total Saved
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Trust Score Card */}
              <Card
                variant="default"
                padding={spacing.xl}
                style={styles.trustCard}
              >
                <View style={styles.trustHeader}>
                  <Text variant="h3">Trust Score</Text>
                  <View style={styles.trustScoreBadge}>
                    <Text variant="h2" color={colors.success}>
                      {user.trust_score}
                    </Text>
                  </View>
                </View>

                <View style={styles.trustProgress}>
                  <ProgressRing
                    progress={user.trust_score / 100}
                    size={100}
                    strokeWidth={8}
                    color={colors.success}
                    backgroundColor={colors.divider}
                  />
                </View>

                <Text
                  variant="body"
                  color={colors.textSecondary}
                  style={styles.trustNarrative}
                >
                  {trustNarrative}
                </Text>
              </Card>

              {/* Invite Code */}
              <Card
                variant="default"
                padding={spacing.lg}
                style={styles.inviteCard}
              >
                <Text
                  variant="label"
                  color={colors.textTertiary}
                  style={styles.inviteLabel}
                >
                  YOUR INVITE CODE
                </Text>
                <View style={styles.inviteCode}>
                  <Text variant="h3" color={colors.primary}>
                    invite-code
                  </Text>
                  <Pressable>
                    <MaterialIcons
                      name="content-copy"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </Pressable>
                </View>
              </Card>

              {/* Settings List */}
              <View style={styles.settingsSection}>
                <Text variant="subtitle" style={styles.settingsTitle}>
                  Settings
                </Text>

                <View style={styles.settingsList}>
                  <SettingItem
                    icon="person"
                    label="Edit Profile"
                    onPress={() => handleSettingPress("edit-profile")}
                  />
                  <SettingItem
                    icon="verified-user"
                    label="Security"
                    onPress={() => handleSettingPress("security")}
                  />
                  <SettingItem
                    icon="badge"
                    label="Verify Identity"
                    onPress={() => handleSettingPress("verify")}
                  />
                  <SettingItem
                    icon="notifications"
                    label="Notifications"
                    onPress={() => handleSettingPress("notifications")}
                  />
                  <SettingItem
                    icon="help"
                    label="Help & Support"
                    onPress={() => handleSettingPress("help")}
                  />
                  <SettingItem
                    icon="description"
                    label="Terms & Privacy"
                    onPress={() => handleSettingPress("terms")}
                  />
                </View>
              </View>

              {/* Logout Button */}
              <Pressable
                style={styles.logoutButton}
                onPress={() => handleLogout()}
              >
                <Text variant="label" color={colors.error} weight="600">
                  Log Out
                </Text>
              </Pressable>
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <MaterialIcons
          name={icon as any}
          size={24}
          color={colors.textTertiary}
        />
        <Text variant="body" style={styles.settingLabel}>
          {label}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={colors.textTertiary}
      />
    </Pressable>
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
  loadingState: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  userCard: {
    marginBottom: spacing.md,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    marginBottom: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  trustCard: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  trustHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: spacing.md,
  },
  trustScoreBadge: {
    backgroundColor: colors.success + "20",
    paddingHorizontal: spacing.sm,
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
  inviteCard: {
    marginBottom: spacing.md,
  },
  inviteLabel: {
    marginBottom: spacing.sm,
  },
  inviteCode: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.lg,
  },
  settingsSection: {
    marginBottom: spacing.md,
  },
  settingsTitle: {
    marginBottom: spacing.md,
  },
  settingsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    marginLeft: spacing.md,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
});
