import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
import { AppIcon } from '../AppIcon/AppIcon';

export function NetworkIndicator(): React.JSX.Element | null {
  const { colors, radii, shadows, spacing, typography } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [restored, setRestored] = useState(false);
  const previous = useRef<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const next = state.isConnected === true && state.isInternetReachable !== false;
      if (previous.current === false && next) {
        setRestored(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setRestored(false), 2600);
      }
      if (!next) setRestored(false);
      setConnected(next);
      previous.current = next;
    });
    return () => {
      unsubscribe();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (connected !== false && !restored) return null;
  const offline = connected === false;
  const tone = offline ? colors.warning : colors.success;

  return (
    <View pointerEvents="none" style={[styles.layer, { top: insets.top + spacing.sm }]}>
      <View
        style={[
          styles.pill,
          shadows.md,
          {
            backgroundColor: colors.surface,
            borderColor: tone,
            borderRadius: radii.pill,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <AppIcon type="icon" name={offline ? 'wifi-off' : 'wifi'} size={18} color={tone} />
        <View>
          <Text style={[typography.label, { color: colors.text }]}>
            {offline ? 'You’re offline' : 'Back online'}
          </Text>
          <Text style={[styles.detail, { color: colors.textMuted }]}>
            {offline ? 'Messages will send when you reconnect.' : 'Connection restored.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { alignItems: 'center', left: 0, position: 'absolute', right: 0, zIndex: 15000 },
  pill: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, maxWidth: 360 },
  detail: { fontSize: 11, marginTop: 1 },
});
