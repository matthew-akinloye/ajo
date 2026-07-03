/**
 * àjó Invite Code Display Component
 * Based on Coinbase iOS Wallet Address Display
 * Uses mono font for codes, copy to clipboard with haptic feedback
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AjoTypography } from '@/components/ui';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

interface InviteCodeDisplayProps {
  code: string;
  style?: ViewStyle;
}

export function InviteCodeDisplay({ code, style }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const truncatedCode = code.length > 14 
    ? `${code.slice(0, 10)}...${code.slice(-8)}` 
    : code;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Pressable onPress={handleCopy} style={[styles.container, style]}>
      <AjoTypography variant="mono" style={styles.code}>
        {truncatedCode}
      </AjoTypography>
      <Ionicons
        name={copied ? 'checkmark-circle' : 'copy-outline'}
        size={16}
        color={copied ? colors.success : colors.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGray,
    padding: spacing[3],
    borderRadius: radius.md,
    gap: spacing[2],
  },
  code: {
    flex: 1,
  },
});
