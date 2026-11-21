import type { User } from "../../../domain/users/entities";
import { type UserNotFoundError, createUserNotFoundError } from "../../../domain/users/errors";
import type { IUserReader } from "../../../domain/users/repositories";
import { type Result, ok, err } from "../../../utils/result";

type Deps = { userReader: IUserReader };

export const getUser = async (deps: Deps, input: { userId: string }): Promise<Result<User, UserNotFoundError>> => {
  const user = await deps.userReader.findById(input.userId);
  return user === null ? err(createUserNotFoundError()) : ok(user);
};
