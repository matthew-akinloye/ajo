import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./ui/Text";

interface QuickActionButtonProps {
  icon: string;                   // icon name (works for both families)
  label: string;
  onPress: () => void;
  iconFamily?: "material" | "feather"; // default: 'material'
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onPress,
  iconFamily = "material", // backward compatibility
}) => {
  const PillContainer = Platform.OS === "ios" ? GlassView : View;

  // Choose the icon component based on the family
  const IconComponent = iconFamily === "feather" ? Feather : MaterialIcons;

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
        <IconComponent
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