import { Hono } from "hono";
import { throwAppError } from "../../../errorMap";
import { getDeps } from "../../../infrastructure/container";
import { getUser } from "../../../usecases/users/getUser";

export default new Hono().get("/:userId", async (c) => {
  const result = await getUser(getDeps(), { userId: c.req.param("userId") });
  if (!result.ok) return throwAppError(result.error);

  const { id, name, email, createdAt } = result.value;
  return c.json({ id, name, email, createdAt: createdAt.toISOString() }, 200);
});
