import type { Edge } from 'react-native-safe-area-context';

export const layout = {
  screen: {
    horizontalPadding: 20,
    verticalPadding: 16,
    keyboardBottomPadding: 120,
    contentMaxWidth: 720,
    defaultMode: 'fixed' as const,
  },
  header: {
    height: 56,
    horizontalPadding: 16,
    iconSize: 24,
  },
  input: {
    minHeight: 48,
    maxMultilineHeight: 140,
  },
  button: { minHeight: 48 },
  avatar: { sm: 32, md: 44, lg: 64, xl: 96 },
  icon: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 },
  safeArea: {
    all: ['top', 'right', 'bottom', 'left'] as Edge[],
    vertical: ['top', 'bottom'] as Edge[],
    top: ['top'] as Edge[],
    bottom: ['bottom'] as Edge[],
    none: [] as Edge[],
  },
  keyboard: {
    iosBehavior: 'padding' as const,
    androidBehavior: 'height' as const,
    verticalOffset: 0,
  },
} as const;

export type ScreenMode = 'fixed' | 'scroll' | 'auto';
