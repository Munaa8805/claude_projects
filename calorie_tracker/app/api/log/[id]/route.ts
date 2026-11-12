import type { NextRequest } from "next/server";
import { deleteEntry, NotFoundError, updateServings } from "@/lib/repository";
import { badRequest, isServings, notFound, parseId, readJson } from "@/lib/validation";

// PATCH /api/log/:id  { servings }: change how many servings an entry has.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/log/[id]">) {
  const id = parseId((await ctx.params).id);
  if (id === null) return badRequest("Entry id must be a positive integer.");

  const body = await readJson(request);
  if (!body || !isServings(body.servings)) return badRequest("'servings' must be a number between 0 and 50.");

  try {
    return Response.json({ entries: updateServings(id, body.servings) });
  } catch (err) {
    if (err instanceof NotFoundError) return notFound(err.message);
    throw err;
  }
}

// DELETE /api/log/:id: remove an entry from the log.
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/log/[id]">) {
  const id = parseId((await ctx.params).id);
  if (id === null) return badRequest("Entry id must be a positive integer.");

  try {
    return Response.json({ entries: deleteEntry(id) });
  } catch (err) {
    if (err instanceof NotFoundError) return notFound(err.message);
    throw err;
  }
}
