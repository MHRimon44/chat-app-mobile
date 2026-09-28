import { Image, StyleSheet, Text, View } from 'react-native';
import { initials } from '../../utils/listHelpers';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  displayName: string;
  imageUrl?: string | undefined;
  size?: number;
  online?: boolean;
};

export function Avatar({
  displayName,
  imageUrl,
  size = 48,
  online = false,
}: Props): React.JSX.Element {
  const { colors, radii } = useAppTheme();
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  };

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {imageUrl ? (
        <Image
          accessibilityLabel={`${displayName} avatar`}
          source={{ uri: imageUrl }}
          style={avatarStyle}
        />
      ) : (
        <View accessibilityLabel={`${displayName} avatar`} style={[styles.avatar, avatarStyle]}>
          <Text
            style={[styles.text, { color: colors.primary, fontSize: Math.max(13, size * 0.34) }]}
          >
            {initials(displayName)}
          </Text>
        </View>
      )}
      {online ? (
        <View
          accessibilityLabel="Online"
          style={[
            styles.online,
            {
              backgroundColor: colors.success,
              borderColor: colors.background,
              width: Math.max(12, size * 0.25),
              height: Math.max(12, size * 0.25),
              borderRadius: radii.pill,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800' },
  online: { borderWidth: 2, bottom: 0, position: 'absolute', right: 0 },
});
