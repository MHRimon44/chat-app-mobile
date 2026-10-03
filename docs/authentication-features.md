# Temporary authentication configuration

`src/config/authFeatures.ts` is the single mobile configuration source. Both flags are currently false. API URLs and environment selection are unchanged.

## Registration contract and flow

The adjacent backend's `src/auth/routes.ts` and `src/auth/service.ts` return HTTP 201 with `{ data: TokenPair }` when registration OTP is disabled. The pair contains `accessToken`, `accessTokenExpiresAt`, `refreshToken`, and `user`.

Before: Register → register API → VerifyRegistration → verify API → secure session → conversations.

Now: Register → register API → validate token pair → existing `persistTokenPair` → conversations, with “Account created” feedback. Missing credentials or an old OTP message response fail validation; they cannot create an authenticated session. The inspected direct-registration backend always returns a session, so there is no account-only/Login fallback.

The existing Keychain refresh-token storage, Redux sign-in listener, Socket.IO authentication, refresh, launch restoration, and logout remain unchanged. Registration stays disabled while the API and credential persistence are pending, with an immediate submission lock to prevent duplicate requests. Existing backend error formatting remains in use.

## Restore registration OTP

1. Configure backend email delivery and enable backend `registrationOtpEnabled`.
2. Set `registrationOtpEnabled: true` in `src/config/authFeatures.ts`.
3. `src/services/api/authApi.ts` then accepts the legacy message response. `src/screens/Auth/Register/RegisterScreen.tsx` sends the user to the preserved verification screen, and `src/navigation/RootNavigator.tsx` registers that route.
4. `src/screens/Auth/VerifyRegistration/VerifyRegistrationScreen.tsx` and its existing API mutation complete verification and persist the returned token pair. No component or API restoration is needed.
5. Update the disabled-default test in `src/services/api/authApi.test.ts` and test registration, verification, validation errors, and back navigation against the enabled backend.

## Restore Forgot Password

1. Configure backend email delivery and enable backend `passwordResetEnabled`.
2. Set `forgotPasswordEnabled: true` in `src/config/authFeatures.ts`.
3. `src/screens/Auth/Login/LoginScreen.tsx` shows the recovery action and `src/navigation/RootNavigator.tsx` registers all three preserved routes.
4. The preserved ForgotPassword, VerifyResetOtp, and ResetPassword screens under `src/screens/Auth/` use their existing mutations in `src/services/api/authApi.ts`. Types remain in `src/navigation/types.ts`.
5. Update the disabled-default test and exercise Login → ForgotPassword → VerifyResetOtp → ResetPassword → Login.

## Device/backend validation checklist

Automated unit tests cover registration response validation, the re-enabled OTP contract, secure session persistence ordering/failure, restart refresh, and logout. These do not replace device or live-backend checks.

- Launch logged out; confirm Welcome/Login/Register open normally.
- Register a unique valid account; inspect the request fields and device metadata, see “Account created,” and reach conversations without OTP.
- Confirm no `/v1/auth/register/verify` or `/v1/auth/password/*` requests occur.
- Submit quickly twice; confirm only one registration request.
- Try duplicate email and username, invalid fields, offline registration, and server errors; confirm error feedback and retry availability.
- Log out; sign in with the new account and with an existing account.
- Restart while signed in; confirm refresh restores the session and authenticated navigation.
- Confirm the recovery action is absent and all OTP/recovery routes are unavailable.
- Check conversation list, sending/receiving messages, profile, socket reconnect, and existing notifications.
