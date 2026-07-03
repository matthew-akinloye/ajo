import { QuickActionButton } from "@/components/QuickActionButton";
import Header from "@/components/smt/smt-header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Text } from "@/components/ui/Text";
import { apiService } from "@/services/api.service";
import { CircleOut, ContributionOut, WalletOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function HomeScreen() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletOut | null>(null);
  const [activeCircle, setActiveCircle] = useState<CircleOut | null>(null);
  const [contributions, setContributions] = useState<ContributionOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [walletData, circlesData] = await Promise.all([
        apiService.getWallet(),
        apiService.listCircles(),
      ]);

      setWallet(walletData);

      // Get first active circle as the "active" one
      const active =
        circlesData.find((c) => c.status === "active") ||
        circlesData[0] ||
        null;
      setActiveCircle(active);

      if (active) {
        const contributionsData = await apiService.listContributions(active.id);
        setContributions(contributionsData);
      }
    } catch (error) {
      console.error("Failed to load home data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHomeData();
    setIsRefreshing(false);
  };

  const handleContribute = async () => {
    if (!activeCircle) {
      Alert.alert("No circle", "Join or create a circle before contributing.");
      return;
    }

    Alert.prompt(
      "Make contribution",
      "Enter your 4-digit PIN to confirm",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async (pin) => {
            if (!pin || pin.length !== 4) {
              Alert.alert("Invalid PIN", "Please enter a 4-digit PIN.");
              return;
            }
            try {
              await apiService.makeContribution(activeCircle.id, { pin });
              Alert.alert("Success", "Your contribution has been recorded.");
              await loadHomeData();
            } catch (error) {
              Alert.alert("Unable to contribute", error instanceof Error ? error.message : "Please try again.");
            }
          },
        },
      ],
      "secure-text",
    );
  };

  const handleWithdraw = () => {
    Alert.alert("Withdraw funds", "Withdrawals will be processed from the wallet screen after you enter your bank details.");
    router.push("/wallet");
  };

  const handleInvite = async () => {
    if (!activeCircle) {
      Alert.alert("No circle", "Create or join a circle to share an invite.");
      return;
    }

    try {
      const invite = await apiService.createInvite(activeCircle.id, { invitee_contact: null });
      Alert.alert("Invite ready", `Invite code: ${invite.code}`);
    } catch (error) {
      Alert.alert("Unable to create invite", error instanceof Error ? error.message : "Please try again.");
    }
  };

  // Empty state
  if (!isLoading && !activeCircle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="h1">Welcome</Text>
            <Pressable>
              <MaterialIcons
                name="notifications-none"
                size={28}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>

          <View style={styles.emptyContent}>
            <MaterialIcons
              name="groups"
              size={80}
              color={colors.textTertiary}
            />
            <Text variant="h2" style={styles.emptyTitle}>
              Start Your First Circle
            </Text>
            <Text
              variant="body"
              color={colors.textSecondary}
              style={styles.emptyText}
            >
              Join an existing savings circle or create your own to save
              together with friends and family.
            </Text>
            <Button
              label="Browse Circles"
              variant="primary"
              size="lg"
              fullWidth
              style={styles.exploreButton}
              onPress={() => router.push("/explore")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active state with circle data
  const memberCount = activeCircle ? contributions.length : 0;
  const progress = activeCircle
    ? memberCount / activeCircle.member_capacity
    : 0;
  const savedAmount = activeCircle ? activeCircle.total_saved : 0;
  const goalAmount = activeCircle ? activeCircle.cycle_goal : 0;

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
        {/* <View style={styles.header}>
          <View>
            <Text variant="label" color={colors.textTertiary}>
              Welcome back
            </Text>
            <Text variant="subtitle" style={{ marginTop: spacing.xs }}>
              Good day
            </Text>
          </View>
          <Pressable>
            <MaterialIcons
              name="notifications-none"
              size={28}
              color={colors.textPrimary}
            />
          </Pressable>
        </View> */}

        <Header
          title="Ajo"
          rightComponent={
            <View style={styles.circleBadge}>
              <MaterialIcons
                name="check-circle"
                size={16}
                color={colors.primary}
              />
              <Text
                variant="subtitle"
                color={colors.primary}
                weight="600"
                style={{ marginLeft: spacing.xs }}
              >
                {activeCircle && (
                  <>
                    {memberCount}/{activeCircle.member_capacity}
                  </>
                )}
              </Text>
            </View>
          }
          rightButtons={[
            {
              icon: (
                <MaterialIcons
                  name="notifications-none"
                  size={24}
                  color={colors.textPrimary}
                />
              ), // color injected automatically
              onPress: () => console.log("Search"),
            },
          ]}
        />

        {activeCircle && (
          <>
            {/* Active Circle Label */}
            {/* <View style={styles.circleLabel}>
              <Text variant="label" color={colors.textTertiary}>
                Active Circle
              </Text>
              <View style={styles.circleBadge}>
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  variant="subtitle"
                  color={colors.primary}
                  weight="600"
                  style={{ marginLeft: spacing.xs }}
                >
                  {activeCircle.currentMembers}/{activeCircle.memberCapacity}
                </Text>
              </View>
            </View> */}

            {/* Hero Card - Savings Goal */}
            <Card
              variant="gradient"
              padding={spacing.xl}
              style={styles.heroCard}
            >
              <View style={styles.heroHeader}>
                <View>
                  <Text
                    variant="label"
                    color={colors.textInverted}
                    style={{ opacity: 0.8 }}
                  >
                    {activeCircle.name}
                  </Text>
                  <View style={styles.amountContainer}>
                    <Text
                      variant="subtitle"
                      color={colors.textInverted}
                      style={{ marginTop: spacing.sm }}
                    >
                      ₦{savedAmount.toLocaleString()}
                    </Text>
                    <Text
                      variant="subtitle"
                      color={colors.textInverted}
                      style={{ opacity: 0.8 }}
                    >
                      {" "}
                      of ₦{goalAmount.toLocaleString()}
                    </Text>
                  </View>
                  {wallet && (
                    <View style={styles.walletBadge}>
                      <Text variant="label" color={colors.textInverted}>
                        Wallet: ₦{wallet.balance.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressRingContainer}>
                  <ProgressRing
                    progress={progress}
                    size={60}
                    strokeWidth={3}
                    color={colors.textInverted}
                    backgroundColor={colors.textInverted + "30"}
                    showPercentage={true}
                  />
                </View>
              </View>
            </Card>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <View style={styles.quickActions}>
                <QuickActionButton
                  icon="add-circle-outline"
                  label="Contribute"
                  onPress={handleContribute}
                />
                <QuickActionButton
                  icon="share"
                  label="Invite"
                  onPress={handleInvite}
                />
                <QuickActionButton
                  icon="arrow-upward"
                  label="Withdraw"
                  onPress={handleWithdraw}
                />

                {/* <QuickActionButton
                  icon="more-horiz"
                  label="More"
                  onPress={handleMore}
                /> */}
              </View>
            </View>

            {/* Recent Contributions Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="subtitle">Recent Activity</Text>
                <Pressable>
                  <Text variant="subtitle" color={colors.primary} weight="600">
                    View All
                  </Text>
                </Pressable>
              </View>

              <Card variant="default" padding={spacing.lg}>
                {contributions.length === 0 ? (
                  <Text
                    variant="body"
                    color={colors.textTertiary}
                    style={{ textAlign: "center", padding: spacing.lg }}
                  >
                    No contributions yet
                  </Text>
                ) : (
                  contributions.map((contribution, index) => (
                    <View key={contribution.id} style={styles.contributionRow}>
                      <Text variant="body" color={colors.textPrimary}>
                        ₦{contribution.amount.toLocaleString()}
                      </Text>
                      <Text
                        variant="bodySmall"
                        color={
                          contribution.status === "paid"
                            ? colors.success
                            : contribution.status === "late"
                              ? colors.warning
                              : colors.error
                        }
                      >
                        {contribution.status.toUpperCase()}
                      </Text>
                    </View>
                  ))
                )}
              </Card>
            </View>

            {/* Circle Stats */}
            <View style={styles.section}>
              <Text variant="subtitle" style={{ marginBottom: spacing.lg }}>
                Circle Details
              </Text>
              <View style={styles.statsGrid}>
                <Card
                  variant="default"
                  padding={spacing.lg}
                  style={styles.statCard}
                >
                  <Text
                    variant="label"
                    color={colors.textTertiary}
                    style={{ marginBottom: spacing.sm }}
                  >
                    Members
                  </Text>
                  <Text variant="h2" color={colors.primary}>
                    {memberCount}
                  </Text>
                  <Text variant="bodySmall" color={colors.textTertiary}>
                    of {activeCircle.member_capacity}
                  </Text>
                </Card>

                <Card
                  variant="default"
                  padding={spacing.lg}
                  style={styles.statCard}
                >
                  <Text
                    variant="label"
                    color={colors.textTertiary}
                    style={{ marginBottom: spacing.sm }}
                  >
                    Per Member
                  </Text>
                  <Text variant="h2" color={colors.primary}>
                    ₦{activeCircle.contribution_amount.toLocaleString()}
                  </Text>
                  <Text variant="bodySmall" color={colors.textTertiary}>
                    per cycle
                  </Text>
                </Card>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  emptyContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  // Empty state
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
  },
  emptyTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  exploreButton: {
    width: "100%",
    maxWidth: 300,
  },
  // Active state
  circleLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  circleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  circleName: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    marginBottom: spacing.xl,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  walletBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.textInverted + "20",
  },
  progressRingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  payoutInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.textInverted + "30",
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  payoutBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.textInverted + "10",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignSelf: "flex-start",
  },
  quickActionsContainer: {
    marginBottom: spacing.xl,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  contributionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  statCard: {
    flex: 1,
  },
});
