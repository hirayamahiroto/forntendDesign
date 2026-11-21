import type { User } from "../../../domain/users/entities";
import { type UserError, createUserNotFoundError } from "../../../domain/users/errors";
import { validateUserName } from "../../../domain/users/policies";
import type { IUserWriter } from "../../../domain/users/repositories";
import { type Result, ok, err } from "../../../utils/result";

type Deps = { userWriter: IUserWriter };

export const updateUserName = async (
  deps: Deps,
  input: { userId: string; name: string },
): Promise<Result<User, UserError>> => {
  const name = validateUserName(input.name);
  if (!name.ok) return name;

  const updated = await deps.userWriter.updateName(input.userId, name.value);
  return updated === null ? err(createUserNotFoundError()) : ok(updated);
};
