export type UserProfile = Readonly<{
  id: string;
  username?: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}>;

export type Conversation = Readonly<{
  id: string;
  type: 'direct';
  counterpart: UserProfile;
  activityAt: string;
  hidden: boolean;
  notificationsEnabled: boolean;
  muteUntil?: string;
  unreadCount: number;
  lastDeliveredMessageId?: string;
  lastDeliveredAt?: string;
  lastSeenMessageId?: string;
  lastSeenAt?: string;
}>;

export type PageEnvelope<T> = Readonly<{
  data: readonly T[];
  page: { hasMore: boolean; nextCursor: string | null };
}>;
