/**
 * àjó PIN Setup/Entry Screen
 * Based on index.tsx blueprint - typography-first, minimal design
 */

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PinScreenProps {
  mode?: "setup" | "confirm" | "enter";
  onPinComplete?: (pin: string) => void;
}

export default function PinScreen({
  mode = "enter",
  onPinComplete,
}: PinScreenProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (mode === "confirm" && pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    if (onPinComplete) {
      onPinComplete(pin);
    } else {
      router.back();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "setup":
        return "Create PIN";
      case "confirm":
        return "Confirm PIN";
      default:
        return "Enter PIN";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "setup":
        return "Create a 4-digit PIN to secure your account";
      case "confirm":
        return "Re-enter your PIN to confirm";
      default:
        return "Enter your PIN to continue";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Card variant="default" padding={spacing.xl} style={styles.card}>
            <Text variant="h2" style={styles.title}>
              {getTitle()}
            </Text>
            <Text
              variant="label"
              color={colors.textTertiary}
              style={styles.subtitle}
            >
              {getDescription()}
            </Text>

            <View style={styles.pinSection}>
              <TextInput
                style={styles.pinInput}
                placeholder="••••"
                placeholderTextColor={colors.textTertiary}
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                textAlign="center"
              />

              {mode === "confirm" && (
                <TextInput
                  style={styles.pinInput}
                  placeholder="Confirm PIN"
                  placeholderTextColor={colors.textTertiary}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  textAlign="center"
                />
              )}

              {error && (
                <Text variant="label" color={colors.error} style={styles.error}>
                  {error}
                </Text>
              )}
            </View>

            <Pressable style={styles.button} onPress={handlePinSubmit}>
              <Text variant="label" color={colors.textInverted} weight="600">
                Continue
              </Text>
            </Pressable>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  pinSection: {
    width: "100%",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pinInput: {
    height: 56,
    fontSize: 32,
    letterSpacing: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  error: {
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    width: "100%",
  },
});
