// app/(tabs)/circles/create.tsx
import AjoButton from "@/components/ui/AjoButton";
import { AjoCard } from "@/components/ui/AjoCard";
import AjoInput from "@/components/ui/AjoInput";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = 1 | 2 | 3;

interface CreateCircleModalProps {
  onClose: () => void;
}

export default function CreateCircleModal({ onClose }: CreateCircleModalProps) {
  const router = useRouter();
  const { user } = useAuth();
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

  const handleClose = () => {
    // If we're not in the middle of submission, close
    if (!isSubmitting) {
      onClose();
    }
  };
  const validateStep1 = () => {
    if (!name.trim()) {
      Alert.alert("Missing field", "Please enter a circle name.");
      return false;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert(
        "Invalid amount",
        "Contribution amount must be greater than 0.",
      );
      return false;
    }
    const cap = parseInt(memberCapacity);
    if (isNaN(cap) || cap < 2 || cap > 50) {
      Alert.alert(
        "Invalid capacity",
        "Member capacity must be between 2 and 50.",
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
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create circle.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionHeader}>
        <AjoTypography variant="sectionHeader" style={styles.sectionTitle}>
          Create a circle
        </AjoTypography>
        <AjoTypography variant="bodySmall" color={colors.textSecondary}>
          Set up your savings circle.
          {"\n"}
          You can change settings later.
        </AjoTypography>
      </View>

      <View style={styles.formGroup}>
        <AjoCard>
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

        <AjoCard>
          <View style={styles.radioGroup}>
            <AjoTypography variant="label" style={styles.radioLabel}>
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
                  <View>
                    <AjoTypography
                      variant="bodySmall"
                      color={colors.textPrimary}
                    >
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
          </View>
        </AjoCard>

        <AjoCard>
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

        <AjoCard>
          <View style={styles.frequencyGroup}>
            <AjoTypography variant="label" style={styles.radioLabel}>
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
                        ? colors.textTertiary
                        : colors.textPrimary
                    }
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </AjoTypography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AjoCard>

        <AjoCard>
          <View style={styles.memberGroup}>
            <AjoTypography variant="label" style={styles.radioLabel}>
              Members
            </AjoTypography>
            <View style={styles.memberRow}>
              {[5, 10, 15].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.memberOption,
                    parseInt(memberCapacity) === num &&
                      styles.memberOptionActive,
                  ]}
                  onPress={() => setMemberCapacity(num.toString())}
                >
                  <AjoTypography
                    variant="bodySmall"
                    color={
                      parseInt(memberCapacity) === num
                        ? colors.textTertiary
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
          </View>
        </AjoCard>

        <AjoCard>
          <View style={styles.toggleGroup}>
            <AjoTypography variant="label" style={styles.radioLabel}>
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
                        ? colors.textTertiary
                        : colors.textPrimary
                    }
                  >
                    {order.charAt(0).toUpperCase() + order.slice(1)}
                  </AjoTypography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AjoCard>

        <AjoCard>
          <View style={styles.toggleGroup}>
            <AjoTypography variant="label" style={styles.radioLabel}>
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
                    openJoin === true ? colors.textTertiary : colors.textPrimary
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
                    openJoin === false
                      ? colors.textTertiary
                      : colors.textPrimary
                  }
                >
                  No (approval required)
                </AjoTypography>
              </TouchableOpacity>
            </View>
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

      <View style={styles.reviewCard}>
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
              <AjoTypography variant="label" color={colors.textTertiary}>
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
      </View>

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

      <View style={styles.summaryCard}>
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
              <AjoTypography variant="label" color={colors.textTertiary}>
                {item.label}
              </AjoTypography>
              <AjoTypography variant="body" weight="500">
                {item.value}
              </AjoTypography>
            </View>
          </View>
        ))}
      </View>

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
          onPress={() => Alert.alert("Invite", "Invite members to your circle")}
        />
        <AjoButton
          title="Go to circle"
          variant="outline"
          onPress={() => {
            if (createdCircle) {
              router.push(`/circle/${createdCircle.id}`);
            } else {
              router.back();
            }
          }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={{ width: 40 }} />
      </View>

      {step < 3}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {step < 3 && (
        <View style={styles.footer}>
          <AjoButton
            title={step === 1 ? "Continue" : "Create Circle"}
            onPress={handleNext}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
          {step === 2 && (
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={styles.backLink}
            >
              <AjoTypography variant="bodySmall" color={colors.textSecondary}>
                ← Go back
              </AjoTypography>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },

  scrollContent: {
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xl,
  },

  sectionHeader: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    textAlign: "left",
  },
  formGroup: {
    gap: spacing.sm,
  },
  input: {
    marginBottom: 0,
  },
  radioGroup: {
    gap: spacing.xs,
  },
  radioLabel: {
    marginBottom: spacing.xs,
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
    borderRadius: 8,
    gap: spacing.sm,
  },
  radioOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
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
  currencyLabel: {
    paddingHorizontal: spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  frequencyGroup: {
    gap: spacing.xs,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  frequencyOptionActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  memberGroup: {
    gap: spacing.xs,
  },
  memberRow: {
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "center",
  },
  memberOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  memberOptionActive: {
    backgroundColor: colors.primaryTint,
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
  toggleGroup: {
    gap: spacing.xs,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  toggleOptionActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  reviewItemLast: {
    borderBottomWidth: 0,
  },
  reviewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
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
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
  },
  successHeader: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  successTitle: {
    textAlign: "center",
  },
  successSubtitle: {
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  summaryItemLast: {
    borderBottomWidth: 0,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
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
    borderRadius: 8,
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  backLink: {
    alignSelf: "center",
    paddingVertical: spacing.xs,
  },
});
