import { describe, expect, it } from "vitest";
import { createInMemoryUserRepository } from "../../../infrastructure/repositories/inMemoryUserRepository";
import { updateUserName } from ".";

const seed = [{ id: "u_1", name: "before", email: "a@example.com", createdAt: new Date("2026-01-01") }];

describe("updateUserName", () => {
  it("前後の空白を除いた名前で更新する", async () => {
    const userWriter = createInMemoryUserRepository(seed);
    const result = await updateUserName({ userWriter }, { userId: "u_1", name: "  after  " });
    expect(result).toEqual({ ok: true, value: expect.objectContaining({ name: "after" }) });
  });

  it("空の名前は InvalidUserName を返し、保存しない", async () => {
    const repository = createInMemoryUserRepository(seed);
    const result = await updateUserName({ userWriter: repository }, { userId: "u_1", name: "   " });
    expect(result.ok ? null : result.error.type).toBe("InvalidUserName");
    expect((await repository.findById("u_1"))?.name).toBe("before");
  });

  it("存在しないユーザーは UserNotFound を返す", async () => {
    const userWriter = createInMemoryUserRepository(seed);
    const result = await updateUserName({ userWriter }, { userId: "missing", name: "x" });
    expect(result.ok ? null : result.error.type).toBe("UserNotFound");
  });
});
