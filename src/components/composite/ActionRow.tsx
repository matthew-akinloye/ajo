
import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AjoTypography } from '@/components/ui';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

export interface Action {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

interface ActionRowProps {
  actions: [Action, Action, Action, Action];
  style?: ViewStyle;
}

export function ActionRow({ actions, style }: ActionRowProps) {
  return (
    <View style={[styles.container, style]}>
      {actions.map((action, index) => (
        <Pressable
          key={index}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            action.onPress();
          }}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: pressed ? colors.surfaceGray2 : colors.surfaceGray,
            },
          ]}
        >
          <Ionicons name={action.icon} size={24} color={colors.primary} />
          <AjoTypography variant="buttonSmall" style={styles.label}>
            {action.label}
          </AjoTypography>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.lg,
    minHeight: 88,
  },
  label: {
    marginTop: spacing[1],
  },
});
