import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";
import { throwBffError } from "../../../../../errorMap";

export const validateJson = <T extends ZodSchema>(schema: T) =>
  zValidator("json", schema, (result) => {
    if (!result.success) throwBffError({ type: "InvalidRequest", message: "入力内容を確認してください" });
  });
