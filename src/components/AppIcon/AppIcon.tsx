import type { ComponentType } from 'react';
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppTheme } from '../../theme/ThemeProvider';

type SvgComponent = ComponentType<{
  width?: number;
  height?: number;
  color?: string;
}>;

type BaseProps = {
  size?: number;
  color?: string;
  accessibilityLabel?: string;
};

type VectorProps = BaseProps & {
  type: 'icon';
  name: string;
  style?: StyleProp<TextStyle>;
  source?: never;
  Svg?: never;
};

type ImageProps = BaseProps & {
  type: 'image';
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  name?: never;
  Svg?: never;
};

type SvgProps = BaseProps & {
  type: 'svg';
  Svg: SvgComponent;
  name?: never;
  source?: never;
};

export type AppIconProps = VectorProps | ImageProps | SvgProps;

export function AppIcon(props: AppIconProps): React.JSX.Element {
  const { colors, layout } = useAppTheme();

  const size = props.size ?? layout.icon.md;
  const color = props.color ?? colors.icon;

  if (props.type === 'image') {
    return (
      <Image
        accessibilityLabel={props.accessibilityLabel}
        source={props.source}
        style={[
          {
            width: size,
            height: size,
          },
          props.style,
        ]}
        resizeMode="contain"
      />
    );
  }

  if (props.type === 'svg') {
    const Svg = props.Svg;

    return <Svg width={size} height={size} color={color} />;
  }

  return (
    <MaterialCommunityIcons
      accessibilityLabel={props.accessibilityLabel}
      name={props.name}
      size={size}
      color={color}
      style={props.style}
    />
  );
}
