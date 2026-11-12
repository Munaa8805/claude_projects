import { reorderTodos, ReorderMismatchError } from "@/lib/repository";
import { badRequest, conflict, readJson } from "@/lib/validation";

// PUT /api/todos/reorder  { ids: number[] }: save the manual order (every id, once).
export async function PUT(request: Request) {
  const body = await readJson(request);
  const ids = body?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => Number.isInteger(id) && id > 0)) {
    return badRequest("'ids' must be an array of task ids.");
  }

  try {
    return Response.json({ todos: reorderTodos(ids as number[]) });
  } catch (err) {
    if (err instanceof ReorderMismatchError) return conflict(err.message);
    throw err;
  }
}
