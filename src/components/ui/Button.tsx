import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleSheet,
    View,
} from 'react-native';
import { Text } from './Text';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    md: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    lg: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: isDisabled ? colors.divider : colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
  };

  const textColor =
    variant === 'outlined' ? colors.textPrimary : colors.textInverted;

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        styles.button,
        sizeStyles[size],
        variantStyles[variant],
        {
          opacity: state.pressed && !isDisabled ? 0.8 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            variant="subtitle"
            color={textColor}
            weight="600"
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
});
