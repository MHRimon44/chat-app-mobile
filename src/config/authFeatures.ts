// TEMPORARILY DISABLED:
// Registration OTP verification will return when backend email
// verification is re-enabled.
// TODO: Enable registrationOtpEnabled alongside the backend flag to restore
// Register → VerifyRegistration → authenticated app.
// TODO: Enable forgotPasswordEnabled alongside backend passwordResetEnabled
// to restore Login → ForgotPassword → VerifyResetOtp → ResetPassword.
export const authFeatures = {
  registrationOtpEnabled: false,
  forgotPasswordEnabled: false,
};
