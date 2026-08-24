import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateOfBirthPicker } from "@/components/common/date-of-birth-picker";
import { notify } from "@/lib/notify";
import { isValidInvitation, referrerFor } from "@/lib/auth-store";
import { authClient } from "@/lib/auth-client";
import { AGE_CONFIG, calculateAge } from "@/lib/age";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create membership — Insider Domain" },
      {
        name: "description",
        content: "Register your Insider Domain membership using an invitation code.",
      },
      { property: "og:title", content: "Create membership — Insider Domain" },
      {
        property: "og:description",
        content: "Register your Insider Domain membership using an invitation code.",
      },
    ],
  }),
  component: SignUpRoute,
});

type Fields = {
  surname: string;
  firstName: string;
  middleName: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
  dob: string;
  invitationCode: string;
};

const emptyFields: Fields = {
  surname: "",
  firstName: "",
  middleName: "",
  username: "",
  email: "",
  password: "",
  confirm: "",
  dob: "",
  invitationCode: "",
};

const DRAFT_KEY = "insider-domain.signup-draft.v1";

function SignUpRoute() {
  const navigate = useNavigate();
  const [fields, setFields] = React.useState<Fields>(emptyFields);
  const [errors, setErrors] = React.useState<Partial<Record<keyof Fields, string>>>({});

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) setFields({ ...emptyFields, ...(JSON.parse(raw) as Partial<Fields>) });
    } catch {
      /* ignore */
    }
  }, []);

  const set = (key: keyof Fields, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ ...next, password: "", confirm: "" }),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const validate = () => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.surname.trim()) next.surname = "Required";
    if (!fields.firstName.trim()) next.firstName = "Required";
    if (fields.username.trim().length < 3) next.username = "At least 3 characters";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email.trim())) next.email = "Enter a valid email";
    if (fields.password.length < 8) next.password = "At least 8 characters";
    if (fields.password !== fields.confirm) next.confirm = "Passwords do not match";
    if (!fields.dob) next.dob = "Select your date of birth";
    else if (calculateAge(fields.dob) < AGE_CONFIG.minimumAge)
      next.dob = `Membership requires age ${AGE_CONFIG.minimumAge} or above`;
    if (!isValidInvitation(fields.invitationCode)) next.invitationCode = "Format: ID-0000-ABCD";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await authClient.signUp.email({
      name: [fields.firstName, fields.middleName, fields.surname].filter(Boolean).join(" "),
      email: fields.email.trim(),
      password: fields.password,
    });
    if (result.error) {
      setErrors({ email: "We could not create the account. Check the details and try again." });
      return;
    }
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    notify.success("Account created", "Your secure session is active.");
    void navigate({ to: "/onboarding" });
  };

  const referrer = isValidInvitation(fields.invitationCode)
    ? referrerFor(fields.invitationCode)
    : null;

  return (
    <AuthShell
      eyebrow="Invitation required"
      title="Create your membership"
      description="Your details are reviewed once, then kept private to your account."
      footer={
        <>
          Already a member?{" "}
          <Link to="/auth" className="text-gold underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Card padding="lg">
        <form className="space-y-5" onSubmit={submit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Surname"
              value={fields.surname}
              onChange={(e) => set("surname", e.target.value)}
              {...(errors.surname ? { error: errors.surname } : {})}
            />
            <Input
              label="First name"
              value={fields.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              {...(errors.firstName ? { error: errors.firstName } : {})}
            />
          </div>

          <Input
            label="Middle name (optional)"
            value={fields.middleName}
            onChange={(e) => set("middleName", e.target.value)}
          />

          <Input
            label="Username"
            value={fields.username}
            onChange={(e) => set("username", e.target.value)}
            {...(errors.username ? { error: errors.username } : {})}
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            {...(errors.email ? { error: errors.email } : {})}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={fields.password}
              onChange={(e) => set("password", e.target.value)}
              {...(errors.password ? { error: errors.password } : {})}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={fields.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              {...(errors.confirm ? { error: errors.confirm } : {})}
            />
          </div>

          <div>
            <DateOfBirthPicker value={fields.dob} onChange={(iso) => set("dob", iso)} />
            {errors.dob ? <p className="mt-1.5 text-xs text-negative">{errors.dob}</p> : null}
          </div>

          <Input
            label="Invitation code"
            value={fields.invitationCode}
            onChange={(e) => set("invitationCode", e.target.value.toUpperCase())}
            placeholder="ID-2291-VELA"
            {...(errors.invitationCode ? { error: errors.invitationCode } : {})}
            {...(referrer ? { hint: `Referred by ${referrer}` } : {})}
          />

          <Button type="submit" full>
            Create membership
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
