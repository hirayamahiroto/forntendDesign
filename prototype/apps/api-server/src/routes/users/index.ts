import { Hono } from "hono";
import getUser from "./getUser";
import updateUserName from "./updateUserName";

export default new Hono().route("/", getUser).route("/", updateUserName);
