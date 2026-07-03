import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "gradient";
  padding?: number;
  radius?: number;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = spacing.lg,
  radius: borderRadius = radius.lg,
  children,
  style,
  ...props
}) => {
  const backgroundColor = variant === "default" ? colors.surface : colors.surfaceSecondary;

  if (variant === "gradient") {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0.26, y: 0 }}
        end={{ x: 1, y: 0.26 }}
        style={[
          styles.container,
          {
            padding,
            borderRadius,
          },
          style,
        ]}
        {...(props as any)}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          padding,
          borderRadius,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
