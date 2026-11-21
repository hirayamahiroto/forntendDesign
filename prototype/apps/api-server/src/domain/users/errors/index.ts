export type UserNotFoundError = {
  readonly type: "UserNotFound";
  readonly message: string;
};

export type InvalidUserNameError = {
  readonly type: "InvalidUserName";
  readonly message: string;
};

export type UserError = UserNotFoundError | InvalidUserNameError;

export const createUserNotFoundError = (): UserNotFoundError => ({
  type: "UserNotFound",
  message: "ユーザーが見つかりません",
});

export const createInvalidUserNameError = (message: string): InvalidUserNameError => ({
  type: "InvalidUserName",
  message,
});
