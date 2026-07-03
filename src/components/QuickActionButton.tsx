import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./ui/Text";

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onPress,
}) => {
  const PillContainer = Platform.OS === "ios" ? GlassView : View;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
    >
      <PillContainer style={styles.pill} glassEffectStyle="regular">
        <MaterialIcons
          name={icon as any}
          size={20}
          color={colors.primary}
          style={styles.icon}
        />
        <Text
          variant="label"
          color={colors.primary}
          weight="600"
          style={styles.label}
        >
          {label}
        </Text>
      </PillContainer>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  icon: {
    marginRight: spacing.lg,
  },
  label: {
    fontSize: 14,
  },
});
