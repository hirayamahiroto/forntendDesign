import { hc } from "hono/client";
import { headers } from "next/headers";
import type { AppType as BffAppType } from "../../../app/api/[[...route]]/app";
import { getAppBaseUrl } from "../../config";

export const createBffServerClient = async () => {
  const cookie = (await headers()).get("cookie");
  return hc<BffAppType>(getAppBaseUrl(), {
    headers: cookie === null ? undefined : { cookie },
  });
};
