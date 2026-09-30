import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';
type Props<T extends string> = {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  disabled?: boolean;
};
export function ChoicePills<T extends string>({
  options,
  selected,
  onSelect,
  disabled = false,
}: Props<T>): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <View style={[styles.list, { gap: spacing.sm }]}>
      {options.map((option) => {
        const active = option === selected;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: active, disabled }}
            disabled={disabled}
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.choice,
              {
                backgroundColor: active ? colors.primarySoft : colors.surfaceElevated,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            {active ? <AppIcon type="icon" name="check" size={15} color={colors.primary} /> : null}
            <Text
              style={[
                typography.caption,
                { color: active ? colors.primary : colors.textSecondary },
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  list: { flexDirection: 'row', flexWrap: 'wrap' },
  choice: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    justifyContent: 'center',
  },
});
