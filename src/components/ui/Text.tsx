import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

type TextVariant = keyof typeof typography;

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  weight?: 'normal' | 'bold' | '600' | '700';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = colors.textPrimary,
  weight,
  style,
  ...props
}) => {
  const typographyStyle = typography[variant];
  
  const fontWeight = weight || typographyStyle.fontWeight;

  return (
    <RNText
      {...props}
      style={[
        {
          fontSize: typographyStyle.fontSize,
          fontWeight: fontWeight as any,
          lineHeight: typographyStyle.lineHeight,
          color,
        },
        style,
      ]}
    />
  );
};
