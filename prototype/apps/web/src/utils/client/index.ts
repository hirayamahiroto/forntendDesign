import type { AppType as ApiServerAppType } from "@repo/api-server/client";
import { hc } from "hono/client";
import type { AppType as BffAppType } from "../../app/api/[[...route]]/app";
import { throwBffError } from "../../errorMap";
import { getApiServerBaseUrl } from "../config";

const upstreamFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (cause) {
    return throwBffError({ type: "UpstreamUnavailable", cause });
  }
};

export const createApiServerClient = () => hc<ApiServerAppType>(getApiServerBaseUrl(), { fetch: upstreamFetch });

export const createBffClient = () => hc<BffAppType>("/");
