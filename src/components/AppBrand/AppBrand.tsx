/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-require-imports */
import { StyleSheet, Text, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = { size?: number; showVersion?: boolean; horizontal?: boolean };

export function AppBrand({
  size = 32,
  showVersion = false,
  horizontal = true,
}: Props): React.JSX.Element {
  const { colors, radii, spacing, typography } = useAppTheme();
  return (
    <View
      style={[
        styles.root,
        horizontal ? styles.horizontal : styles.vertical,
        { gap: horizontal ? spacing.sm : spacing.xs },
      ]}
    >
      <AppIcon
        type="image"
        source={require('../../../assets/logo.png')}
        size={size}
        style={{ borderRadius: radii.xs }}
      />
      <View style={horizontal ? undefined : styles.vertical}>
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          আলাপ
        </Text>
        {showVersion ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Version {DeviceInfo.getVersion()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  horizontal: { flexDirection: 'row' },
  vertical: { alignItems: 'center' },
});
