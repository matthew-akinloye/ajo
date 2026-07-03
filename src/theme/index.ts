export * from './colors';
export * from './spacing';
export * from './typography';

// Combined theme object for convenience
export const theme = {
  colors: require('./colors').colors,
  spacing: require('./spacing').spacing,
  radius: require('./spacing').radius,
  typography: require('./typography').typography,
};
