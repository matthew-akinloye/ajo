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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  // Form state
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation and submission
  const handleLogin = async () => {
    if (!phone || !pin) {
      setError("Please fill in all fields");
      return;
    }

    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login({ phone, pin });
      router.replace("/(tabs)");
    } catch (err) {
      // Generic error per spec
      setError("Invalid phone number or PIN");
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
          {/* Back Arrow (optional – if user comes from signup or elsewhere) */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to access your savings circles</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
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
              label="4-digit PIN"
              placeholder="****"
              value={pin}
              onChangeText={setPin}
              leftIcon={<Feather name="lock" size={20} color="#666" />}
              secureTextEntry
              maxLength={4}
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Login Button */}
            <AjoButton
              title={isLoading ? "Signing in..." : "Sign In"}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            />

            {/* Sign Up Link */}
            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => router.push("/auth/signup")}
            >
              <Text style={styles.signupText}>
                Don't have an account?{" "}
                <Text style={styles.signupHighlight}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- Styles (matching SignupScreen) ----------
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
  signupLink: {
    alignSelf: "center",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signupText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  signupHighlight: {
    color: colors.primary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});