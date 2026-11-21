import { Hono } from "hono";
import getProfileScreen from "./getProfileScreen";

export default new Hono().route("/", getProfileScreen);
