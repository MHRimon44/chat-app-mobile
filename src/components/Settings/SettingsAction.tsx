import { Pressable, StyleSheet, Text } from 'react-native';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';
type Props = {
  icon: string;
  title: string;
  onPress: () => void;
  danger?: boolean;
  loading?: boolean;
  last?: boolean;
};
export function SettingsAction({
  icon,
  title,
  onPress,
  danger = false,
  loading = false,
  last = false,
}: Props): React.JSX.Element {
  const { colors, spacing, typography } = useAppTheme();
  const tint = danger ? colors.danger : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        {
          borderBottomColor: colors.divider,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          opacity: pressed || loading ? 0.6 : 1,
          padding: spacing.md,
        },
      ]}
    >
      <AppIcon type="icon" name={loading ? 'loading' : icon} size={22} color={tint} />
      <Text style={[typography.bodyMedium, { color: tint, flex: 1 }]}>{title}</Text>
      <AppIcon type="icon" name="chevron-right" size={21} color={colors.textMuted} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  root: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 58 },
});
