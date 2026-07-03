/**
 * àjó Signup Screen
 * Based on index.tsx blueprint - typography-first, minimal design
 */

import AjoButton from "@/components/ui/AjoButton";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        email: email || null,
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
          {/* Logo/Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logo}>
              <Text variant="hero" color={colors.primary}>
                àjó
              </Text>
            </View>
            <Text
              variant="body"
              color={colors.textTertiary}
              style={styles.tagline}
            >
              Save together, grow together
            </Text>
          </View>

          {/* Signup Form */}
          <Card variant="default" padding={spacing.xl} style={styles.formCard}>
            <Text variant="h2" style={styles.title}>
              Create account
            </Text>
            <Text
              variant="label"
              color={colors.textTertiary}
              style={styles.subtitle}
            >
              Join thousands saving together
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Full name *"
                placeholderTextColor={colors.textTertiary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone number *"
                placeholderTextColor={colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Email (optional)"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="4-digit PIN *"
                placeholderTextColor={colors.textTertiary}
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm PIN *"
                placeholderTextColor={colors.textTertiary}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />

              {error ? (
                <Text variant="label" color={colors.error} style={styles.error}>
                  {error}
                </Text>
              ) : null}

              {/* <Pressable
                style={styles.button}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text variant="label" color={colors.textInverted} weight="600">
                  {isLoading ? "Creating account..." : "Create Account"}
                </Text>
              </Pressable> */}
<AjoButton title="Create account" onPress={() => {}} />



<AjoButton title="Submit" disabled={true} />
<AjoButton title="Saving..." loading={true} />

            </View>
          </Card>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text variant="label" color={colors.textTertiary}>
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/auth/login")}>
              <Text variant="label" color={colors.primary} weight="600">
                Sign in
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  brandSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    marginBottom: spacing.sm,
  },
  tagline: {
    textAlign: "center",
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 16,
  },
  error: {
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
