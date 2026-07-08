/**
 * àjó Transaction History Screen
 * View all wallet transactions
 */

import Header from "@/components/smt/smt-header";
import { AjoCard } from "@/components/ui/AjoCard";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { apiService } from "@/services/api.service";
import { TransactionOut } from "@/services/api.types";
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

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<TransactionOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await apiService.listTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactions();
    setIsRefreshing(false);
  };

  const getTransactionIcon = (type: TransactionOut["type"]): string => {
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
  };

  const getTransactionIconColor = (type: TransactionOut["type"]): string => {
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
  };

  const getTransactionIconBg = (type: TransactionOut["type"]): string => {
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
  };

  const getTransactionAmountColor = (type: TransactionOut["type"]): string => {
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
  };

  const getTransactionPrefix = (type: TransactionOut["type"]): string => {
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
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const groupTransactionsByDate = () => {
    const grouped: Record<string, TransactionOut[]> = {};
    transactions.forEach((tx) => {
      const date = formatDate(tx.created_at);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(tx);
    });
    return grouped;
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
          title="Transaction History"
          rightButtons={[
            {
              icon: (
                <MaterialIcons
                  name="filter-list"
                  size={24}
                  color={colors.textPrimary}
                />
              ),
              onPress: () =>
                Alert.alert("Filters", "Filter options coming soon"),
            },
          ]}
        />

        {isLoading ? (
          <View style={styles.loadingState}>
            <AjoTypography variant="body" color={colors.textTertiary}>
              Loading transactions...
            </AjoTypography>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="receipt-long"
              size={48}
              color={colors.textTertiary}
            />
            <AjoTypography
              variant="body"
              color={colors.textTertiary}
              style={styles.emptyText}
            >
              No transactions yet
            </AjoTypography>
            <AjoTypography
              variant="bodySmall"
              color={colors.textSecondary}
              style={styles.emptySubtext}
            >
              Your transaction history will appear here.
            </AjoTypography>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {Object.entries(groupTransactionsByDate()).map(([date, txs]) => (
              <View key={date} style={styles.dateGroup}>
                <AjoTypography
                  variant="label"
                  color={colors.textTertiary}
                  style={styles.dateHeader}
                >
                  {date}
                </AjoTypography>
                <AjoCard style={styles.dateCard}>
                  {txs.map((transaction) => (
                    <View
                      key={transaction.id}
                      style={[
                        styles.transactionItem,
                        transaction !== txs[txs.length - 1] &&
                          styles.transactionItemBorder,
                      ]}
                    >
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
                          <AjoTypography variant="cardTitle">
                            {transaction.reference || transaction.type}
                          </AjoTypography>
                          <AjoTypography
                            variant="label"
                            color={colors.textTertiary}
                          >
                            {formatDate(transaction.created_at)}
                          </AjoTypography>
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <AjoTypography
                          variant="amountHero"
                          color={getTransactionAmountColor(transaction.type)}
                        >
                          {getTransactionPrefix(transaction.type)}₦
                          {transaction.amount.toLocaleString()}
                        </AjoTypography>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                transaction.status === "success"
                                  ? colors.success + "20"
                                  : transaction.status === "pending"
                                    ? colors.warning + "20"
                                    : colors.error + "20",
                            },
                          ]}
                        >
                          <AjoTypography
                            variant="label"
                            color={
                              transaction.status === "success"
                                ? colors.success
                                : transaction.status === "pending"
                                  ? colors.warning
                                  : colors.error
                            }
                            style={{ fontSize: 10 }}
                          >
                            {transaction.status.toUpperCase()}
                          </AjoTypography>
                        </View>
                      </View>
                    </View>
                  ))}
                </AjoCard>
              </View>
            ))}
          </View>
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
  },
  transactionsList: {
    gap: spacing.lg,
  },
  dateGroup: {
    gap: spacing.sm,
  },
  dateHeader: {
    paddingHorizontal: spacing.xs,
  },
  dateCard: {
    marginBottom: 0,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  transactionItemBorder: {
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
