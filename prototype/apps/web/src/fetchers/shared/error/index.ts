export type FetcherError = {
  readonly kind: "rejected" | "unexpected";
  readonly message: string;
};

export const NETWORK_ERROR_MESSAGE = "通信に失敗しました。接続を確認して再度お試しください";

const REJECTED_STATUSES = new Set([400, 404, 409, 422]);

const readErrorMessage = async (res: Response): Promise<string | null> => {
  const body: unknown = await res.json().catch(() => null);
  if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
    return body.error;
  }
  return null;
};

export const toFetcherError = async (res: Response, fallbackMessage: string): Promise<FetcherError> => {
  if (!REJECTED_STATUSES.has(res.status)) return { kind: "unexpected", message: fallbackMessage };
  const message = await readErrorMessage(res);
  return message === null ? { kind: "unexpected", message: fallbackMessage } : { kind: "rejected", message };
};
