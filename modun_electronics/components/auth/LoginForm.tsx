"use client";

import { useActionState } from "react";
import { signInAction } from "@/actions/auth";
import type { ActionResult } from "@/types/action";
import FormField from "./FormField";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

const INITIAL_STATE: ActionResult = { success: false };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, INITIAL_STATE);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        errors={state.fieldErrors?.email}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        errors={state.fieldErrors?.password}
      />
      <FormMessage message={state.error} />
      <SubmitButton label={pending ? "Signing in…" : "Sign in"} pending={pending} />
    </form>
  );
}
