export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerifyRegistration: { email: string };
  ForgotPassword: undefined;
  VerifyResetOtp: { email: string };
  ResetPassword: { token: string };
  ConversationList: undefined;
  Settings: undefined;
  MyProfile: undefined;
  UserSearch: undefined;
  UserProfile: { userId: string };
  Chat: { conversationId: string; counterpartId: string; title: string };
};
