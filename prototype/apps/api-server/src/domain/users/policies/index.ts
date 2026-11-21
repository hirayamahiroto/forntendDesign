import { type Result, ok, err } from "../../../utils/result";
import { type InvalidUserNameError, createInvalidUserNameError } from "../errors";

export const USER_NAME_MAX_LENGTH = 30;

export const validateUserName = (raw: string): Result<string, InvalidUserNameError> => {
  const name = raw.trim();
  if (name.length === 0) return err(createInvalidUserNameError("表示名を入力してください"));
  if (name.length > USER_NAME_MAX_LENGTH) {
    return err(createInvalidUserNameError(`表示名は${USER_NAME_MAX_LENGTH}文字以内で入力してください`));
  }
  return ok(name);
};
