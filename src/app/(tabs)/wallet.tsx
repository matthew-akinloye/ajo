/**
 * àjó Wallet Screen
 * Dashboard with balance, quick actions, and recent transactions
 */

import { QuickActionButton } from "@/components/QuickActionButton";
import Header from "@/components/smt/smt-header";
import ReusableBottomSheet, { ReusableBottomSheetRef } from "@/components/smt/smt-bottom-sheet";
import { Card } from "@/components/ui/Card";
import { AjoTypography } from "@/components/ui/AjoTypography";
import AjoButton from "@/components/ui/AjoButton";
import { PinModal, PinModalRef } from "@/components/ui/PinModal";
import { apiService } from "@/services/api.service";
import { TransactionOut, WalletOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { radius } from "@/theme/radius";
import { Feather, Ionicons } from "@expo/vector-icons";
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
} from "react-native";

export default function WalletScreen() {
  // --- Data state ---
  const [wallet, setWallet] = useState<WalletOut | null>(null);
  const [transactions, setTransactions] = useState<TransactionOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // --- Bottom sheet refs ---
  const messageSheetRef = useRef<ReusableBottomSheetRef>(null);
  const promptSheetRef = useRef<ReusableBottomSheetRef>(null);

  // --- PIN modal ref ---
  const pinModalRef = useRef<PinModalRef>(null);

  // --- Message sheet data ---
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

  // --- Prompt sheet data ---
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

  // --- Load data ---
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [walletData, transactionsData] = await Promise.all([
        apiService.getWallet(),
        apiService.listTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
      showMessageSheet("Error", "Could not load wallet data.", false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helpers to show bottom sheets ---
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWalletData();
    setIsRefreshing(false);
  };

  // --- Actions ---
  const handleFund = () => {
    showPromptSheet(
      "Fund Wallet",
      "Enter amount (₦)",
      false,
      async (amount) => {
        const parsed = Number(amount);
        if (!amount || isNaN(parsed) || parsed <= 0) {
          showMessageSheet("Invalid Amount", "Please enter a valid amount.", false);
          return;
        }
        try {
          const response = await apiService.fundWallet({ amount: parsed });
          showMessageSheet(
            "Funding Initiated",
            `Checkout link: ${response.checkout_url}`,
            true
          );
        } catch (error) {
          showMessageSheet(
            "Funding Failed",
            error instanceof Error ? error.message : "Please try again.",
            false
          );
        }
      }
    );
  };

  const handleWithdraw = () => {
    if (!wallet || wallet.balance === 0) {
      showMessageSheet("Insufficient Balance", "Your wallet balance is zero.", false);
      return;
    }
    showPromptSheet(
      "Withdraw Funds",
      "Enter amount (₦)",
      false,
      async (amount) => {
        const parsed = Number(amount);
        if (!amount || isNaN(parsed) || parsed <= 0) {
          showMessageSheet("Invalid Amount", "Please enter a valid amount.", false);
          return;
        }
        if (wallet && parsed > wallet.balance) {
          showMessageSheet("Insufficient Balance", "Amount exceeds available balance.", false);
          return;
        }
        pinModalRef.current?.show({
          title: "Confirm Withdrawal",
          subtitle: `Enter your PIN to withdraw ₦${parsed.toLocaleString()}`,
          onConfirm: async (pin) => {
            try {
              await apiService.verifyPin({ pin });
              await apiService.withdraw({
                amount: parsed,
                pin,
                bank_account_number: "0000000000", 
                bank_code: "058",
              });
              showMessageSheet(
                "Success",
                "Your withdrawal request has been submitted.",
                true,
                () => loadWalletData()
              );
            } catch (error) {
              showMessageSheet(
                "Withdrawal Failed",
                error instanceof Error ? error.message : "Please try again.",
                false
              );
            }
          },
        });
      }
    );
  };

  const handleTransfer = () => {
    showMessageSheet("Coming Soon", "Transfer support will be enabled soon.", false);
  };

  const goToHistory = () => {
    router.push("/(tabs)/wallet/history");
  };

  // --- Render loading ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <AjoTypography variant="body" color={colors.textTertiary}>
            Loading wallet...
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
          title="Wallet"
          rightButtons={[
            {
              icon: <Feather name="clock" size={20} color={colors.textPrimary} />,
              onPress: goToHistory,
            },
            {
              icon: <Feather name="settings" size={20} color={colors.textPrimary} />,
              onPress: () => console.log("Settings"),
            },
          ]}
        />

        {/* Wallet Card - exactly as HomeScreen */}
        <Card variant="default" padding={spacing.lg} style={styles.walletCard}>
          <View style={styles.walletRow}>
            <View style={styles.walletBalance}>
              <AjoTypography variant="chip" color={colors.textPrimary}>
                Wallet balance
              </AjoTypography>
              <View style={styles.balanceRow}>
                <AjoTypography variant="amountHero">
                  {showBalance
                    ? `₦${(wallet?.balance || 0).toLocaleString()}`
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
          <TouchableOpacity style={styles.fundWalletCard} onPress={handleFund}>
            <View style={styles.fundWalletIcon}>
              <Ionicons name="wallet-outline" size={16} color={colors.primary} />
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
        <View style={styles.actionsContainer}>
          <View style={styles.actions}>
            <QuickActionButton icon="plus-circle" iconFamily="feather" label="Fund" onPress={handleFund} />
            <QuickActionButton icon="arrow-up" iconFamily="feather" label="Withdraw" onPress={handleWithdraw} />
            <QuickActionButton icon="repeat" iconFamily="feather" label="Transfer" onPress={handleTransfer} />
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <AjoTypography variant="monoSmall">Recent Transactions</AjoTypography>
            <TouchableOpacity onPress={goToHistory}>
              <AjoTypography variant="monoSmall" color={colors.primary} style={styles.viewAll}>
                View All
              </AjoTypography>
            </TouchableOpacity>
          </View>

          <Card variant="default" padding={spacing.md} style={styles.transactionCard}>
            {transactions.length === 0 ? (
              <AjoTypography variant="body" color={colors.textTertiary} style={styles.emptyState}>
                No transactions yet.
              </AjoTypography>
            ) : (
              transactions.slice(0, 5).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: getTransactionIconBg(transaction.type) },
                      ]}
                    >
                      <Feather
                        name={getTransactionIcon(transaction.type)}
                        size={16}
                        color={getTransactionIconColor(transaction.type)}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <AjoTypography variant="bodySmall" color={colors.textPrimary}>
                        {transaction.reference ?? transaction.type}
                      </AjoTypography>
                      <AjoTypography variant="chip" color={colors.textTertiary}>
                        {formatDate(transaction.created_at)}
                      </AjoTypography>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <AjoTypography
                      variant="bodySmall"
                      color={getTransactionAmountColor(transaction.type)}
                      style={styles.transactionAmount}
                    >
                      {getTransactionPrefix(transaction.type)}₦{transaction.amount.toLocaleString()}
                    </AjoTypography>
                    <StatusBadge status={transaction.status} />
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
            <AjoButton style={styles.messageButton} onPress={() => { close(); if (messageData.onOk) messageData.onOk(); }}>
              <AjoTypography variant="button" color={colors.buttonText}>
                OK
              </AjoTypography>
            </AjoButton>
          </View>
        )}
      </ReusableBottomSheet>

      {/* Prompt Sheet */}
      <ReusableBottomSheet
        ref={promptSheetRef}
        snapPoints={["50%"]}
        initialIndex={-1}
        enablePanDownToClose
        onClose={() => { if (promptData.onCancel) promptData.onCancel(); }}
      >
        {({ close }) => (
          <View style={styles.promptSheetContent}>
            <AjoTypography variant="body" style={styles.promptTitle}>
              {promptData.title}
            </AjoTypography>
            <TextInput
              style={styles.promptInput}
              placeholder={promptData.placeholder}
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
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
              <AjoButton
                style={[styles.promptButton, styles.promptCancelButton]}
                onPress={() => { if (promptData.onCancel) promptData.onCancel(); close(); }}
              >
                <AjoTypography variant="button" color={colors.textPrimary}>
                  Cancel
                </AjoTypography>
              </AjoButton>
              <AjoButton
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

// --- Helper functions ---
function getTransactionIcon(type: TransactionOut["type"]): keyof typeof Feather.glyphMap {
  switch (type) {
    case "funding":
      return "arrow-down";
    case "contribution":
      return "arrow-up";
    case "payout":
      return "credit-card";
    case "withdrawal":
      return "arrow-right";
    default:
      return "repeat";
  }
}

function getTransactionIconColor(type: TransactionOut["type"]): string {
  switch (type) {
    case "funding":
    case "payout":
      return colors.success;
    case "contribution":
    case "withdrawal":
      return colors.primary;
    default:
      return colors.textTertiary;
  }
}

function getTransactionIconBg(type: TransactionOut["type"]): string {
  switch (type) {
    case "funding":
    case "payout":
      return colors.success + "20";
    case "contribution":
    case "withdrawal":
      return colors.primary + "20";
    default:
      return colors.surface;
  }
}

function getTransactionAmountColor(type: TransactionOut["type"]): string {
  switch (type) {
    case "funding":
    case "payout":
      return colors.success;
    case "contribution":
    case "withdrawal":
      return colors.textPrimary;
    default:
      return colors.textPrimary;
  }
}

function getTransactionPrefix(type: TransactionOut["type"]): string {
  switch (type) {
    case "funding":
    case "payout":
      return "+";
    case "contribution":
    case "withdrawal":
      return "-";
    default:
      return "";
  }
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: TransactionOut["status"] }) {
  const config = {
    success: { color: colors.success, label: "Success" },
    pending: { color: colors.warning, label: "Pending" },
    failed: { color: colors.error, label: "Failed" },
  }[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color + "20" }]}>
      <AjoTypography variant="chip" color={config.color}>
        {config.label}
      </AjoTypography>
    </View>
  );
}

// --- Styles (matching HomeScreen) ---
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
  // Wallet card - exactly as HomeScreen
  walletCard: {
    marginBottom: spacing.md,
    backgroundColor: "#F5FFF7",
    borderRadius: radius.lg,
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
    borderRadius: radius.md,
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
  actionsContainer: { marginBottom: spacing.md },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  // Transactions
  transactionsSection: { marginTop: spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  viewAll: { fontWeight: "600" },
  transactionCard: {
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
  },
  emptyState: {
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  transactionInfo: { flex: 1 },
  transactionRight: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  transactionAmount: { fontWeight: "600" },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },

  // Bottom sheet content styles
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
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  promptSheetContent: {
    padding: spacing.xs,
    paddingTop: spacing.sm,
  },
  promptTitle: {
    textAlign: "center",
    marginBottom: spacing.md,
    color: colors.textInverted,
  },
  promptInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    fontSize: 24,
    color: colors.textInverted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  promptButtons: {
    flexDirection: "row",
    gap: spacing.xs,
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
});