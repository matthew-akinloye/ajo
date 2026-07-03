
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { GlassContainer, GlassView } from "expo-glass-effect";
import React, { useMemo } from "react";
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export interface HeaderProps {
  /** Main title (string or custom React node) */
  title?: React.ReactNode;
  /** Custom style for the title */
  titleStyle?: StyleProp<TextStyle>;
  /** Icon or element to display on the left side */
  leftIcon?: React.ReactNode;
  /** Press handler for the left button */
  onLeftPress?: () => void;
  /** Props passed to the left Pressable */
  leftPressableProps?: Omit<PressableProps, "onPress" | "children">;
  /** Icon or element to display on the right side (single button) */
  rightIcon?: React.ReactNode;
  /** Press handler for the right button */
  onRightPress?: () => void;
  /** Props passed to the right Pressable (single button) */
  rightPressableProps?: Omit<PressableProps, "onPress" | "children">;
  /** Multiple right buttons (overrides `rightIcon`/`onRightPress`) */
  rightButtons?: {
    icon: React.ReactNode;
    onPress: () => void;
    key?: string;
    pressableProps?: Omit<PressableProps, "onPress" | "children">;
  }[];
  /** Custom component to replace the entire left area */
  leftComponent?: React.ReactNode;
  /** Custom component to replace the entire right area */
  rightComponent?: React.ReactNode;
  /** Style for the outer header container */
  headerStyle?: StyleProp<ViewStyle>;
  /** Style for the `GlassContainer` that wraps the right-side buttons */
  glassContainerStyle?: StyleProp<ViewStyle>;
  /** Style for each individual glass button (applies to all) */
  glassButtonStyle?: StyleProp<ViewStyle>;
  /** Spacing between glass buttons (used in `GlassContainer`) */
  glassSpacing?: number;
  /** If true, the header will use absolute positioning (default: true) */
  absolute?: boolean;
  /** Top offset for absolute positioning (default: 50) */
  topOffset?: number;
}

const Header: React.FC<HeaderProps> = ({
  title = "Sentri",
  titleStyle,
  leftIcon,
  onLeftPress,
  leftPressableProps,
  rightIcon,
  onRightPress,
  rightPressableProps,
  rightButtons,
  leftComponent,
  rightComponent,
  headerStyle,
  glassContainerStyle,
  glassButtonStyle,
  glassSpacing = spacing.sm, // 8
  absolute = true,
  topOffset = 50,
}) => {
  // Build styles
  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          width: "100%",
          height: 100,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.sm,
          backgroundColor: "transparent",
        },
        absolute: {
          position: "absolute",
          left: 0,
          right: 0,
        },
        rightContainer: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
        },
        glassText: {
          fontSize: 30,
          fontWeight: "bold",
          color: colors.textPrimary,
          textAlign: "center",
        },
        glassButton: {
          width: 50,
          height: 50,
          borderRadius: radius.full,
          justifyContent: "center",
          alignItems: "center",
        },
        pressed: {
          opacity: 0.7,
        },
      }),
    [],
  );

  // Render left content
  const renderLeft = () => {
    if (leftComponent) return leftComponent;
    if (leftIcon) {
      return (
        <Pressable
          onPress={onLeftPress}
          {...leftPressableProps}
          style={({ pressed }) => [
            styles.glassButton,
            glassButtonStyle,
            pressed && styles.pressed,
          ]}
        >
          <GlassView
            style={[styles.glassButton, glassButtonStyle]}
            isInteractive
          >
            {leftIcon}
          </GlassView>
        </Pressable>
      );
    }
    return null;
  };

  // Render right content
  const renderRight = () => {
    const buttons = [];

    // Add custom component if provided
    if (rightComponent) {
      buttons.push(rightComponent);
    }

    // Multiple buttons
    if (rightButtons && rightButtons.length > 0) {
      buttons.push(
        <GlassContainer
          spacing={glassSpacing}
          style={[glassContainerStyle, styles.rightContainer]}
        >
          {rightButtons.map((btn, index) => (
            <Pressable
              key={btn.key || index}
              onPress={btn.onPress}
              {...btn.pressableProps}
              style={({ pressed }) => [
                styles.glassButton,
                glassButtonStyle,
                pressed && styles.pressed,
              ]}
            >
              <GlassView
                style={[styles.glassButton, glassButtonStyle]}
                isInteractive
              >
                {btn.icon}
              </GlassView>
            </Pressable>
          ))}
        </GlassContainer>,
      );
    }

    // Single button
    if (rightIcon) {
      buttons.push(
        <Pressable
          onPress={onRightPress}
          {...rightPressableProps}
          style={({ pressed }) => [
            styles.glassButton,
            glassButtonStyle,
            pressed && styles.pressed,
          ]}
        >
          <GlassView
            style={[styles.glassButton, glassButtonStyle]}
            isInteractive
          >
            {rightIcon}
          </GlassView>
        </Pressable>,
      );
    }

    if (buttons.length === 0) return null;

    return <View style={styles.rightContainer}>{buttons}</View>;
  };

  const headerStyles = [styles.header, headerStyle];

  return (
    <View style={headerStyles}>
      {typeof title === "string" ? (
        <Text style={[styles.glassText, titleStyle]}>{title}</Text>
      ) : (
        title
      )}
      <View style={styles.rightContainer}>
        {renderLeft()}
        {renderRight()}
      </View>
    </View>
  );
};

export default Header;
