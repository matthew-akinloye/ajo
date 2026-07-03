/**
 * àjó Member Avatar Stack Component
 * Displays overlapping avatars for circle members
 * Based on Coinbase iOS avatar stack pattern
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Image, ImageStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface Member {
  id: string;
  avatar?: string;
  initials?: string;
}

interface MemberAvatarStackProps {
  members: Member[];
  size?: number;
  overlap?: number;
  maxVisible?: number;
  style?: ViewStyle;
}

export function MemberAvatarStack({
  members,
  size = 32,
  overlap = 12,
  maxVisible = 4,
  style,
}: MemberAvatarStackProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = Math.max(0, members.length - maxVisible);

  return (
    <View style={[styles.container, style]}>
      {visibleMembers.map((member, index) => (
        <View
          key={member.id}
          style={[
            styles.avatarWrapper,
            {
              width: size,
              height: size,
              marginLeft: index > 0 ? -overlap : 0,
            },
          ]}
        >
          {member.avatar ? (
            <Image
              source={{ uri: member.avatar }}
              style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
              ]}
            >
              <View style={styles.initials}>
                {/* Placeholder for initials */}
              </View>
            </View>
          )}
        </View>
      ))}
      {remainingCount > 0 && (
        <View
          style={[
            styles.avatarWrapper,
            styles.moreBadge,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -overlap,
            },
          ]}
        >
          <View style={styles.moreTextContainer}>
            {/* Will add text component later */}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  avatar: {
    backgroundColor: colors.surfaceGray,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    // Placeholder for initials styling
  },
  moreBadge: {
    backgroundColor: colors.surfaceGray2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreTextContainer: {
    // Placeholder for more text
  },
});
