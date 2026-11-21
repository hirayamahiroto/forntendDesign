import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { throwAppError } from "../../../errorMap";
import { getDeps } from "../../../infrastructure/container";
import { updateUserName } from "../../../usecases/users/updateUserName";

const bodySchema = z.object({ name: z.string() });

export default new Hono().patch(
  "/:userId/name",
  zValidator("json", bodySchema, (result) => {
    if (!result.success) throwAppError({ type: "InvalidRequest", message: "リクエストの形式が不正です" });
  }),
  async (c) => {
    const result = await updateUserName(getDeps(), {
      userId: c.req.param("userId"),
      name: c.req.valid("json").name,
    });
    if (!result.ok) return throwAppError(result.error);

    return c.body(null, 204);
  },
);
