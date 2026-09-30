import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { AppIcon } from '../AppIcon/AppIcon';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  icon: string;
  accessibilityLabel: string;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 40,
  iconSize = 22,
  color,
  backgroundColor,
  disabled = false,
  style,
}: Props): React.JSX.Element {
  const { colors, radii } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: radii.pill,
          backgroundColor: pressed
            ? colors.primarySoft
            : (backgroundColor ?? colors.surfaceElevated),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <AppIcon type="icon" name={icon} size={iconSize} color={color ?? colors.icon} />
    </Pressable>
  );
}
