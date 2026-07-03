/**
 * àjó Wallet Screen
 * Based on index.tsx blueprint - typography-first, minimal design
 */

import { QuickActionButton } from "@/components/QuickActionButton";
import Header from "@/components/smt/smt-header";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { apiService } from "@/services/api.service";
import { TransactionOut, WalletOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function WalletScreen() {
  const [wallet, setWallet] = useState<WalletOut | null>(null);
  const [transactions, setTransactions] = useState<TransactionOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWalletData();
    setIsRefreshing(false);
  };

  const handleFund = async () => {
    Alert.prompt(
      "Fund wallet",
      "Enter the amount you want to fund",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async (amount) => {
            const parsed = Number(amount);
            if (!amount || Number.isNaN(parsed) || parsed <= 0) {
              Alert.alert("Invalid amount", "Please enter a valid amount.");
              return;
            }
            try {
              const response = await apiService.fundWallet({ amount: parsed });
              Alert.alert("Funding initiated", `Checkout link: ${response.checkout_url}`);
            } catch (error) {
              Alert.alert("Funding failed", error instanceof Error ? error.message : "Please try again.");
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleWithdraw = async () => {
    Alert.prompt(
      "Withdraw funds",
      "Enter amount",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async (amount) => {
            const parsed = Number(amount);
            if (!amount || Number.isNaN(parsed) || parsed <= 0) {
              Alert.alert("Invalid amount", "Please enter a valid amount.");
              return;
            }
            Alert.prompt(
              "Withdraw funds",
              "Enter your PIN",
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
                      await apiService.withdraw({
                        amount: parsed,
                        pin,
                        bank_account_number: "0000000000",
                        bank_code: "058",
                      });
                      Alert.alert("Success", "Your withdrawal request has been submitted.");
                      await loadWalletData();
                    } catch (error) {
                      Alert.alert("Withdrawal failed", error instanceof Error ? error.message : "Please try again.");
                    }
                  },
                },
              ],
              "secure-text",
            );
          },
        },
      ],
      "plain-text",
    );
  };

  const handleTransfer = () => {
    Alert.alert("Coming soon", "Transfer support will be enabled soon.");
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
          title="Wallet"
          rightButtons={[
            {
              icon: (
                <MaterialIcons
                  name="settings"
                  size={24}
                  color={colors.textPrimary}
                />
              ),
              onPress: () => console.log("Settings"),
            },
          ]}
        />

        {isLoading ? (
          <View style={styles.loadingState}>
            <Text variant="body" color={colors.textTertiary}>
              Loading wallet...
            </Text>
          </View>
        ) : (
          wallet && (
            <>
              {/* Balance Card */}
              <Card
                variant="gradient"
                padding={spacing.xl}
                style={styles.balanceCard}
              >
                <Text
                  variant="label"
                  color={colors.textInverted}
                  style={{ opacity: 0.8 }}
                >
                  AVAILABLE BALANCE
                </Text>
                <Text
                  variant="h1"
                  color={colors.textInverted}
                  style={styles.balanceAmount}
                >
                  ₦{wallet.balance.toLocaleString()}
                </Text>
             
              </Card>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <View style={styles.actions}>
                  <QuickActionButton
                    icon="add-circle-outline"
                    label="Fund"
                    onPress={handleFund}
                  />
                  <QuickActionButton
                    icon="arrow-upward"
                    label="Withdraw"
                    onPress={handleWithdraw}
                  />
                  <QuickActionButton
                    icon="swap-horiz"
                    label="Transfer"
                    onPress={handleTransfer}
                  />
              
                </View>
              </View>

              {/* Transactions Section */}
              <View style={styles.transactionsSection}>
                <Text variant="subtitle" style={styles.sectionTitle}>
                  Recent Transactions
                </Text>

                <Card variant="elevated" padding={spacing.lg}>
                  {transactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={styles.transactionLeft}>
                        <View
                          style={[
                            styles.transactionIcon,
                            {
                              backgroundColor: getTransactionIconBg(
                                transaction.type,
                              ),
                            },
                          ]}
                        >
                          <MaterialIcons
                            name={getTransactionIcon(transaction.type) as any}
                            size={20}
                            color={getTransactionIconColor(transaction.type)}
                          />
                        </View>
                        <View style={styles.transactionInfo}>
                          <Text variant="body" weight="600">
                            {transaction.reference ?? transaction.type}
                          </Text>
                          <Text variant="label" color={colors.textTertiary}>
                            {formatDate(transaction.created_at)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text
                          variant="body"
                          weight="700"
                          color={getTransactionAmountColor(transaction.type)}
                        >
                          {getTransactionPrefix(transaction.type)}₦
                          {transaction.amount.toLocaleString()}
                        </Text>
                        <StatusBadge status={transaction.status} />
                      </View>
                    </View>
                  ))}
                </Card>
              </View>
            </>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getTransactionIcon(type: TransactionOut["type"]): string {
  switch (type) {
    case "funding":
      return "arrow-downward";
    case "contribution":
      return "arrow-upward";
    case "payout":
      return "account-balance-wallet";
    case "withdrawal":
      return "arrow-forward";
    default:
      return "swap-horiz";
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
    <View
      style={[styles.statusBadge, { backgroundColor: config.color + "20" }]}
    >
      <Text variant="label" color={config.color} weight="600">
        {config.label}
      </Text>
    </View>
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
  balanceCard: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  balanceAmount: {
    marginVertical: spacing.sm,
  },
  actionsContainer: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  transactionsSection: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
});
