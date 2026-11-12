import { connection } from "next/server";
import { listFoods } from "@/lib/repository";

// GET /api/foods: the full food list (searching happens on the client).
export async function GET() {
  await connection(); // read from SQLite at request time, never prerender at build
  return Response.json({ foods: listFoods() });
}
