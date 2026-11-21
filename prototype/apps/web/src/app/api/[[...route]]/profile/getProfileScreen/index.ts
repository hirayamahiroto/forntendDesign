import { Hono } from "hono";
import { createApiServerClient } from "../../../../../utils/client";
import { getDemoSession } from "../../shared/session";
import { throwUpstreamError } from "../../shared/toUpstreamError";

export default new Hono().get("/", async (c) => {
  const { userId } = getDemoSession();
  const res = await createApiServerClient().api.users[":userId"].$get({ param: { userId } });
  if (!res.ok) return throwUpstreamError(res);

  const user = await res.json();
  return c.json({ name: user.name, email: user.email }, 200);
});
