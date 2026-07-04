// app/(auth)/landing.tsx
import AjoButton from "@/components/ui/AjoButton";
import { AjoTypography } from "@/components/ui/AjoTypography";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AjoLogo } from "@/components/ui/AjoLogo";

export default function guideScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null;
  }

  const navigateTo = (screen: string) => {
    if (isAuthenticated) {
      router.push(screen);
    } else {
      router.push("/auth/signup");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {/* Logo – replace with your actual component */}
            <View style={styles.logoPlaceholder}>
              <AjoLogo />
            </View>
            <View style={styles.headerTextContainer}>
              <View style={styles.headerRow}>
                <AjoTypography variant="sectionHeader" style={styles.welcomeText}>
                  Welcome to Ajo
                </AjoTypography>
              </View>
              <View style={styles.subtitleRow}>
                <AjoTypography variant="bodySmall" color={colors.textSecondary}>
                  You’re in! Let’s help you get set up
                </AjoTypography>
              </View>
            </View>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <AjoTypography variant="body" style={styles.optionsTitle}>
              Choose what you’d like to do first!
            </AjoTypography>

            <View style={styles.cardsContainer}>
              {/* Card 1: Start a private circle */}
              <TouchableOpacity
                style={[styles.card, styles.cardPrivateStart]}
                onPress={() => navigateTo("/circles/create")}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, styles.badgeGreen]}>
                      <AjoTypography variant="chip" color={colors.primaryDark}>
                        Private circle
                      </AjoTypography>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <AjoTypography variant="cardTitle">Start a circle</AjoTypography>
                    <AjoTypography variant="bodySmall" color={colors.textPrimary}>
                      Save with people you already know.
                    </AjoTypography>
                  </View>
                  <AjoTypography variant="bodySmall" color={colors.textTertiary}>
                    Invite friends, family or colleagues to build a private savings
                    circle
                  </AjoTypography>
                </View>
                <View style={[styles.iconCircle, styles.iconCircleGreen]}>
                  <Feather name="arrow-right" size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>

              {/* Card 2: Join a private circle */}
              <TouchableOpacity
                style={[styles.card, styles.cardPrivateJoin]}
                onPress={() => navigateTo("/circles/join")}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, styles.badgePurple]}>
                      <AjoTypography variant="chip" color={colors.primaryDark}>
                        Private circle
                      </AjoTypography>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <AjoTypography variant="cardTitle">Join a circle</AjoTypography>
                    <AjoTypography variant="bodySmall" color={colors.textPrimary}>
                      Join a circle you’ve been invited to.
                    </AjoTypography>
                  </View>
                  <AjoTypography variant="bodySmall" color={colors.textTertiary}>
                    Use an invitation link from someone you already know
                  </AjoTypography>
                </View>
                <View style={[styles.iconCircle, styles.iconCirclePurple]}>
                  <Feather name="arrow-right" size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>

              {/* Card 3: Discover public circles */}
              <TouchableOpacity
                style={[styles.card, styles.cardPublic]}
                onPress={() => navigateTo("/explore")}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, styles.badgePink]}>
                      <AjoTypography variant="chip" color={colors.primaryDark}>
                        Public circle
                      </AjoTypography>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <AjoTypography variant="cardTitle">
                      Discover public circles
                    </AjoTypography>
                    <AjoTypography variant="bodySmall" color={colors.textPrimary}>
                      Find verified communities that match your goals.
                    </AjoTypography>
                  </View>
                  <AjoTypography variant="bodySmall" color={colors.textTertiary}>
                    Join public saving circles where every member is verified and
                    reputation matters
                  </AjoTypography>
                </View>
                <View style={[styles.iconCircle, styles.iconCirclePink]}>
                  <Feather name="arrow-right" size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trust section */}
          <View style={styles.trustContainer}>
            <View style={styles.trustInner}>
              <View style={styles.trustIconContainer}>
                <Feather name="shield" size={16} color={colors.primary} />
              </View>
              <View style={styles.trustTextContainer}>
                <AjoTypography variant="body" color={colors.primaryDark}>
                  Built on trust, not assumptions.
                </AjoTypography>
                <AjoTypography variant="bodySmall" color={colors.textTertiary}>
                  Identity verification and reputation help create safer savings
                  circles.
                </AjoTypography>
              </View>
            </View>
          </View>

          {/* Bottom actions */}
          <View style={styles.bottomActions}>
            <AjoButton
              title="Get Started"
              onPress={() => router.push("/auth/signup")}
              style={styles.getStartedButton}
            />

            <View style={styles.howItWorksRow}>
              <View style={styles.questionCircle}>
                <AjoTypography variant="chip" color="#CCC2E5" style={styles.questionMark}>
                  ?
                </AjoTypography>
              </View>
              <TouchableOpacity onPress={() => alert("How ajo works – coming soon")}>
                <AjoTypography variant="bodySmall" color="#7B7A85">
                  How does ajo work?
                </AjoTypography>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/auth/login")}
            >
              <AjoTypography variant="bodySmall" color="#7B7A85">
                Already have an account?{" "}
                <AjoTypography
                  variant="bodySmall"
                  color={colors.primary}
                  style={styles.loginHighlight}
                >
                  Log in
                </AjoTypography>
              </AjoTypography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  container: {
    flex: 1,
    rowGap: spacing.md,
  },
  header: {
    rowGap: spacing.xs,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  headerTextContainer: {
    rowGap: spacing.md,
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  welcomeText: {
    lineHeight: 28,
  },
  subtitleRow: {
    paddingHorizontal: spacing.md,
  },
  optionsContainer: {
    rowGap: spacing.sm,
  },
  optionsTitle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cardsContainer: {
    rowGap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 12,
  },
  cardPrivateStart: {
    backgroundColor: "#F5FFF8",
  },
  cardPrivateJoin: {
    backgroundColor: "#F5F5FF",
  },
  cardPublic: {
    backgroundColor: "#F8F0FF",
  },
  cardContent: {
    flex: 1,
    rowGap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  badgeGreen: {
    backgroundColor: "#D7FEE2",
  },
  badgePurple: {
    backgroundColor: "#DBDBFF",
  },
  badgePink: {
    backgroundColor: "#CB8FFF",
  },
  cardBody: {
    rowGap: spacing.xs,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 22.85,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleGreen: {
    backgroundColor: "#D7FEE2",
  },
  iconCirclePurple: {
    backgroundColor: "#DBDBFF",
  },
  iconCirclePink: {
    backgroundColor: "#CB8FFF",
  },
  trustContainer: {
    paddingLeft: spacing.md,
    paddingRight: 97,
    paddingVertical: spacing.sm,
    backgroundColor: "#FAFFFA",
    borderWidth: 0.5,
    borderColor: "#BFFDCF",
    borderRadius: 8,
    shadowColor: "rgba(0,0,0,0.02)",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  trustInner: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: spacing.sm,
  },
  trustIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 25.4,
    backgroundColor: "#D7FEE2",
    justifyContent: "center",
    alignItems: "center",
  },
  trustTextContainer: {
    flex: 1,
    rowGap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  bottomActions: {
    rowGap: spacing.md,
    alignItems: "center",
  },
  getStartedButton: {
    width: "100%",
  },
  howItWorksRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  questionCircle: {
    width: 12,
    height: 12,
    borderRadius: 100000,
    borderWidth: 1,
    borderColor: "#CCC2E5",
    justifyContent: "center",
    alignItems: "center",
  },
  questionMark: {
    textAlign: "center",
    lineHeight: 10.4,
  },
  loginLink: {
    marginTop: spacing.xs,
  },
  loginHighlight: {
    textDecorationLine: "underline",
  },
});