import { connection } from "next/server";
import { createTodo, listTodos } from "@/lib/repository";
import { badRequest, cleanTitle, isDueDate, isPriority, MAX_TITLE, readJson } from "@/lib/validation";

// GET /api/todos: every task in manual order.
export async function GET() {
  await connection(); // read from SQLite at request time, never prerender at build
  return Response.json({ todos: listTodos() });
}

// POST /api/todos  { title, dueDate?, priority? }: add a task to the top.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest("Body must be a JSON object.");

  const title = cleanTitle(body.title);
  const { dueDate = null, priority = "medium" } = body;
  if (title === null) return badRequest(`'title' must be 1–${MAX_TITLE} characters.`);
  if (!isDueDate(dueDate)) return badRequest("'dueDate' must be YYYY-MM-DD or null.");
  if (!isPriority(priority)) return badRequest("'priority' must be low, medium, or high.");

  return Response.json({ todos: createTodo({ title, dueDate, priority }) }, { status: 201 });
}
