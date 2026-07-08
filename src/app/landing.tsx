/**
 * àjó Landing / Onboarding Screen
 * First impression, entry point to sign up or log in
 */

import AjoButton from "@/components/ui/AjoButton";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Data for the 3 onboarding slides
const slides = [
  {
    id: "1",
    icon: "groups",
    title: "Save Together",
    description: "Join a community of savers. Pool resources and reach goals faster with friends.",
    iconColor: colors.primary,
  },
  {
    id: "2",
    icon: "account-balance-wallet",
    title: "Track Your Progress",
    description: "Monitor every contribution and payout in real time. Stay on top of your savings.",
    iconColor: colors.error || "#FF6B6B",
  },
  {
    id: "3",
    icon: "verified-user",
    title: "Secure & Trusted",
    description: "Verified members, encrypted data, and a proven system trusted by thousands.",
    iconColor: colors.success || "#4CAF50",
  },
];

export default function LandingScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null;
  }

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      // Last slide – navigate to signup
      router.push("/auth/signup");
    }
  };

  const handleSkip = () => {
    goToSlide(slides.length - 1);
  };

  const renderDot = (index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.dot, currentIndex === index && styles.activeDot]}
      onPress={() => goToSlide(index)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Skip button (only on first two slides) */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text variant="body" color={colors.textSecondary}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.illustrationWrapper}>
              <View
                style={[
                  styles.iconBackground,
                  { backgroundColor: slide.iconColor + "20" }, // 20% opacity
                ]}
              >
                <MaterialIcons
                  name={slide.icon as any}
                  size={100}
                  color={slide.iconColor}
                />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text variant="h1" style={styles.title}>
                {slide.title}
              </Text>
              <Text
                variant="body"
                color={colors.textSecondary}
                style={styles.description}
              >
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom area: dots + actions */}
      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>{slides.map((_, i) => renderDot(i))}</View>

        <View style={styles.buttonsContainer}>
          {currentIndex === slides.length - 1 ? (
            <>
              <AjoButton
                title="Get Started"
                variant="primary"
                style={styles.button}
                onPress={() => router.push("/auth/signup")}
              />
              <AjoButton
                title="Log In"
                variant="outline"
                style={styles.button}
                onPress={() => router.push("/auth/login")}
              />
            </>
          ) : (
            <AjoButton
              title="Next"
              variant="primary"
              style={styles.button}
              onPress={handleNext}
            />
          )}
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
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationWrapper: {
    marginBottom: spacing["3xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 300,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  bottomContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["3xl"],
    paddingTop: spacing.md,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 6,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  button: {
    minHeight: 56,
  },
});