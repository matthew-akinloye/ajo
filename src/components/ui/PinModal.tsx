// components/ui/PinModal.tsx
import AjoButton from "@/components/ui/AjoButton";
import AjoInput from "@/components/ui/AjoInput";
import { AjoTypography } from "@/components/ui/AjoTypography";
import ReusableBottomSheet, {
  ReusableBottomSheetRef,
} from "@/components/smt/smt-bottom-sheet";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View, StyleSheet } from "react-native";

export interface PinModalRef {
  show: (config: {
    title: string;
    subtitle?: string;
    onConfirm: (pin: string) => Promise<void>;
  }) => void;
  hide: () => void;
}

export const PinModal = forwardRef<PinModalRef>((_, ref) => {
  const sheetRef = useRef<ReusableBottomSheetRef>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("Enter PIN");
  const [subtitle, setSubtitle] = useState(
    "Enter your 4-digit PIN to continue",
  );
  const [onConfirm, setOnConfirm] = useState<(pin: string) => Promise<void>>(
    () => Promise.resolve,
  );

  const show = (config: {
    title: string;
    subtitle?: string;
    onConfirm: (pin: string) => Promise<void>;
  }) => {
    setTitle(config.title);
    setSubtitle(config.subtitle || "Enter your 4-digit PIN to continue");
    setOnConfirm(() => config.onConfirm);
    setPin("");
    setError("");
    setIsLoading(false);
    // Open the sheet by snapping to index 0
    sheetRef.current?.snapToIndex(0);
  };

  const hide = () => {
    sheetRef.current?.close();
  };

  const handleConfirm = async () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await onConfirm(pin);
      hide();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid PIN");
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ show, hide }));

  return (
    <ReusableBottomSheet
      ref={sheetRef}
      snapPoints={["40%"]}
      initialIndex={-1}
      enablePanDownToClose
    >
      <View style={styles.container}>
        <AjoTypography variant="sectionHeader" style={styles.title}>
          {title}
        </AjoTypography>
        {subtitle && (
          <AjoTypography
            variant="bodySmall"
            color={colors.textSecondary}
            style={styles.subtitle}
          >
            {subtitle}
          </AjoTypography>
        )}
        <AjoInput
          placeholder="****"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          maxLength={4}
          keyboardType="number-pad"
          containerStyle={styles.input}
          error={error}
        />
        <View style={styles.actions}>
          <AjoButton
            title="Confirm"
            onPress={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          />

        </View>
      </View>
    </ReusableBottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.xs,
    color: colors.textInverted,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacing.lg,
    color: colors.textInverted,
  },
  input: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "column",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
