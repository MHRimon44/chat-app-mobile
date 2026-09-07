export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  ConversationList: undefined;
  Settings: undefined;
  UserSearch: undefined;
  UserProfile: { userId: string };
  Chat: { conversationId: string; counterpartId: string; title: string };
};
