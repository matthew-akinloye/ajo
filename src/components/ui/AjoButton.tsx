import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

export interface AjoButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const AjoButton: React.FC<AjoButtonProps> = ({
  title,
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const containerStyles = [styles.container, style];
  const textStyles = [styles.text, textStyle];

  const content = loading ? (
    <ActivityIndicator color="rgba(3, 117, 35, 1)" />
  ) : (
    children || <Text style={textStyles}>{title}</Text>
  );

  return (
    <Pressable
      style={({ pressed }) => [
        containerStyles,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'stretch',
    flexShrink: 0,
    borderStyle: 'solid',
    backgroundColor: 'rgba(215, 254, 226, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 3,
    paddingHorizontal: 62,
    paddingVertical: 14,
    borderWidth: 0.1,
    borderColor: 'rgba(245, 245, 245, 1)',
    borderRadius: 8,
  },
  text: {
    position: 'relative',
    flexShrink: 0,
    textAlign: 'center',
    color: 'rgba(3, 117, 35, 1)',
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AjoButton;