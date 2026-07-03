/**
 * àjó Border Radius Tokens
 * Flat design - max 12px as specified in plan
 */

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 12,
  pill: 500,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
