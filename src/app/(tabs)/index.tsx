import Header from "@/components/smt/smt-header";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { AjoLogo } from "@/components/ui/AjoLogo";
import { Card } from "@/components/ui/Card";
import { PinModal, PinModalRef } from "@/components/ui/PinModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import { CircleOut, ContributionOut, WalletOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import AjoButton from "@/components/ui/AjoButton";
import { radius } from "@/theme/radius";
import { CircleList } from "@/components/circles/CircleList";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const pinModalRef = useRef<PinModalRef>(null);

  const [wallet, setWallet] = useState<WalletOut | null>(null);
  const [circles, setCircles] = useState<CircleOut[]>([]);
  const [activeCircle, setActiveCircle] = useState<CircleOut | null>(null);
  const [contributions, setContributions] = useState<ContributionOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadHomeData();
    }
  }, [isAuthenticated]);

  const loadHomeData = async () => {
    try {
      const [walletData, circlesData] = await Promise.all([
        apiService.getWallet(),
        apiService.listCircles(),
      ]);

      setWallet(walletData);
      setCircles(circlesData);

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

  // PIN‑protected actions
  const handleContribute = () => {
    if (!activeCircle) {
      Alert.alert(
        "No active circle",
        "Join or create a circle before contributing.",
      );
      return;
    }
    pinModalRef.current?.show({
      title: "Confirm Contribution",
      subtitle: `Enter your PIN to contribute ₦${activeCircle.contribution_amount.toLocaleString()}`,
      onConfirm: async (pin) => {
        await apiService.verifyPin({ pin });
        const contribution = await apiService.makeContribution(
          activeCircle.id,
          { pin },
        );
        await loadHomeData();
        Alert.alert(
          "Success",
          `Contribution of ₦${contribution.amount.toLocaleString()} recorded.`,
        );
      },
    });
  };

  const handleInvite = () => {
    if (!activeCircle) {
      Alert.alert(
        "No active circle",
        "Create or join a circle to share an invite.",
      );
      return;
    }
    pinModalRef.current?.show({
      title: "Generate Invite",
      subtitle: "Enter your PIN to create an invite link",
      onConfirm: async (pin) => {
        await apiService.verifyPin({ pin });
        const invite = await apiService.createInvite(activeCircle.id, {
          invitee_contact: null,
        });
        Alert.alert("Invite ready", `Share this code: ${invite.code}`);
        // Optionally copy to clipboard
      },
    });
  };

  const handleWithdraw = () => {
    router.push("/wallet");
  };

  const handleFundWallet = () => {
    router.push("/wallet");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Recent contributions
  const renderRecentActivity = () => {
    if (!activeCircle || contributions.length === 0) {
      return (
        <AjoTypography
          variant="bodySmall"
          color={colors.textTertiary}
          style={styles.noActivity}
        >
          No contributions yet
        </AjoTypography>
      );
    }
    return contributions.slice(0, 3).map((c) => (
      <View key={c.id} style={styles.activityRow}>
        <View style={styles.activityIcon}>
          <Feather name="user" size={12} color={colors.textInverted} />
        </View>
        <View style={styles.activityInfo}>
          <AjoTypography variant="bodySmall" color={colors.textPrimary}>
            {c.user_id || "Member"}
          </AjoTypography>
          <AjoTypography variant="bodySmall" color={colors.textTertiary}>
            {new Date(c.paid_at).toLocaleDateString()}
          </AjoTypography>
        </View>
        <AjoTypography variant="bodySmall" color={colors.primary}>
          ₦{c.amount.toLocaleString()}
        </AjoTypography>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                c.status === "paid" ? colors.successTint : colors.errorTint,
            },
          ]}
        >
          <AjoTypography
            variant="chip"
            color={c.status === "paid" ? colors.success : colors.error}
          >
            {c.status.toUpperCase()}
          </AjoTypography>
        </View>
      </View>
    ));
  };

  // Circles list with proper navigation
  const renderCirclesList = () => {
    return (
      <CircleList
        circles={circles} // CircleOut[]
        onPress={(circle) => router.push(`/circles/${circle.id}`)}
        showJoinButton={false}
        // onJoin={(circle) => handleJoin(circle.id)}
        emptyMessage="You haven't joined or created any circles yet."
      />
    );
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
          leftComponent={<AjoLogo size="large" variant="symbol" />}
          rightButtons={[
            {
              icon: (
                <Feather name="bell" size={20} color={colors.textPrimary} />
              ),
              onPress: () => router.push("/notifications"),
            },
            {
              icon: (
                <Feather name="user" size={20} color={colors.textPrimary} />
              ),
              onPress: () => router.push("/profile"),
            },
          ]}
        />

        <View style={styles.greetingContainer}>
          <AjoTypography variant="tab" style={styles.greeting}>
            {getGreeting()}, {user?.full_name?.split(" ")[0]}
          </AjoTypography>
          <AjoTypography variant="bodySmall" color={colors.textSecondary}>
            What would you like to do today?
          </AjoTypography>
        </View>

        {/* Journey Card */}
        <Card variant="default" padding={spacing.lg} style={styles.journeyCard}>
          <View style={styles.journeyContent}>
            <View style={styles.journeyText}>
              <AjoTypography variant="cardTitle" style={styles.journeyTitle}>
                Start your Ajo journey
              </AjoTypography>
              <AjoTypography variant="bodySmall" color={colors.textTertiary}>
                Create or join a circle and start building your financial future
                with people you trust.
              </AjoTypography>
            </View>
            <Image
              source={require("@/assets/images/hero.png")}
              style={styles.journeyImage}
            />
          </View>
          <View style={styles.journeyActions}>
            <AjoButton
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => router.push("/circles/create")}
            >
              <Feather name="users" size={12} color={colors.buttonText} />
              <AjoTypography variant="buttonSmall" color={colors.buttonText}>
                Create a circle
              </AjoTypography>
            </AjoButton>
            <AjoButton
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => router.push("/circles/join")}
            >
              <Feather name="link" size={12} color={colors.primary} />
              <AjoTypography variant="buttonSmall" color={colors.primary}>
                Join a circle
              </AjoTypography>
            </AjoButton>
          </View>
        </Card>

        {/* Wallet Card */}
        <Card variant="default" padding={spacing.lg} style={styles.walletCard}>
          <View style={styles.walletRow}>
            <View style={styles.walletBalance}>
              <AjoTypography variant="chip" color={colors.textPrimary}>
                Wallet balance
              </AjoTypography>
              <View style={styles.balanceRow}>
                <AjoTypography variant="amountHero">
                  ₦
                  {showBalance
                    ? (wallet?.balance || 0).toLocaleString()
                    : "••••••"}
                </AjoTypography>
                <TouchableOpacity
                  onPress={() => setShowBalance(!showBalance)}
                  style={styles.eyeButton}
                >
                  <Feather
                    name={showBalance ? "eye" : "eye-off"}
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.totalSavings}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Total savings
              </AjoTypography>
              <AjoTypography variant="body" color={colors.primary}>
                ₦{wallet?.total_savings?.toLocaleString() || "0"}
              </AjoTypography>
            </View>
          </View>
          <TouchableOpacity
            style={styles.fundWalletCard}
            onPress={handleFundWallet}
          >
            <View style={styles.fundWalletIcon}>
              <Ionicons
                name="wallet-outline"
                size={16}
                color={colors.primary}
              />
            </View>
            <View style={styles.fundWalletText}>
              <AjoTypography variant="tab" color={colors.textPrimary}>
                Add money to your wallet
              </AjoTypography>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                Fund your wallet to start or join a circle.
              </AjoTypography>
            </View>
            <Feather name="arrow-right" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Quick Actions */}
        {/* {activeCircle && (
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActions}>
              
              <TouchableOpacity
                style={[styles.quickAction, styles.primaryQuickAction]}
                onPress={handleContribute}
              >
                <Feather
                  name="plus-circle"
                  size={20}
                  color={colors.buttonText}
                />
                <AjoTypography
                  variant="buttonSmall"
                  color={colors.buttonText}
                >
                  Contribute
                </AjoTypography>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={handleInvite}
              >
                <Feather name="share" size={20} color={colors.textPrimary} />
                <AjoTypography variant="buttonSmall" color={colors.textPrimary}>
                  Invite
                </AjoTypography>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={handleWithdraw}
              >
                <Feather name="arrow-up" size={20} color={colors.textPrimary} />
                <AjoTypography variant="buttonSmall" color={colors.textPrimary}>
                  Withdraw
                </AjoTypography>
              </TouchableOpacity>
            </View>
          </View>
        )} */}

        {/* Recent Activity */}
        {activeCircle && (
          <View style={styles.activitySection}>
            <AjoTypography variant="monoSmall" style={styles.activityTitle}>
              Recent Activity
            </AjoTypography>
            <Card
              variant="default"
              padding={spacing.md}
              style={styles.activityCard}
            >
              {renderRecentActivity()}
            </Card>
          </View>
        )}

        {/* Circles List */}
        {renderCirclesList()}
      </ScrollView>

      <PinModal ref={pinModalRef} />
    </SafeAreaView>
  );
}

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
  header: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    height: 56,
  },
  notificationIcon: { position: "relative" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 32, height: 32, resizeMode: "cover" },
  greetingContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  greeting: { lineHeight: 28 },
  // Journey card
  journeyCard: {
    marginBottom: spacing.md,
    backgroundColor: "#FEFEFC",
    borderWidth: 1,
    borderColor: "#D7FEE2",
    borderRadius: 12,
    overflow: "hidden",
  },
  journeyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.md,
  },
  journeyText: { flex: 1, rowGap: spacing.xs },
  journeyTitle: { lineHeight: 23 },
  journeyImage: {
    width: 146,
    height: 110,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 24,
    marginTop: -12,
    marginRight: -16,
  },
  journeyActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  primaryAction: { backgroundColor: colors.primary },
  secondaryAction: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#BEEECC",
  },
  // Wallet card
  walletCard: {
    marginBottom: spacing.md,
    backgroundColor: "#F5FFF7",
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFFFA",
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  walletBalance: { rowGap: spacing.xs },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  eyeButton: { padding: spacing.xs },
  totalSavings: { alignItems: "flex-end", rowGap: spacing.xs },
  fundWalletCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFFFA",
    borderWidth: 0.5,
    borderColor: "#BFFDCF",
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  fundWalletIcon: {
    width: 28,
    height: 28,
    borderRadius: 25,
    backgroundColor: "#D7FEE2",
    justifyContent: "center",
    alignItems: "center",
  },
  fundWalletText: { flex: 1, rowGap: 2 },
  // Quick actions
  quickActionsContainer: { marginBottom: spacing.md },
  quickActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryQuickAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // Activity
  activitySection: { marginBottom: spacing.md },
  activityTitle: { marginBottom: spacing.sm },
  activityCard: { borderRadius: 12 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  activityInfo: { flex: 1 },
  noActivity: { textAlign: "center", paddingVertical: spacing.md },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  // Circles
  circlesSection: { rowGap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  viewAll: { fontWeight: "600" },
  circleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  circleInfo: { flex: 1, rowGap: spacing.xs },
  circleHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  circleDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  // Empty state
  emptyStateContainer: { rowGap: spacing.lg },
  emptyCard: {
    alignItems: "center",
    rowGap: spacing.sm,
    borderWidth: 0.5,
    borderColor: "#E6FEED",
    borderRadius: 12,
  },
  emptyIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#E8EDE9",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: { textAlign: "center" },
  emptySubtitle: { textAlign: "center" },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  howAjoCard: {
    backgroundColor: "#FAFFFA",
    borderWidth: 0.5,
    borderColor: "#BFFDCF",
    borderRadius: 12,
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  howAjoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  howAjoIcon: {
    width: 28,
    height: 28,
    borderRadius: 25,
    backgroundColor: "#D7FEE2",
    justifyContent: "center",
    alignItems: "center",
  },
  howAjoText: { flex: 1, rowGap: 2 },
  howAjoAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
