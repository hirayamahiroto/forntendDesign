import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type BffError =
  | { readonly type: "InvalidRequest"; readonly message: string }
  | { readonly type: "UpstreamUnavailable"; readonly cause: unknown }
  | { readonly type: "UpstreamServer"; readonly status: number }
  | { readonly type: "UpstreamRejected"; readonly status: ContentfulStatusCode; readonly body: UpstreamErrorBody }
  | { readonly type: "UpstreamContractViolation"; readonly detail: string };

export type UpstreamErrorBody = {
  readonly error: string;
  readonly code: string;
};

class BffErrorException extends Error {
  constructor(readonly bffError: BffError) {
    super(bffError.type);
  }
}

export const throwBffError = (error: BffError): never => {
  throw new BffErrorException(error);
};

const BAD_GATEWAY = { error: "現在サービスに接続できません。時間をおいて再度お試しください", code: "BadGateway" };

const toResponse = (error: BffError, c: Context) => {
  switch (error.type) {
    case "InvalidRequest":
      return c.json({ error: error.message, code: error.type }, 400);
    case "UpstreamRejected":
      return c.json(error.body, error.status);
    case "UpstreamUnavailable":
    case "UpstreamServer":
      console.warn("[bff]", error);
      return c.json(BAD_GATEWAY, 502);
    case "UpstreamContractViolation":
      console.error("[bff]", error);
      return c.json(BAD_GATEWAY, 502);
  }
};

export const handleBffError = (error: Error, c: Context) => {
  if (error instanceof BffErrorException) return toResponse(error.bffError, c);
  console.error(error);
  return c.json({ error: "Internal Server Error", code: "Internal" }, 500);
};
