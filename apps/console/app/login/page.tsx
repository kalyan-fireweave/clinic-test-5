"use client";

import { createAuthClient } from "better-auth/react";
import Link from "next/link";
import { useState } from "react";
import { fw } from "@fireweaveai/web-sdk/start";
import { Button } from "../../components/Button";
import { COPY } from "../../lib/copy";
import { ERROR_CODES } from "../../lib/errors";

const authClient = createAuthClient();

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const { data, error: signInError } = await authClient.signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (signInError) {
      setPending(false);
      setError(COPY.signInError);
      return;
    }
    if (data?.user?.id) {
      // Sign-in: register the user before the first audience-gated render. The
      // authenticated shell re-identifies with full properties on session restore.
      await fw.identify(data.user.id, { email: data.user.email });
    }
    window.location.href = "/inbox";
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        {error ? (
          <p className="banner error">
            {error}
            <span className="code">{ERROR_CODES.AUTH_FAILED}</span>
          </p>
        ) : null}
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Button variant="primary" type="submit" loading={pending}>
          Sign in
        </Button>
        <div className="switch">
          <span className="muted">New clinic?</span>
          <Link className="btn btn-ghost btn-md" href="/signup">
            Create a clinic
          </Link>
        </div>
      </form>
    </div>
  );
}
