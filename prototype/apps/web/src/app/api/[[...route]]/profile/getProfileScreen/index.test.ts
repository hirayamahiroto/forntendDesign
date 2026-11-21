import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../../app";
import { stubApiServer, stubApiServerUnreachable } from "../../testDoubles/stubApiServer";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/profile", () => {
  it("api-server のユーザーから画面に必要な項目だけを返す", async () => {
    stubApiServer(() =>
      Response.json({ id: "u_1", name: "Hiroto", email: "demo@example.com", createdAt: "2026-01-01T00:00:00.000Z" }),
    );

    const res = await app.request("/api/profile");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ name: "Hiroto", email: "demo@example.com" });
  });

  it("api-server の 4xx はステータスとボディを透過する", async () => {
    stubApiServer(() => Response.json({ error: "ユーザーが見つかりません", code: "UserNotFound" }, { status: 404 }));

    const res = await app.request("/api/profile");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "ユーザーが見つかりません", code: "UserNotFound" });
  });

  it("code の無い 4xx は契約違反として 502 に畳む", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    stubApiServer(() => Response.json({ message: "?" }, { status: 404 }));

    const res = await app.request("/api/profile");

    expect(res.status).toBe(502);
  });

  it("api-server の 5xx と到達不能は 502 に畳む", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    stubApiServer(() => new Response("boom", { status: 500 }));
    expect((await app.request("/api/profile")).status).toBe(502);

    stubApiServerUnreachable();
    expect((await app.request("/api/profile")).status).toBe(502);
  });
});
