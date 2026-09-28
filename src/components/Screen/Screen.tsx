import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme/ThemeProvider';
import type { ScreenMode } from '../../theme/layout';
import { AppHeader, type AppHeaderProps } from '../AppHeader/AppHeader';

export type ScreenProps = PropsWithChildren<{
  mode?: ScreenMode;
  edges?: Edge[];
  safeArea?: boolean;
  keyboardAvoiding?: boolean;
  keyboardVerticalOffset?: number;
  padded?: boolean;
  header?: AppHeaderProps | false;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  footer?: ReactNode;
}>;

export function Screen({
  children,
  mode = 'fixed',
  edges,
  safeArea = true,
  keyboardAvoiding = true,
  keyboardVerticalOffset,
  padded = true,
  header = false,
  backgroundColor,
  style,
  contentStyle,
  scrollProps,
  footer,
}: ScreenProps): React.JSX.Element {
  const { colors, layout } = useAppTheme();
  const resolvedEdges = edges ?? layout.safeArea.all;
  const paddingStyle = padded ? { paddingHorizontal: layout.screen.horizontalPadding } : undefined;
  const bodyStyle = [styles.content, paddingStyle, contentStyle];

  const body =
    mode === 'fixed' ? (
      <View style={bodyStyle}>{children}</View>
    ) : (
      <ScrollView
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...scrollProps}
        contentContainerStyle={[
          bodyStyle,
          mode === 'auto' ? styles.autoContent : undefined,
          { paddingBottom: layout.screen.verticalPadding },
        ]}
      >
        {children}
      </ScrollView>
    );

  const inner = (
    <KeyboardAvoidingView
      behavior={
        keyboardAvoiding
          ? Platform.OS === 'ios'
            ? layout.keyboard.iosBehavior
            : layout.keyboard.androidBehavior
          : undefined
      }
      enabled={keyboardAvoiding}
      keyboardVerticalOffset={keyboardVerticalOffset ?? layout.keyboard.verticalOffset}
      style={styles.flex}
    >
      {header === false ? null : <AppHeader {...header} />}
      {body}
      {footer}
    </KeyboardAvoidingView>
  );

  const rootStyle = [styles.flex, { backgroundColor: backgroundColor ?? colors.background }, style];
  return safeArea ? (
    <SafeAreaView edges={resolvedEdges} style={rootStyle}>
      {inner}
    </SafeAreaView>
  ) : (
    <View style={rootStyle}>{inner}</View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1 },
  autoContent: { flexGrow: 1 },
});
