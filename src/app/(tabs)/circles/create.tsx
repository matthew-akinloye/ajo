// app/(tabs)/circles/create.tsx
import ReusableBottomSheet, {
  ReusableBottomSheetRef,
} from "@/components/smt/smt-bottom-sheet";
import AjoButton from "@/components/ui/AjoButton";
import { AjoCard } from "@/components/ui/AjoCard";
import AjoInput from "@/components/ui/AjoInput";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { apiService } from "@/services/api.service";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type Step = 1 | 2 | 3;

interface CreateCircleModalProps {
  onClose: () => void;
}

export default function CreateCircleModal({ onClose }: CreateCircleModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Form state
  const [name, setName] = useState("");
  const [circleType, setCircleType] = useState<"private" | "public">("private");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">(
    "weekly",
  );
  const [memberCapacity, setMemberCapacity] = useState("5");
  const [payoutOrder, setPayoutOrder] = useState<"random" | "sequential">(
    "random",
  );
  const [openJoin, setOpenJoin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCircle, setCreatedCircle] = useState<any>(null);

  // Bottom sheet refs
  const messageSheetRef = useRef<ReusableBottomSheetRef>(null);

  // Message state
  const [messageData, setMessageData] = useState<{
    title: string;
    message: string;
    isSuccess: boolean;
    onOk?: () => void;
  }>({ title: "", message: "", isSuccess: false });

  const showMessage = (
    title: string,
    message: string,
    isSuccess: boolean,
    onOk?: () => void,
  ) => {
    setMessageData({ title, message, isSuccess, onOk });
    messageSheetRef.current?.snapToIndex(0);
  };

  // Validation
  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      showMessage("Missing Field", "Please enter a circle name.", false);
      return false;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      showMessage(
        "Invalid Amount",
        "Contribution amount must be greater than 0.",
        false,
      );
      return false;
    }
    const cap = parseInt(memberCapacity);
    if (isNaN(cap) || cap < 2 || cap > 50) {
      showMessage(
        "Invalid Capacity",
        "Member capacity must be between 2 and 50.",
        false,
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const circleData = {
        name: name.trim(),
        contribution_amount: parseFloat(amount),
        frequency,
        member_capacity: parseInt(memberCapacity),
        payout_order: payoutOrder,
        open_join: openJoin,
      };
      const created = await apiService.createCircle(circleData);
      setCreatedCircle(created);
      setStep(3);
    } catch (error) {
      showMessage(
        "Error",
        error instanceof Error ? error.message : "Failed to create circle.",
        false,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const goToCircle = () => {
    if (createdCircle) {
      router.push(`/(tabs)/circles/${createdCircle.id}`);
    } else {
      onClose();
    }
  };

  // Step Indicator
  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepDotContainer}>
          <View
            style={[
              styles.stepDot,
              s === step && styles.stepDotActive,
              s < step && styles.stepDotCompleted,
            ]}
          >
            {s < step ? (
              <Feather name="check" size={12} color={colors.textInverted} />
            ) : (
              <AjoTypography
                variant="chip"
                color={s === step ? colors.textInverted : colors.textTertiary}
                style={styles.stepDotText}
              >
                {s}
              </AjoTypography>
            )}
          </View>
          {s < 3 && (
            <View
              style={[styles.stepLine, s < step && styles.stepLineCompleted]}
            />
          )}
        </View>
      ))}
    </View>
  );

  // Step content (same as before)
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <AjoTypography variant="sectionHeader" style={styles.sectionTitle}>
          Circle Details
        </AjoTypography>
        <AjoTypography variant="bodySmall" color={colors.textSecondary}>
          Set up your savings circle. You can change settings later.
        </AjoTypography>
      </View>

      <View style={styles.formGroup}>
        <AjoCard padding={spacing.md} style={styles.formCard}>
          <AjoInput
            label="Circle name"
            placeholder="e.g., Family Savings"
            value={name}
            onChangeText={setName}
            leftIcon={
              <Feather name="users" size={20} color={colors.textTertiary} />
            }
            containerStyle={styles.input}
          />
        </AjoCard>

        <AjoCard padding={spacing.md} style={styles.formCard}>
          <AjoTypography variant="label" style={styles.fieldLabel}>
            Circle type
          </AjoTypography>
          <View style={styles.radioRow}>
            {["private", "public"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioOption,
                  circleType === type && styles.radioOptionActive,
                ]}
                onPress={() => setCircleType(type as any)}
              >
                <View style={styles.radioCircle}>
                  {circleType === type && (
                    <View style={styles.radioCircleSelected} />
                  )}
                </View>
                <View style={styles.radioText}>
                  <AjoTypography variant="bodySmall" color={colors.textPrimary}>
                    {type === "private" ? "Private" : "Public"}
                  </AjoTypography>
                  <AjoTypography variant="chip" color={colors.textTertiary}>
                    {type === "private"
                      ? "People you invite"
                      : "Open to community"}
                  </AjoTypography>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </AjoCard>

        <AjoCard padding={spacing.md} style={styles.formCard}>
          <AjoInput
            label="Contribution amount"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            leftIcon={
              <Feather
                name="dollar-sign"
                size={20}
                color={colors.textTertiary}
              />
            }
            containerStyle={styles.input}
            rightComponent={
              <View style={styles.currencyLabel}>
                <AjoTypography variant="chip" color={colors.textTertiary}>
                  NGN
                </AjoTypography>
              </View>
            }
          />
        </AjoCard>

        <AjoCard padding={spacing.md} style={styles.formCard}>
          <AjoTypography variant="label" style={styles.fieldLabel}>
            Frequency
          </AjoTypography>
          <View style={styles.frequencyRow}>
            {(["weekly", "biweekly", "monthly"] as const).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyOption,
                  frequency === freq && styles.frequencyOptionActive,
                ]}
                onPress={() => setFrequency(freq)}
              >
                <AjoTypography
                  variant="bodySmall"
                  color={
                    frequency === freq
                      ? colors.textInverted
                      : colors.textPrimary
                  }
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </AjoTypography>
              </TouchableOpacity>
            ))}
          </View>
        </AjoCard>

        <AjoCard padding={spacing.md} style={styles.formCard}>
          <AjoTypography variant="label" style={styles.fieldLabel}>
            Members (including you)
          </AjoTypography>
          <View style={styles.memberRow}>
            {[5, 10, 15].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.memberOption,
                  parseInt(memberCapacity) === num && styles.memberOptionActive,
                ]}
                onPress={() => setMemberCapacity(num.toString())}
              >
                <AjoTypography
                  variant="bodySmall"
                  color={
                    parseInt(memberCapacity) === num
                      ? colors.textInverted
                      : colors.textPrimary
                  }
                >
                  {num}
                </AjoTypography>
              </TouchableOpacity>
            ))}
            <AjoInput
              placeholder="Custom"
              value={memberCapacity}
              onChangeText={setMemberCapacity}
              keyboardType="numeric"
              containerStyle={styles.customMemberInput}
              inputStyle={styles.customMemberText}
            />
          </View>
          <AjoTypography
            variant="chip"
            color={colors.textTertiary}
            style={styles.helperText}
          >
            Including you
          </AjoTypography>
        </AjoCard>

        <AjoCard padding={spacing.md} style={styles.formCard}>
          <AjoTypography variant="label" style={styles.fieldLabel}>
            Payout order
          </AjoTypography>
          <View style={styles.toggleRow}>
            {(["random", "sequential"] as const).map((order) => (
              <TouchableOpacity
                key={order}
                style={[
                  styles.toggleOption,
                  payoutOrder === order && styles.toggleOptionActive,
                ]}
                onPress={() => setPayoutOrder(order)}
              >
                <AjoTypography
                  variant="bodySmall"
                  color={
                    payoutOrder === order
                      ? colors.textInverted
                      : colors.textPrimary
                  }
                >
                  {order.charAt(0).toUpperCase() + order.slice(1)}
                </AjoTypography>
              </TouchableOpacity>
            ))}
          </View>
        </AjoCard>

        <AjoCard padding={spacing.md} style={styles.formCard}>
          <AjoTypography variant="label" style={styles.fieldLabel}>
            Open join
          </AjoTypography>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                openJoin === true && styles.toggleOptionActive,
              ]}
              onPress={() => setOpenJoin(true)}
            >
              <AjoTypography
                variant="bodySmall"
                color={
                  openJoin === true ? colors.textInverted : colors.textPrimary
                }
              >
                Yes
              </AjoTypography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                openJoin === false && styles.toggleOptionActive,
              ]}
              onPress={() => setOpenJoin(false)}
            >
              <AjoTypography
                variant="bodySmall"
                color={
                  openJoin === false ? colors.textInverted : colors.textPrimary
                }
              >
                No (approval required)
              </AjoTypography>
            </TouchableOpacity>
          </View>
        </AjoCard>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <AjoTypography variant="sectionHeader" style={styles.sectionTitle}>
          Review
        </AjoTypography>
        <AjoTypography variant="bodySmall" color={colors.textSecondary}>
          Check everything before creating your circle.
        </AjoTypography>
      </View>

      <AjoCard padding={spacing.md} style={styles.reviewCard}>
        {[
          { icon: "users", label: "Circle name", value: name },
          {
            icon: "dollar-sign",
            label: "Contribution",
            value: `₦${parseFloat(amount).toLocaleString()} / ${frequency}`,
          },
          {
            icon: "users",
            label: "Members",
            value: `${memberCapacity} (including you)`,
          },
          {
            icon: "lock",
            label: "Circle type",
            value: circleType === "private" ? "Private" : "Public",
          },
          {
            icon: "shuffle",
            label: "Payout order",
            value: payoutOrder.charAt(0).toUpperCase() + payoutOrder.slice(1),
          },
          {
            icon: "user-plus",
            label: "Open join",
            value: openJoin ? "Yes" : "No (approval required)",
          },
        ].map((item, index) => (
          <View
            key={index}
            style={[styles.reviewItem, index === 5 && styles.reviewItemLast]}
          >
            <View style={styles.reviewIcon}>
              <Feather
                name={item.icon as any}
                size={16}
                color={colors.primary}
              />
            </View>
            <View style={styles.reviewContent}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                {item.label}
              </AjoTypography>
              <AjoTypography variant="body" weight="500">
                {item.value}
              </AjoTypography>
            </View>
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={styles.editButton}
            >
              <Feather name="edit-2" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </AjoCard>

      <View style={styles.infoBox}>
        <Feather name="info" size={16} color={colors.primary} />
        <AjoTypography
          variant="bodySmall"
          color={colors.textSecondary}
          style={styles.infoText}
        >
          Your circle will be created once you confirm. You can invite members
          afterwards.
        </AjoTypography>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successHeader}>
        <Feather name="check-circle" size={64} color={colors.success} />
        <AjoTypography variant="h2" style={styles.successTitle}>
          Circle Created!
        </AjoTypography>
        <AjoTypography
          variant="body"
          color={colors.textSecondary}
          style={styles.successSubtitle}
        >
          Your circle "{name}" is now live. Invite members to start saving.
        </AjoTypography>
      </View>

      <AjoCard padding={spacing.md} style={styles.summaryCard}>
        {[
          { icon: "users", label: "Circle name", value: name },
          {
            icon: "dollar-sign",
            label: "Contribution",
            value: `₦${parseFloat(amount).toLocaleString()} / ${frequency}`,
          },
          {
            icon: "users",
            label: "Members",
            value: `${memberCapacity} (including you)`,
          },
          {
            icon: "lock",
            label: "Circle type",
            value: circleType === "private" ? "Private" : "Public",
          },
        ].map((item, index) => (
          <View
            key={index}
            style={[styles.summaryItem, index === 3 && styles.summaryItemLast]}
          >
            <View style={styles.summaryIcon}>
              <Feather
                name={item.icon as any}
                size={16}
                color={colors.primary}
              />
            </View>
            <View style={styles.summaryContent}>
              <AjoTypography variant="chip" color={colors.textTertiary}>
                {item.label}
              </AjoTypography>
              <AjoTypography variant="body" weight="500">
                {item.value}
              </AjoTypography>
            </View>
          </View>
        ))}
      </AjoCard>

      <View style={styles.activationCard}>
        <Feather name="shield" size={16} color={colors.primary} />
        <AjoTypography
          variant="bodySmall"
          color={colors.textPrimary}
          style={styles.activationText}
        >
          Your circle will activate when all members join and complete their
          first contribution.
        </AjoTypography>
      </View>

      <View style={styles.successActions}>
        <AjoButton
          title="Invite members"
          onPress={() => {
            showMessage(
              "Invite",
              "Invite members to your circle (coming soon)",
              false,
            );
          }}
        />
        <AjoButton
          title="Go to circle"
          variant="outline"
          onPress={goToCircle}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AjoTypography variant="h3" style={styles.headerTitle}>
          Create Circle
        </AjoTypography>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Footer */}
      {step < 3 && (
        <View style={styles.footer}>
          {step === 2 && (
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={styles.backLink}
            >
              <AjoTypography variant="bodySmall" color={colors.textSecondary}>
                ← Back
              </AjoTypography>
            </TouchableOpacity>
          )}
          <AjoButton
            title={step === 1 ? "Continue" : "Create Circle"}
            onPress={handleNext}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.footerButton}
          />
        </View>
      )}

      {/* Message Sheet */}
      <ReusableBottomSheet
        ref={messageSheetRef}
        snapPoints={["40%"]}
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
            <AjoTypography
              variant="body"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stepDotContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepContainer: {
    paddingTop: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  formGroup: {
    gap: spacing.md,
  },
  formCard: {
    borderRadius: radius.lg,
  },
  input: {
    marginBottom: 0,
  },
  fieldLabel: {
    marginBottom: spacing.sm,
  },
  radioRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  radioOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  radioOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    flex: 1,
  },
  currencyLabel: {
    paddingHorizontal: spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  frequencyOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  memberRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  memberOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  memberOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  customMemberInput: {
    flex: 1,
    minWidth: 60,
  },
  customMemberText: {
    textAlign: "center",
  },
  helperText: {
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  toggleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reviewCard: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  reviewItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewItemLast: {
    borderBottomWidth: 0,
  },
  reviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  reviewContent: {
    flex: 1,
  },
  editButton: {
    padding: spacing.xs,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
  },
  successHeader: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  successTitle: {
    textAlign: "center",
  },
  successSubtitle: {
    textAlign: "center",
  },
  summaryCard: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItemLast: {
    borderBottomWidth: 0,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  summaryContent: {
    flex: 1,
  },
  activationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  activationText: {
    flex: 1,
  },
  successActions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  backLink: {
    paddingVertical: spacing.sm,
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
});
