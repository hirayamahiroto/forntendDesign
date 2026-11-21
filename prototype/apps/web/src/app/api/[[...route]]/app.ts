import { Hono } from "hono";
import { handleBffError } from "../../../errorMap";
import profile from "./profile";
import users from "./users";

const app = new Hono().basePath("/api").route("/profile", profile).route("/users", users).onError(handleBffError);

export type AppType = typeof app;

export default app;
