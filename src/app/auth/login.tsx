/**
 * àjó Login Screen
 * Based on index.tsx blueprint - typography-first, minimal design
 */

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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

          {/* Login Form */}
          <Card variant="default" padding={spacing.xl} style={styles.formCard}>
            <Text variant="h2" style={styles.title}>
              Welcome back
            </Text>
            <Text
              variant="label"
              color={colors.textTertiary}
              style={styles.subtitle}
            >
              Sign in to access your savings circles
            </Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor={colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="4-digit PIN"
                placeholderTextColor={colors.textTertiary}
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />

              {error ? (
                <Text variant="label" color={colors.error} style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text variant="label" color={colors.textInverted} weight="600">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text variant="label" color={colors.textTertiary}>
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text variant="label" color={colors.primary} weight="600">
                Sign up
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
