import type { User } from "../../../domain/users/entities";
import type { IUserReader, IUserWriter } from "../../../domain/users/repositories";

export const createInMemoryUserRepository = (seed: readonly User[]): IUserReader & IUserWriter => {
  const users = new Map(seed.map((user) => [user.id, user]));

  return {
    findById: async (id) => users.get(id) ?? null,
    updateName: async (id, name) => {
      const current = users.get(id);
      if (current === undefined) return null;
      const updated = { ...current, name };
      users.set(id, updated);
      return updated;
    },
  };
};
