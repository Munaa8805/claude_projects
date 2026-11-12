import type { NextRequest } from "next/server";
import { deleteTodo, NotFoundError, updateTodo } from "@/lib/repository";
import type { TodoPatch } from "@/lib/types";
import { badRequest, cleanTitle, isDueDate, isPriority, MAX_TITLE, notFound, parseId, readJson } from "@/lib/validation";

// PATCH /api/todos/:id  { title?, done?, dueDate?, priority? }: change a task.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/todos/[id]">) {
  const id = parseId((await ctx.params).id);
  if (id === null) return badRequest("Task id must be a positive integer.");

  const body = await readJson(request);
  if (!body) return badRequest("Body must be a JSON object.");

  const patch: TodoPatch = {};
  if ("title" in body) {
    const title = cleanTitle(body.title);
    if (title === null) return badRequest(`'title' must be 1–${MAX_TITLE} characters.`);
    patch.title = title;
  }
  if ("done" in body) {
    if (typeof body.done !== "boolean") return badRequest("'done' must be true or false.");
    patch.done = body.done;
  }
  if ("dueDate" in body) {
    if (!isDueDate(body.dueDate)) return badRequest("'dueDate' must be YYYY-MM-DD or null.");
    patch.dueDate = body.dueDate;
  }
  if ("priority" in body) {
    if (!isPriority(body.priority)) return badRequest("'priority' must be low, medium, or high.");
    patch.priority = body.priority;
  }

  try {
    return Response.json({ todos: updateTodo(id, patch) });
  } catch (err) {
    if (err instanceof NotFoundError) return notFound(err.message);
    throw err;
  }
}

// DELETE /api/todos/:id: remove a task.
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/todos/[id]">) {
  const id = parseId((await ctx.params).id);
  if (id === null) return badRequest("Task id must be a positive integer.");

  try {
    return Response.json({ todos: deleteTodo(id) });
  } catch (err) {
    if (err instanceof NotFoundError) return notFound(err.message);
    throw err;
  }
}
