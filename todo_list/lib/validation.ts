import { isIsoDate } from "./date";
import { PRIORITIES, type Priority } from "./types";

/** Small input checks shared by the API route handlers. */

export const MAX_TITLE = 200;

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function notFound(message: string) {
  return Response.json({ error: message }, { status: 404 });
}

export function conflict(message: string) {
  return Response.json({ error: message }, { status: 409 });
}

export function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Trimmed title, or null if empty or too long. */
export function cleanTitle(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim().replace(/\s+/g, " ");
  return t.length >= 1 && t.length <= MAX_TITLE ? t : null;
}

export const isPriority = (v: unknown): v is Priority =>
  typeof v === "string" && (PRIORITIES as readonly string[]).includes(v);

/** A due date is either null (none) or a real YYYY-MM-DD date. */
export const isDueDate = (v: unknown): v is string | null => v === null || isIsoDate(v);

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}
