import { Hono } from "hono";
import updateMyName from "./me/updateMyName";

export default new Hono().route("/", updateMyName);
