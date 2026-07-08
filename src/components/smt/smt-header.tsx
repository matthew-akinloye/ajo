import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
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
  title?: React.ReactNode;
  titleStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  onLeftPress?: () => void;
  leftPressableProps?: Omit<PressableProps, "onPress" | "children">;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  rightPressableProps?: Omit<PressableProps, "onPress" | "children">;
  rightButtons?: {
    icon: React.ReactNode;
    onPress: () => void;
    key?: string;
    pressableProps?: Omit<PressableProps, "onPress" | "children">;
  }[];
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  headerStyle?: StyleProp<ViewStyle>;
  glassContainerStyle?: StyleProp<ViewStyle>;
  glassButtonStyle?: StyleProp<ViewStyle>;
  glassSpacing?: number;
  absolute?: boolean;
  topOffset?: number;
}

const Header: React.FC<HeaderProps> = ({
  title = "",
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
  glassSpacing = spacing.sm,
  absolute = true,
  topOffset = 50,
}) => {
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
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.3)",
          overflow: "hidden",
        },
        pressed: {
          opacity: 0.7,
        },
      }),
    [],
  );

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
          <View style={[styles.glassButton, glassButtonStyle]}>
            {leftIcon}
          </View>
        </Pressable>
      );
    }
    return null;
  };

  const renderRight = () => {
    const buttons: React.ReactNode[] = [];

    // Custom component
    if (rightComponent) {
      buttons.push(
        <View key="right-component" style={styles.rightContainer}>
          {rightComponent}
        </View>
      );
    }

    // Multiple buttons
    if (rightButtons && rightButtons.length > 0) {
      const btnElements = rightButtons.map((btn, index) => (
        <Pressable
          key={btn.key || `right-btn-${index}`}
          onPress={btn.onPress}
          {...btn.pressableProps}
          style={({ pressed }) => [
            styles.glassButton,
            glassButtonStyle,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.glassButton, glassButtonStyle]}>
            {btn.icon}
          </View>
        </Pressable>
      ));

      buttons.push(
        <View
          key="right-buttons-group"
          style={[glassContainerStyle, styles.rightContainer]}
        >
          {btnElements}
        </View>
      );
    }

    // Single button
    if (rightIcon) {
      buttons.push(
        <Pressable
          key="single-right-btn"
          onPress={onRightPress}
          {...rightPressableProps}
          style={({ pressed }) => [
            styles.glassButton,
            glassButtonStyle,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.glassButton, glassButtonStyle]}>
            {rightIcon}
          </View>
        </Pressable>
      );
    }

    if (buttons.length === 0) return null;

    return <View style={styles.rightContainer}>{buttons}</View>;
  };

  const headerStyles = [styles.header, headerStyle];

  return (
    <View style={headerStyles}>
      {title === "" ? (
        <View>{renderLeft()}</View>
      ) : (
        <Text style={[styles.glassText, titleStyle]}>{title}</Text>
      )}
      <View style={styles.rightContainer}>
        {renderRight()}
      </View>
    </View>
  );
};

export default Header;