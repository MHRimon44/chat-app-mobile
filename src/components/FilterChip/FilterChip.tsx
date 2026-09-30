import { Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = { label: string; selected: boolean; onPress: () => void };

export function FilterChip({ label, selected, onPress }: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.root,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surfaceElevated,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
        },
      ]}
    >
      <Text style={[typography.label, { color: selected ? colors.primary : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  root: { alignItems: 'center', borderWidth: 1, height: 36, justifyContent: 'center' },
});
