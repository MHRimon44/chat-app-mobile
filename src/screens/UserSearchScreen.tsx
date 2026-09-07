import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLazySearchUsersQuery } from '../chat/chatApi';
import { mergeUniqueById } from '../chat/listHelpers';
import type { UserProfile } from '../chat/types';
import { Screen } from '../components/Screen';
import { UserRow } from '../components/UserRow';
import type { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'UserSearch'>;
export function UserSearchScreen({ navigation }: Props): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [items, setItems] = useState<UserProfile[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [search, request] = useLazySearchUsersQuery();
  const run = async (reset: boolean): Promise<void> => {
    const normalized = reset ? query.trim() : submitted;
    if (normalized.length < 2) return;
    try {
      const page = await search(
        { query: normalized, ...(reset || cursor === null ? {} : { cursor }) },
        false,
      ).unwrap();
      setSubmitted(normalized);
      setItems((current) => (reset ? [...page.data] : mergeUniqueById(current, page.data)));
      setCursor(page.page.nextCursor);
      setHasMore(page.page.hasMore);
    } catch {
      // RTK Query exposes the safe error state to the rendered retry UI.
    }
  };
  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        Find people
      </Text>
      <View style={styles.search}>
        <TextInput
          accessibilityLabel="Username search"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          onSubmitEditing={() => {
            void run(true);
          }}
          placeholder="Search by username"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={styles.input}
          value={query}
        />
        <Pressable
          accessibilityRole="button"
          disabled={query.trim().length < 2 || request.isFetching}
          onPress={() => {
            void run(true);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
      </View>
      {query.length > 0 && query.trim().length < 2 ? (
        <Text style={styles.hint}>Enter at least two letters, numbers, or underscores.</Text>
      ) : null}
      <FlatList
        contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
        data={items}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasMore && !request.isFetching) void run(false);
        }}
        renderItem={({ item }) => (
          <UserRow
            onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
            user={item}
          />
        )}
        ListEmptyComponent={
          request.isFetching ? (
            <ActivityIndicator accessibilityLabel="Searching users" />
          ) : request.isError ? (
            <Text style={styles.error}>Search failed. Please try again.</Text>
          ) : submitted.length > 0 ? (
            <Text style={styles.empty}>No matching usernames found.</Text>
          ) : (
            <Text style={styles.empty}>Search for an exact username prefix.</Text>
          )
        }
        ListFooterComponent={
          request.isFetching && items.length > 0 ? <ActivityIndicator /> : undefined
        }
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  title: { ...typography.heading, color: colors.text, paddingVertical: spacing.md },
  search: { flexDirection: 'row', gap: spacing.sm },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonText: { color: colors.surface, fontWeight: '700' },
  hint: { color: colors.textMuted, paddingTop: spacing.xs },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
});
