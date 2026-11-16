"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import type { ActionResult } from "@/types/action";
import FormField from "./FormField";
import FormMessage from "./FormMessage";
import SubmitButton from "./SubmitButton";

const INITIAL_STATE: ActionResult = { success: false };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, INITIAL_STATE);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <FormField
        id="name"
        label="Full name"
        autoComplete="name"
        errors={state.fieldErrors?.name}
      />
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
        autoComplete="new-password"
        errors={state.fieldErrors?.password}
      />
      <FormField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.confirmPassword}
      />
      <FormMessage message={state.error} />
      <SubmitButton label={pending ? "Creating account…" : "Create account"} pending={pending} />
    </form>
  );
}
