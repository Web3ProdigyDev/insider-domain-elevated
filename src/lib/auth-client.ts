import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const authBaseURL =
  typeof window === "undefined"
    ? "http://localhost:3000/api/auth"
    : `${window.location.origin}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [emailOTPClient()],
});
export const { signIn, signUp, signOut, useSession } = authClient;
