import type { ContentfulStatusCode } from "hono/utils/http-status";
import { type BffError, type UpstreamErrorBody, throwBffError } from "../../../../../errorMap";

const isUpstreamErrorBody = (body: unknown): body is UpstreamErrorBody =>
  typeof body === "object" &&
  body !== null &&
  "error" in body &&
  "code" in body &&
  typeof body.error === "string" &&
  typeof body.code === "string";

const classify = async (res: Response): Promise<BffError> => {
  if (res.status >= 500) return { type: "UpstreamServer", status: res.status };

  const body: unknown = await res.json().catch(() => null);
  if (!isUpstreamErrorBody(body)) {
    return { type: "UpstreamContractViolation", detail: `status ${res.status} without error code` };
  }
  return { type: "UpstreamRejected", status: res.status as ContentfulStatusCode, body };
};

export const throwUpstreamError = async (res: Response): Promise<never> => throwBffError(await classify(res));
