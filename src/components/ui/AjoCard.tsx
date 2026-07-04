import { colors, radius, spacing } from "@/theme";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export type AjoCardVariant = "default" | "elevated" | "flat";

interface AjoCardProps extends ViewProps {
  variant?: AjoCardVariant;
  padding?: number;
  style?: ViewStyle;
}

export function AjoCard({
  variant = "default",
  padding = spacing[4],
  style,
  children,
  ...props
}: AjoCardProps) {
  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return styles.elevatedCard;
      case "flat":
        return styles.flatCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View style={[getCardStyle(), { padding }, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  defaultCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.successTint,
  },
  elevatedCard: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  flatCard: {
    backgroundColor: colors.surfaceGray,
    borderRadius: radius.lg,
  },
});
