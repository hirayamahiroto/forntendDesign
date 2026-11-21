import { Hono } from "hono";
import { z } from "zod";
import { createApiServerClient } from "../../../../../../utils/client";
import { getDemoSession } from "../../../shared/session";
import { throwUpstreamError } from "../../../shared/toUpstreamError";
import { validateJson } from "../../../validators/validateJson";

const bodySchema = z.object({ name: z.string().max(100) });

export default new Hono().patch("/me/name", validateJson(bodySchema), async (c) => {
  const { userId } = getDemoSession();
  const res = await createApiServerClient().api.users[":userId"].name.$patch({
    param: { userId },
    json: c.req.valid("json"),
  });
  if (!res.ok) return throwUpstreamError(res);

  return c.body(null, 204);
});
