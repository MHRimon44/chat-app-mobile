import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';

export type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  left?: ReactNode;
  right?: ReactNode;
  bordered?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  left,
  right,
  bordered = false,
}: AppHeaderProps): React.JSX.Element {
  const navigation = useNavigation();
  const { colors, layout, spacing, typography } = useAppTheme();
  const back = (): void => {
    if (onBackPress) onBackPress();
    else if (navigation.canGoBack()) navigation.goBack();
  };
  return (
    <View
      style={[
        styles.root,
        {
          minHeight: layout.header.height,
          paddingHorizontal: layout.header.horizontalPadding,
          borderBottomColor: colors.divider,
          borderBottomWidth: bordered ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <View style={styles.side}>
        {left ??
          (showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={back}
              style={styles.iconButton}
            >
              <AppIcon type="icon" name="chevron-left" />
            </Pressable>
          ) : null)}
      </View>
      <View style={[styles.center, { paddingHorizontal: spacing.sm }]}>
        {title ? (
          <Text numberOfLines={1} style={[typography.title, { color: colors.text }]}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', flexDirection: 'row' },
  side: { alignItems: 'flex-start', justifyContent: 'center', minWidth: 40 },
  right: { alignItems: 'flex-end' },
  center: { alignItems: 'center', flex: 1 },
  iconButton: { alignItems: 'center', justifyContent: 'center', minHeight: 40, minWidth: 40 },
});
