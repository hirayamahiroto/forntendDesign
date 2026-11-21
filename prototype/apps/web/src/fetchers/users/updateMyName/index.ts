import type { InferRequestType } from "hono/client";
import { createBffClient } from "../../../utils/client";
import { type Result, ok, err } from "../../../utils/result";
import { type FetcherError, NETWORK_ERROR_MESSAGE, toFetcherError } from "../../shared/error";

type Endpoint = ReturnType<typeof createBffClient>["api"]["users"]["me"]["name"]["$patch"];

export type UpdateMyNameRequest = InferRequestType<Endpoint>["json"];

const FALLBACK_MESSAGE = "表示名の保存に失敗しました";

export const updateMyName = async (request: UpdateMyNameRequest): Promise<Result<null, FetcherError>> => {
  try {
    const res = await createBffClient().api.users.me.name.$patch({ json: request });
    if (!res.ok) return err(await toFetcherError(res, FALLBACK_MESSAGE));
    return ok(null);
  } catch {
    return err({ kind: "unexpected", message: NETWORK_ERROR_MESSAGE });
  }
};
