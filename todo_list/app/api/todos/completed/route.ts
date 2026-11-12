import { clearCompleted } from "@/lib/repository";

// DELETE /api/todos/completed: remove every finished task.
export async function DELETE() {
  return Response.json({ todos: clearCompleted() });
}
