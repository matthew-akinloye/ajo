import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AjoTypography, AjoButton } from '@/components/ui';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

export type CircleStatus = 'active' | 'pending' | 'completed';

interface CircleRowProps {
  id: string;
  name: string;
  amount: string;
  frequency: string;
  membersFilled: number;
  membersCapacity: number;
  color: string;
  status?: CircleStatus;
  onPress?: () => void;
  onJoinPress?: () => void;
  style?: ViewStyle;
}

export function CircleRow({
  name,
  amount,
  frequency,
  membersFilled,
  membersCapacity,
  color,
  status = 'active',
  onPress,
  onJoinPress,
  style,
}: CircleRowProps) {
  const progress = membersFilled / membersCapacity;
  const isFull = membersFilled >= membersCapacity;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleJoinPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onJoinPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, style]}>
      {/* Icon */}
      <View style={[styles.icon, { backgroundColor: color }]}>
        <Ionicons name="people" size={20} color="#FFFFFF" />
      </View>

      {/* Middle content */}
      <View style={styles.middle}>
        <AjoTypography variant="cardTitle" numberOfLines={1}>
          {name}
        </AjoTypography>
        <AjoTypography variant="bodySmall" color={colors.textSecondary}>
          {amount} · {frequency}
        </AjoTypography>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
      </View>

      {/* Trailing content */}
      <View style={styles.trailing}>
        <AjoTypography variant="amount" color={colors.textPrimary}>
          {membersFilled}/{membersCapacity}
        </AjoTypography>
        {!isFull && (
          <AjoButton
            label="Join"
            variant="primary"
            onPress={handleJoinPress}
            style={styles.joinButton}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.canvas,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.divider,
    minHeight: 64,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  middle: {
    flex: 1,
    marginRight: spacing[3],
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceGray2,
    borderRadius: 2,
    marginTop: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  trailing: {
    alignItems: 'flex-end',
  },
  joinButton: {
    height: 32,
    paddingHorizontal: spacing[3],
    marginTop: spacing[1],
  },
});
