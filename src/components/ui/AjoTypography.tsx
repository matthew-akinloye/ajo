/**
 * àjó Typography Component
 * Wrapper for Text that applies typography tokens from theme
 */

import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { typography } from '@/theme';

export type AjoTypographyVariant =
  | 'hero'
  | 'amountHero'
  | 'screenTitle'
  | 'sectionHeader'
  | 'cardTitle'
  | 'amount'
  | 'change'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'tab'
  | 'allCaps'
  | 'chip'
  | 'button'
  | 'buttonSmall'
  | 'mono'
  | 'monoSmall';

interface AjoTypographyProps extends TextProps {
  variant?: AjoTypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
}

export function AjoTypography({
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  style,
  children,
  ...props
}: AjoTypographyProps) {
  const textStyle: TextStyle = {
    ...(typography[variant] || typography.body),
    ...(color && { color }),
    textAlign: align,
  };

  return (
    <Text
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
}
