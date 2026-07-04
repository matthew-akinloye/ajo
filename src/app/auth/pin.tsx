import AjoButton from "@/components/ui/AjoButton";
import AjoInput from "@/components/ui/AjoInput";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PinScreenProps {
  /** Mode of the PIN screen */
  mode?: "setup" | "confirm" | "enter";
  /** Callback when PIN is successfully entered/created */
  onPinComplete?: (pin: string) => void;
  /** Title override */
  title?: string;
  /** Subtitle override */
  subtitle?: string;
}

export default function PinScreen({
  mode = "enter",
  onPinComplete,
  title,
  subtitle,
}: PinScreenProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Determine if we need confirmation fields
  const isSetupMode = mode === "setup" || mode === "confirm";

  // Get title and subtitle based on mode
  const getTitle = () => {
    if (title) return title;
    switch (mode) {
      case "setup":
        return "Create PIN";
      case "confirm":
        return "Confirm PIN";
      default:
        return "Enter PIN";
    }
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    switch (mode) {
      case "setup":
        return "Create a 4‑digit PIN to secure your account";
      case "confirm":
        return "Re‑enter your PIN to confirm";
      default:
        return "Enter your PIN to continue";
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (isSetupMode && pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (onPinComplete) {
        await onPinComplete(pin);
      } else {
        router.back();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Arrow */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* PIN Input */}
            <AjoInput
              label="PIN"
              placeholder="****"
              value={pin}
              onChangeText={setPin}
              leftIcon={<Feather name="lock" size={20} color="#666" />}
              secureTextEntry
              maxLength={4}
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            {/* Confirm PIN (only in setup mode) */}
            {isSetupMode && (
              <AjoInput
                label="Confirm PIN"
                placeholder="****"
                value={confirmPin}
                onChangeText={setConfirmPin}
                leftIcon={<Feather name="check" size={20} color="#666" />}
                secureTextEntry
                maxLength={4}
                keyboardType="number-pad"
                containerStyle={styles.inputContainer}
              />
            )}

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Submit Button */}
            <AjoButton
              title={isLoading ? "Processing..." : "Continue"}
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- Styles (matching Login/Signup) ----------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "500",
    color: colors.textPrimary,
    lineHeight: 28,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  errorText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
});