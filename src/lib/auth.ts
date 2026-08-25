import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { pool } from "./db";

async function sendOtpEmail(data: { email: string; otp: string; type: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[v0] Development OTP for ${data.email}: ${data.otp}`);
      return;
    }
    throw new Error("Email delivery is not configured");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [data.email],
      subject: "Your Insider Domain verification code",
      html: `<p>Your verification code is <strong>${data.otp}</strong>.</p><p>This code expires shortly.</p>`,
    }),
  });
  if (!response.ok) throw new Error("Unable to deliver verification email");
}

const origin = (value?: string) => (value ? [value] : []);

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: { enabled: false },
  plugins: [
    emailOTP({
      expiresIn: 300,
      allowedAttempts: 5,
      storeOTP: "hashed",
      sendVerificationOTP: sendOtpEmail,
    }),
  ],
  trustedOrigins: [
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          ...origin(process.env.V0_RUNTIME_URL),
          ...origin(process.env.V0_DEV_APP_URL),
          ...origin(process.env.V0_BUILD_URL),
          ...origin(process.env.V0_SANDBOX_URL),
        ]
      : []),
    ...(process.env.NODE_ENV === "production"
      ? [
          ...origin(process.env.VERCEL_URL).map((value) => `https://${value}`),
          ...origin(process.env.VERCEL_PROJECT_PRODUCTION_URL).map((value) => `https://${value}`),
        ]
      : []),
  ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === "development"
    ? { advanced: { defaultCookieAttributes: { sameSite: "none" as const, secure: true } } }
    : {}),
});
