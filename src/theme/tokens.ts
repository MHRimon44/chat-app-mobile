import { lightColors } from './colors';
export { lightColors, darkColors } from './colors';
export type { AppColors } from './colors';
export { spacing, radii } from './spacing';
export { typography } from './typography';
// Backward-compatible default for existing screens. New UI should use useAppTheme().colors.
export const colors = lightColors;
