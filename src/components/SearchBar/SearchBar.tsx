import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  loading?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  loading = false,
}: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
        },
      ]}
    >
      <AppIcon type="icon" name="magnify" size={21} color={colors.textMuted} />
      <TextInput
        accessibilityLabel="Search people"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Search by username"
        placeholderTextColor={colors.placeholder}
        returnKeyType="search"
        style={[styles.input, typography.body, { color: colors.text }]}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          disabled={loading}
          hitSlop={8}
          onPress={onClear}
        >
          <AppIcon type="icon" name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 50,
  },
  input: { flex: 1, minHeight: 48, paddingHorizontal: 10, paddingVertical: 0 },
});
