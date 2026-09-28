import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';
type Props = {
  icon: string;
  title: string;
  subtitle?: string | undefined;
  children?: ReactNode;
  last?: boolean;
};
export function SettingsRow({
  icon,
  title,
  subtitle,
  children,
  last = false,
}: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <View
      style={{
        borderBottomColor: colors.divider,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        padding: spacing.md,
      }}
    >
      <View style={styles.top}>
        <View
          style={[styles.iconBox, { backgroundColor: colors.primarySoft, borderRadius: radii.md }]}
        >
          <AppIcon type="icon" name={icon} size={21} color={colors.primary} />
        </View>
        <View style={styles.text}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  top: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconBox: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  text: { flex: 1, gap: 2 },
});
