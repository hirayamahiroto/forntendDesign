import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { UserError } from "../domain/users/errors";

export type InvalidRequestError = {
  readonly type: "InvalidRequest";
  readonly message: string;
};

export type AppError = UserError | InvalidRequestError;

const STATUS_BY_TYPE = {
  InvalidRequest: 400,
  UserNotFound: 404,
  InvalidUserName: 422,
} as const satisfies Record<AppError["type"], ContentfulStatusCode>;

class AppErrorException extends Error {
  constructor(readonly appError: AppError) {
    super(appError.message);
  }
}

export const throwAppError = (error: AppError): never => {
  throw new AppErrorException(error);
};

export const handleAppError = (error: Error, c: Context) => {
  if (error instanceof AppErrorException) {
    const { type, message } = error.appError;
    return c.json({ error: message, code: type }, STATUS_BY_TYPE[type]);
  }
  console.error(error);
  return c.json({ error: "Internal Server Error" }, 500);
};
