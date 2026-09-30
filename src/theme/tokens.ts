export { lightColors, darkColors } from './colors';
export type { AppColors } from './colors';
export { spacing, radii } from './spacing';
export { typography } from './typography';
export { layout } from './layout';
export type { ScreenMode } from './layout';
export { shadows } from './shadows';
// Legacy only. New components should use useAppTheme().colors so dark mode stays reactive.
export { lightColors as colors } from './colors';
