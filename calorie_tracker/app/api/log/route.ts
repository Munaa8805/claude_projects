import type { NextRequest } from "next/server";
import { isIsoDate } from "@/lib/date";
import { addEntry, listEntries, NotFoundError } from "@/lib/repository";
import { badRequest, isServings, notFound, readJson } from "@/lib/validation";

// GET /api/log?date=YYYY-MM-DD: entries logged on that day.
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!isIsoDate(date)) return badRequest("Query parameter 'date' must be YYYY-MM-DD.");
  return Response.json({ entries: listEntries(date) });
}

// POST /api/log  { date, foodId, servings? }: log a food (merges into an existing line).
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest("Body must be a JSON object.");

  const { date, foodId, servings = 1 } = body;
  if (!isIsoDate(date)) return badRequest("'date' must be YYYY-MM-DD.");
  if (!Number.isInteger(foodId)) return badRequest("'foodId' must be an integer.");
  if (!isServings(servings)) return badRequest("'servings' must be a number between 0 and 50.");

  try {
    return Response.json({ entries: addEntry(date, foodId as number, servings) }, { status: 201 });
  } catch (err) {
    if (err instanceof NotFoundError) return notFound(err.message);
    throw err;
  }
}
