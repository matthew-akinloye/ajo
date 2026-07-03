/**
 * àjó Status Pill Component
 * Based on Coinbase iOS status pills (Earn badge, etc.)
 * Used for contribution status: Paid, Late, Pending
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AjoTypography } from '@/components/ui';

export type StatusPillVariant = 'paid' | 'late' | 'pending' | 'verified';

interface StatusPillProps {
  variant: StatusPillVariant;
  label?: string;
  style?: ViewStyle;
}

export function StatusPill({ variant, label, style }: StatusPillProps) {
  const getConfig = () => {
    switch (variant) {
      case 'paid':
        return {
          backgroundColor: colors.successTint,
          textColor: colors.success,
          defaultLabel: 'Paid',
        };
      case 'late':
        return {
          backgroundColor: colors.errorTint,
          textColor: colors.error,
          defaultLabel: 'Late',
        };
      case 'pending':
        return {
          backgroundColor: colors.primaryTint,
          textColor: colors.primary,
          defaultLabel: 'Pending',
        };
      case 'verified':
        return {
          backgroundColor: colors.successTint,
          textColor: colors.success,
          defaultLabel: 'Verified',
        };
      default:
        return {
          backgroundColor: colors.surfaceGray2,
          textColor: colors.textSecondary,
          defaultLabel: 'Unknown',
        };
    }
  };

  const config = getConfig();
  const displayLabel = label || config.defaultLabel;

  return (
    <View style={[styles.pill, { backgroundColor: config.backgroundColor }, style]}>
      <AjoTypography
        variant="buttonSmall"
        color={config.textColor}
        style={styles.text}
      >
        {displayLabel}
      </AjoTypography>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.xl,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
  },
});
