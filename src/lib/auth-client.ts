import { createAuthClient } from "better-auth/react";

const authBaseURL =
  typeof window === "undefined"
    ? "http://localhost:3000/api/auth"
    : `${window.location.origin}/api/auth`;

export const authClient = createAuthClient({ baseURL: authBaseURL });
export const { signIn, signUp, signOut, useSession } = authClient;
