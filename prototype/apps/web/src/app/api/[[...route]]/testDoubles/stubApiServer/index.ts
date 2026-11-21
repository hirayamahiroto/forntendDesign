import { vi } from "vitest";

export const API_SERVER_BASE_URL = "http://api-server.test";

export const stubApiServer = (respond: (request: Request) => Response | Promise<Response>) => {
  vi.stubEnv("API_SERVER_BASE_URL", API_SERVER_BASE_URL);
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => respond(new Request(input, init)));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

export const stubApiServerUnreachable = () => {
  vi.stubEnv("API_SERVER_BASE_URL", API_SERVER_BASE_URL);
  vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("fetch failed"))));
};
