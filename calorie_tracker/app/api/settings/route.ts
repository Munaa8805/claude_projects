import { connection } from "next/server";
import { getSettings, setCalorieGoal } from "@/lib/repository";
import { badRequest, MAX_GOAL, MIN_GOAL, readJson } from "@/lib/validation";

// GET /api/settings: { calorieGoal }
export async function GET() {
  await connection(); // read from SQLite at request time, never prerender at build
  return Response.json(getSettings());
}

// PUT /api/settings  { calorieGoal }
export async function PUT(request: Request) {
  const body = await readJson(request);
  const goal = body?.calorieGoal;
  if (typeof goal !== "number" || !Number.isInteger(goal) || goal < MIN_GOAL || goal > MAX_GOAL) {
    return badRequest(`'calorieGoal' must be a whole number from ${MIN_GOAL} to ${MAX_GOAL}.`);
  }
  return Response.json(setCalorieGoal(goal));
}
