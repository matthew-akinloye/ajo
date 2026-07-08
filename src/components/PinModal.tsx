/**
 * àjó PIN Verification Modal
 * Reusable modal for PIN verification before sensitive actions
 */

import AjoButton from "@/components/ui/AjoButton";
import { AjoCard } from "@/components/ui/AjoCard";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { apiService } from "@/services/api.service";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  message?: string;
}

export function PinModal({
  visible,
  onClose,
  onSuccess,
  title = "Enter your PIN to continue",
  message,
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiService.verifyPin({ pin });
      onSuccess(pin);
      handleClose();
    } catch (err: any) {
      setError("Incorrect PIN");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  const handlePinChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 4) {
      setPin(numericValue);
      setError("");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          <AjoCard style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="lock" size={32} color={colors.primary} />
              </View>
              <AjoTypography variant="cardTitle" style={styles.title}>
                {title}
              </AjoTypography>
              {message && (
                <AjoTypography
                  variant="body"
                  color={colors.textSecondary}
                  style={styles.message}
                >
                  {message}
                </AjoTypography>
              )}
            </View>

            {/* PIN Input */}
            <View style={styles.pinContainer}>
              <View style={styles.pinBoxes}>
                {[0, 1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.pinBox,
                      error ? styles.pinBoxError : null,
                      pin.length > index ? styles.pinBoxFilled : null,
                    ]}
                  >
                    <AjoTypography
                      variant="amountHero"
                      color={
                        error
                          ? colors.error
                          : pin.length > index
                            ? colors.primary
                            : colors.textTertiary
                      }
                    >
                      {pin.length > index ? "•" : ""}
                    </AjoTypography>
                  </View>
                ))}
              </View>

              {/* Hidden text input for keyboard */}
              <TextInput
                style={styles.hiddenInput}
                value={pin}
                onChangeText={handlePinChange}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                autoFocus={visible}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <AjoTypography
                variant="label"
                color={colors.error}
                style={styles.error}
              >
                {error}
              </AjoTypography>
            ) : null}

            {/* Actions */}
            <View style={styles.actions}>
              <AjoButton
                title="Cancel"
                variant="outline"
                style={styles.cancelButton}
                onPress={handleClose}
              />
              <AjoButton
                title={isLoading ? "Verifying..." : "Confirm"}
                style={styles.confirmButton}
                onPress={handleSubmit}
                disabled={isLoading || pin.length !== 4}
              />
            </View>
          </AjoCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  container: {
    width: "100%",
    maxWidth: 400,
  },
  card: {
    gap: spacing.lg,
  },
  header: {
    alignItems: "center",
    gap: spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginTop: spacing.xs,
  },
  pinContainer: {
    alignItems: "center",
    position: "relative",
  },
  pinBoxes: {
    flexDirection: "row",
    gap: spacing.md,
  },
  pinBox: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  pinBoxError: {
    borderColor: colors.error,
  },
  pinBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  error: {
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
