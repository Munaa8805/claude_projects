"use server";

import { z } from "zod";
import { registerSchema, signInSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/types/action";

// Accounts need Auth.js + Prisma (not set up yet). These actions validate input
// so the forms are ready to wire up, but they don't create sessions or users.
const AUTH_NOT_CONNECTED = "Accounts aren't available yet. Please check back soon.";

export async function signInAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const parsed = signInSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    return { success: false, error: AUTH_NOT_CONNECTED };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function registerAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const parsed = registerSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    return { success: false, error: AUTH_NOT_CONNECTED };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
