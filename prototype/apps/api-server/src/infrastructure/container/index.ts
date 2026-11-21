import { createInMemoryUserRepository } from "../repositories/inMemoryUserRepository";

const userRepository = createInMemoryUserRepository([
  { id: "u_1", name: "Hiroto", email: "demo@example.com", createdAt: new Date("2026-01-01T00:00:00Z") },
]);

export const getDeps = () => ({
  userReader: userRepository,
  userWriter: userRepository,
});
