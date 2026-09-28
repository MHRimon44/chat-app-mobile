import { useMemo } from 'react';
import type { AppTheme } from '../theme/ThemeProvider';
import { useAppTheme } from '../theme/ThemeProvider';

export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useAppTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
