import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../../../app";
import { API_SERVER_BASE_URL, stubApiServer } from "../../../testDoubles/stubApiServer";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const patchMyName = (body: unknown) =>
  app.request("/api/users/me/name", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("PATCH /api/users/me/name", () => {
  it("me をセッションのユーザー ID に解決し、本文をそのまま api-server へ送る", async () => {
    const fetchMock = stubApiServer(() => new Response(null, { status: 204 }));

    const res = await patchMyName({ name: "new name" });

    expect(res.status).toBe(204);
    const sent = fetchMock.mock.calls[0];
    const request = new Request(sent![0], sent![1]);
    expect(request.method).toBe("PATCH");
    expect(request.url).toBe(`${API_SERVER_BASE_URL}/api/users/u_1/name`);
    expect(await request.json()).toEqual({ name: "new name" });
  });

  it("形式不正は api-server を呼ばずに 400 を返す", async () => {
    const fetchMock = stubApiServer(() => new Response(null, { status: 204 }));

    const res = await patchMyName({ name: 1 });

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ドメインの拒否（422）はそのまま透過する", async () => {
    stubApiServer(() =>
      Response.json({ error: "表示名を入力してください", code: "InvalidUserName" }, { status: 422 }),
    );

    const res = await patchMyName({ name: "" });

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "表示名を入力してください", code: "InvalidUserName" });
  });
});
