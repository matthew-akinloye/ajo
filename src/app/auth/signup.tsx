import AjoButton from "@/components/ui/AjoButton";
import AjoInput from "@/components/ui/AjoInput";
import { useAuth } from "@/contexts/AuthContext";
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

// ---------- Main Component ----------
export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation and submission
  const handleSignup = async () => {
    if (!fullName || !phone || !pin) {
      setError("Please fill in all required fields");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signup({
        full_name: fullName,
        phone,
        email: null,
        pin,
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
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
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Start or join trusted saving circles</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <AjoInput
              label="Full name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              leftIcon={<Feather name="user" size={20} color="#666" />}
              autoCapitalize="words"
              containerStyle={styles.inputContainer}
            />

            {/* Phone Number */}
            <AjoInput
              label="Phone Number"
              placeholder="080 123 456 78"
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Feather name="phone" size={20} color="#666" />}
              keyboardType="phone-pad"
              containerStyle={styles.inputContainer}
            />

            {/* PIN */}
            <AjoInput
              label="Create 4 digit pin"
              placeholder="****"
              value={pin}
              onChangeText={setPin}
              leftIcon={<Feather name="lock" size={20} color="#666" />}
              secureTextEntry
              maxLength={4}
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            {/* Confirm PIN */}
            <AjoInput
              label="Confirm pin"
              placeholder="****"
              value={confirmPin}
              onChangeText={setConfirmPin}
              leftIcon={<Feather name="lock" size={20} color="#666" />}
              secureTextEntry
              maxLength={4}
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Terms & Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating account, you agree to the{" "}
                <Text style={styles.termsLink}>Terms of service</Text>{" "}
                <Text style={styles.termsText}>and</Text>{" "}
                <Text style={styles.termsLink}>Privacy policy</Text>
              </Text>
            </View>

            {/* Create Account Button */}
            <AjoButton
              title={isLoading ? "Creating account..." : "Create account"}
              onPress={handleSignup}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            />

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.loginText}>Already got an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- Improved Styles ----------
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
    paddingHorizontal: 20, // increased from spacing.lg (16) for better edge breathing
    paddingTop: 20,         // slightly more top padding
    paddingBottom: 32,      // extra bottom space for keyboard scroll
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,       // more space below back arrow
    paddingVertical: 12,    // larger touch target
    paddingHorizontal: 8,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,       // increased separation from form
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
    marginTop: 4,           // reduced gap between title and subtitle
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,       // increased spacing between inputs
  },
  errorText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  termsContainer: {
    marginVertical: 20,     // more vertical space around terms
    alignItems: "center",
    paddingHorizontal: 8,   // ensures text doesn't touch edges
  },
  termsText: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,         // improved readability for multi-line
  },
  termsLink: {
    color: colors.primary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  button: {
    marginBottom: 16,       // consistent spacing before login link
  },
  loginLink: {
    alignSelf: "center",
    marginTop: 12,          // slightly more gap after button
    paddingVertical: 8,     // larger tap area
    paddingHorizontal: 16,
  },
  loginText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary,
    textDecorationLine: "underline",
  },
});