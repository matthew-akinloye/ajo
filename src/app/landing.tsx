/**
 * àjó Landing / Onboarding Screen
 * First impression, entry point to sign up or log in
 */

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function LandingScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If already logged in, skip to home dashboard
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Branding */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <MaterialIcons name="groups" size={64} color={colors.primary} />
          </View>
          <Text variant="h1" style={styles.title}>
            àjó
          </Text>
          <Text
            variant="body"
            color={colors.textSecondary}
            style={styles.subtitle}
          >
            Save together, grow together
          </Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustration}>
          <MaterialIcons
            name="account-balance-wallet"
            size={120}
            color={colors.primary}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <Button
            label="Get Started"
            variant="primary"
            size="lg"
            fullWidth
            style={styles.button}
            onPress={() => router.push("/auth/signup")}
          />
          <Button
            label="Log In"
            variant="outlined"
            size="lg"
            fullWidth
            style={styles.button}
            onPress={() => router.push("/auth/login")}
          />
        </View>

        {/* Trust Indicators */}
        <View style={styles.trust}>
          <View style={styles.trustItem}>
            <MaterialIcons name="lock" size={20} color={colors.textTertiary} />
            <Text
              variant="bodySmall"
              color={colors.textTertiary}
              style={styles.trustText}
            >
              Secure & Private
            </Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialIcons
              name="verified-user"
              size={20}
              color={colors.textTertiary}
            />
            <Text
              variant="bodySmall"
              color={colors.textTertiary}
              style={styles.trustText}
            >
              Verified Members
            </Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialIcons
              name="payments"
              size={20}
              color={colors.textTertiary}
            />
            <Text
              variant="bodySmall"
              color={colors.textTertiary}
              style={styles.trustText}
            >
              Trusted by 1000+
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing["3xl"],
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  illustration: {
    alignItems: "center",
    marginBottom: spacing["3xl"],
  },
  buttons: {
    gap: spacing.md,
    marginBottom: spacing["3xl"],
  },
  button: {
    minHeight: 56,
  },
  trust: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  trustItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  trustText: {
    fontSize: 12,
  },
});
