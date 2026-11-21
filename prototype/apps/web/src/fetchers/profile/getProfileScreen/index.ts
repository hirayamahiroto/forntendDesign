import type { InferResponseType } from "hono/client";
import { createBffServerClient } from "../../../utils/client/server";
import { type Result, ok, err } from "../../../utils/result";
import { type FetcherError, NETWORK_ERROR_MESSAGE, toFetcherError } from "../../shared/error";

type BffClient = Awaited<ReturnType<typeof createBffServerClient>>;

export type ProfileScreen = InferResponseType<BffClient["api"]["profile"]["$get"], 200>;

const FALLBACK_MESSAGE = "プロフィールの取得に失敗しました";

export const getProfileScreen = async (): Promise<Result<ProfileScreen, FetcherError>> => {
  try {
    const client = await createBffServerClient();
    const res = await client.api.profile.$get();
    if (!res.ok) return err(await toFetcherError(res, FALLBACK_MESSAGE));
    return ok(await res.json());
  } catch {
    return err({ kind: "unexpected", message: NETWORK_ERROR_MESSAGE });
  }
};
