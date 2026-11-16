export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Our profile, as returned by /auth/signup, /auth/sync and /auth/me.
export interface SignupResponse {
  id: string;
  supabaseId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}
