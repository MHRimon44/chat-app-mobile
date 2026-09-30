import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastInput = { message: string; title?: string; type?: ToastType; duration?: number };
type ToastContextValue = { showToast: (input: ToastInput) => void; hideToast: () => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { colors, radii, shadows, spacing, typography } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastInput & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    if (timer.current) clearTimeout(timer.current);
    const next = { ...input, id: Date.now() };
    setToast(next);
    timer.current = setTimeout(() => setToast(null), input.duration ?? 3200);
  }, []);

  const value = useMemo(() => ({ hideToast, showToast }), [hideToast, showToast]);
  const type = toast?.type ?? 'info';
  const tone =
    type === 'success'
      ? colors.success
      : type === 'error'
        ? colors.danger
        : type === 'warning'
          ? colors.warning
          : colors.primary;
  const icon =
    type === 'success'
      ? 'check-circle-outline'
      : type === 'error'
        ? 'alert-circle-outline'
        : type === 'warning'
          ? 'alert-outline'
          : 'information-outline';

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[styles.layer, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLiveRegion="polite"
            onPress={hideToast}
            style={[
              styles.toast,
              shadows.md,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radii.lg,
                marginHorizontal: spacing.lg,
                padding: spacing.md,
              },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: `${tone}18`, borderRadius: radii.pill }]}>
              <AppIcon type="icon" name={icon} size={22} color={tone} />
            </View>
            <View style={styles.copy}>
              {toast.title ? (
                <Text style={[typography.label, { color: colors.text }]}>{toast.title}</Text>
              ) : null}
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{toast.message}</Text>
            </View>
            <AppIcon type="icon" name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider.');
  return value;
}

const styles = StyleSheet.create({
  layer: { left: 0, position: 'absolute', right: 0, top: 0, zIndex: 20000 },
  toast: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12 },
  icon: { alignItems: 'center', height: 38, justifyContent: 'center', width: 38 },
  copy: { flex: 1, gap: 2 },
});
