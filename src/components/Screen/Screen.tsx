import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
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
  const { colors, dark, layout } = useAppTheme();

  const resolvedEdges = edges ?? layout.safeArea.all;

  const resolvedBackgroundColor = backgroundColor ?? colors.background;

  const paddingStyle = padded
    ? {
        paddingHorizontal: layout.screen.horizontalPadding,
      }
    : undefined;

  const bodyStyle =
    mode === 'fixed'
      ? [styles.fixedContent, paddingStyle, contentStyle]
      : [styles.scrollContent, paddingStyle, contentStyle];

  const body =
    mode === 'fixed' ? (
      <View style={bodyStyle}>{children}</View>
    ) : (
      <ScrollView
        {...scrollProps}
        style={styles.flex}
        contentContainerStyle={[
          bodyStyle,
          mode === 'auto' ? styles.autoContent : undefined,
          {
            paddingBottom: layout.screen.keyboardBottomPadding,
          },
        ]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        {children}
      </ScrollView>
    );

  const content = (
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
      {header !== false ? <AppHeader {...header} /> : null}

      {body}

      {footer}
    </KeyboardAvoidingView>
  );

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: resolvedBackgroundColor,
        },
        style,
      ]}
    >
      <StatusBar animated barStyle={dark ? 'light-content' : 'dark-content'} />

      {safeArea ? (
        <SafeAreaView edges={resolvedEdges} style={styles.safeArea}>
          {content}
        </SafeAreaView>
      ) : (
        <View style={styles.flex}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  flex: {
    flex: 1,
  },

  fixedContent: {
    flex: 1,
  },

  scrollContent: {},

  autoContent: {
    flexGrow: 1,
  },
});
