import { Hono } from "hono";
import { handleAppError } from "./errorMap";
import users from "./routes/users";

const app = new Hono().basePath("/api").route("/users", users).onError(handleAppError);

export type AppType = typeof app;

export default app;
