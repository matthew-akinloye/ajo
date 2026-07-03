import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AjoTypography as Text } from '@/components/ui/AjoTypography';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';

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
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={icon as any}
          size={28}
          color={colors.primary}
        />
      </View>
      <Text
        variant="bodySmall"
        color={colors.textSecondary}
        style={styles.label}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
});
