import type { User } from "../entities";

export type IUserReader = {
  findById: (id: string) => Promise<User | null>;
};

export type IUserWriter = {
  updateName: (id: string, name: string) => Promise<User | null>;
};
