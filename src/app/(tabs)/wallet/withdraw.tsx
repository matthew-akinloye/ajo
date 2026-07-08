/**
 * àjó Withdrawal Screen
 * Withdraw funds from wallet to bank account
 */

import Header from "@/components/smt/smt-header";
import { AjoCard } from "@/components/ui/AjoCard";
import { AjoTypography } from "@/components/ui/AjoTypography";
import AjoInput from "@/components/ui/AjoInput";
import AjoButton from "@/components/ui/AjoButton";
import { PinModal } from "@/components/PinModal";
import { apiService } from "@/services/api.service";
import { WalletOut } from "@/services/api.types";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Validation helpers (unchanged) ---
const validateAmount = (value: string, balance: number): string | null => {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) return "Please enter a valid amount.";
  if (num > balance) return "Amount exceeds available balance.";
  return null;
};

const validateAccountNumber = (value: string): string | null => {
  if (!value || value.length !== 10 || !/^\d{10}$/.test(value))
    return "Account number must be exactly 10 digits.";
  return null;
};

const validateBankCode = (value: string): string | null => {
  if (!value || value.length !== 3 || !/^\d{3}$/.test(value))
    return "Bank code must be exactly 3 digits.";
  return null;
};

export default function WithdrawScreen() {
  // --- State ---
  const [wallet, setWallet] = useState<WalletOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    amount: "",
    bankAccountNumber: "",
    bankCode: "",
  });

  const [errors, setErrors] = useState({
    amount: "",
    bankAccountNumber: "",
    bankCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // --- Custom message modal state ---
  const [messageModal, setMessageModal] = useState({
    visible: false,
    title: "",
    message: "",
    isSuccess: false,
    onOk: () => {},
  });

  // --- Load wallet on mount ---
  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const data = await apiService.getWallet();
      setWallet(data);
    } catch (error) {
      console.error("Failed to load wallet:", error);
      showMessageModal("Error", "Could not load wallet balance.", false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper to show the custom modal ---
  const showMessageModal = (title: string, message: string, isSuccess: boolean, onOk?: () => void) => {
    setMessageModal({
      visible: true,
      title,
      message,
      isSuccess,
      onOk: onOk || (() => setMessageModal((prev) => ({ ...prev, visible: false }))),
    });
  };

  // --- Form field updater ---
  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // --- Validate all fields ---
  const validateForm = (): boolean => {
    const amountError = validateAmount(form.amount, wallet?.balance || 0);
    const accountError = validateAccountNumber(form.bankAccountNumber);
    const bankError = validateBankCode(form.bankCode);

    setErrors({
      amount: amountError || "",
      bankAccountNumber: accountError || "",
      bankCode: bankError || "",
    });

    return !amountError && !accountError && !bankError;
  };

  // --- Withdraw action (opens PIN modal) ---
  const handleWithdraw = useCallback(() => {
    if (!validateForm()) return;
    setShowPinModal(true);
  }, [form, wallet]);

  // --- Confirm PIN and submit withdrawal ---
  const handlePinConfirm = async (pin: string) => {
    const parsedAmount = Number(form.amount);
    setIsSubmitting(true);

    try {
      await apiService.verifyPin({ pin });
      await apiService.withdraw({
        amount: parsedAmount,
        pin,
        bank_account_number: form.bankAccountNumber,
        bank_code: form.bankCode,
      });
      showMessageModal(
        "Success",
        "Your withdrawal request has been submitted.",
        true,
        () => router.back()
      );
    } catch (error: any) {
      showMessageModal("Error", error.message || "Failed to process withdrawal", false);
    } finally {
      setIsSubmitting(false);
      setShowPinModal(false);
    }
  };

  // --- Set max amount ---
  const setMaxAmount = () => {
    if (wallet) {
      setForm((prev) => ({ ...prev, amount: wallet.balance.toString() }));
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  // --- Navigate to transaction history ---
  const goToHistory = () => {
    router.push("./history");
  };

  // --- Loading state ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <AjoTypography>Loading...</AjoTypography>
        </View>
      </SafeAreaView>
    );
  }

  const balance = wallet?.balance || 0;
  const isFormValid =
    form.amount &&
    form.bankAccountNumber &&
    form.bankCode &&
    !Object.values(errors).some((e) => e !== "");

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Header
            title="Withdraw Funds"
            rightButtons={[
              {
                icon: (
                  <MaterialIcons name="history" size={24} color={colors.textPrimary} />
                ),
                onPress: goToHistory,
                accessibilityLabel: "View transaction history",
              },
              {
                icon: (
                  <MaterialIcons name="x" size={24} color={colors.textPrimary} />
                ),
                onPress: () => router.back(),
                accessibilityLabel: "Close",
              },
            ]}
          />

          {/* Balance Card */}
          <AjoCard style={styles.balanceCard}>
            <AjoTypography variant="label" color={colors.textTertiary}>
              Available Balance
            </AjoTypography>
            <AjoTypography variant="amountHero" color={colors.primary}>
              ₦{balance.toLocaleString()}
            </AjoTypography>
            <TouchableOpacity onPress={setMaxAmount} style={styles.maxButton}>
              <AjoTypography variant="label" color={colors.primary}>
                Withdraw Max
              </AjoTypography>
            </TouchableOpacity>
          </AjoCard>

          {/* Withdrawal Form */}
          <AjoCard style={styles.formCard}>
            <AjoTypography variant="cardTitle" style={styles.sectionTitle}>
              Withdrawal Details
            </AjoTypography>

            {/* Amount */}
            <AjoTypography variant="label" color={colors.textTertiary} style={styles.label}>
              Amount (₦)
            </AjoTypography>
            <AjoInput
              placeholder="Enter amount"
              value={form.amount}
              onChangeText={(text) => updateField("amount", text)}
              keyboardType="numeric"
              containerStyle={styles.input}
              leftIcon={
                <MaterialIcons name="naira" size={20} color={colors.textTertiary} />
              }
              errorMessage={errors.amount}
            />

            {/* Account Number */}
            <AjoTypography variant="label" color={colors.textTertiary} style={styles.label}>
              Bank Account Number
            </AjoTypography>
            <AjoInput
              placeholder="10-digit account number"
              value={form.bankAccountNumber}
              onChangeText={(text) => updateField("bankAccountNumber", text)}
              keyboardType="numeric"
              maxLength={10}
              containerStyle={styles.input}
              leftIcon={
                <MaterialIcons name="account-balance" size={20} color={colors.textTertiary} />
              }
              errorMessage={errors.bankAccountNumber}
            />

            {/* Bank Code */}
            <AjoTypography variant="label" color={colors.textTertiary} style={styles.label}>
              Bank Code
            </AjoTypography>
            <AjoInput
              placeholder="3-digit bank code (e.g., 058)"
              value={form.bankCode}
              onChangeText={(text) => updateField("bankCode", text)}
              keyboardType="numeric"
              maxLength={3}
              containerStyle={styles.input}
              leftIcon={
                <MaterialIcons name="credit-card" size={20} color={colors.textTertiary} />
              }
              errorMessage={errors.bankCode}
            />

            <AjoButton
              title="Withdraw"
              onPress={handleWithdraw}
              loading={isSubmitting}
              disabled={!isFormValid || isSubmitting}
              style={styles.withdrawButton}
            />
          </AjoCard>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <MaterialIcons name="info" size={16} color={colors.textTertiary} />
            <AjoTypography
              variant="bodySmall"
              color={colors.textSecondary}
              style={styles.infoText}
            >
              Withdrawals are processed within 1-3 business days. You'll receive a
              notification when your withdrawal is complete.
            </AjoTypography>
          </View>

          <TouchableOpacity style={styles.historyLink} onPress={goToHistory}>
            <MaterialIcons name="list-alt" size={20} color={colors.primary} />
            <AjoTypography variant="label" color={colors.primary}>
              View all transactions
            </AjoTypography>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* PIN Modal */}
      <PinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinConfirm}
        title="Confirm Withdrawal"
        message={`Enter your PIN to withdraw ₦${Number(form.amount).toLocaleString()}`}
      />

      {/* Custom Message Modal */}
      <Modal
        transparent
        visible={messageModal.visible}
        animationType="fade"
        onRequestClose={() => setMessageModal((prev) => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <MaterialIcons
                name={messageModal.isSuccess ? "check-circle" : "error"}
                size={48}
                color={messageModal.isSuccess ? colors.success : colors.error}
              />
            </View>
            <AjoTypography variant="body" style={styles.modalTitle}>
              {messageModal.title}
            </AjoTypography>
            <AjoTypography variant="mono" color={colors.textSecondary} style={styles.modalMessage}>
              {messageModal.message}
            </AjoTypography>
            <AjoButton
              title="OK"
              variant="primary"
              style={styles.modalButton}
              onPress={() => {
                const onOk = messageModal.onOk;
                setMessageModal((prev) => ({ ...prev, visible: false }));
                if (onOk) onOk();
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    marginBottom: spacing.md,
    alignItems: "center",
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  maxButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + "20",
    borderRadius: 8,
  },
  formCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.md,
  },
  withdrawButton: {
    width: "100%",
    marginTop: spacing.sm,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIcon: {
    marginBottom: spacing.md,
  },
  modalTitle: {
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  modalMessage: {
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  modalButton: {
    width: "100%",
    minHeight: 48,
  },
});