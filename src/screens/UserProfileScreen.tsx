import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useCreateDirectConversationMutation, useGetUserQuery } from '../chat/chatApi';
import { Avatar } from '../components/Avatar';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;
export function UserProfileScreen({ navigation, route }: Props): React.JSX.Element {
  const profile = useGetUserQuery(route.params.userId);
  const [create, creation] = useCreateDirectConversationMutation();
  if (profile.isLoading)
    return (
      <Screen>
        <ActivityIndicator accessibilityLabel="Loading profile" />
      </Screen>
    );
  if (profile.data === undefined)
    return (
      <Screen>
        <Text style={styles.error}>This profile could not be loaded.</Text>
      </Screen>
    );
  const user = profile.data;
  const start = async (): Promise<void> => {
    try {
      const conversation = await create(user.id).unwrap();
      navigation.replace('Chat', {
        conversationId: conversation.id,
        counterpartId: user.id,
        title: user.displayName,
      });
    } catch {
      // Mutation state renders a safe retryable error.
    }
  };
  return (
    <Screen>
      <View style={styles.content}>
        <Avatar displayName={user.displayName} />
        <Text accessibilityRole="header" style={styles.title}>
          {user.displayName}
        </Text>
        {user.username === undefined ? null : <Text style={styles.username}>@{user.username}</Text>}
        {user.bio === undefined ? null : <Text style={styles.bio}>{user.bio}</Text>}
        <PrimaryButton
          label="Start chat"
          loading={creation.isLoading}
          onPress={() => {
            void start();
          }}
        />
        {creation.isError ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            Could not start the conversation.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { alignItems: 'center', flex: 1, gap: spacing.md, justifyContent: 'center' },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
  username: { color: colors.primary },
  bio: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
});
