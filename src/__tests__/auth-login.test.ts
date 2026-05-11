import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCookieSet = vi.fn();
const mockCookies = vi.fn().mockResolvedValue({
  set: mockCookieSet,
});

vi.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => {
      const response = new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { "content-type": "application/json" },
      });
      return response;
    },
  },
  NextRequest: class extends Request {
    constructor(input: string | URL, init?: RequestInit) {
      super(input, init);
    }
  },
}));

import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    mockCookieSet.mockClear();
    mockCookies.mockClear();
  });

  afterEach(() => {
    delete process.env.ADMIN_PASSWORD;
  });

  it("returns 200 and sets cookie on valid password", async () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "secret123" }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    expect(mockCookieSet).toHaveBeenCalledWith(
      "admin_token",
      "secret123",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24,
      })
    );
  });

  it("returns 401 on wrong password", async () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "wrong" }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Invalid password");
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it("returns 500 when ADMIN_PASSWORD is not configured", async () => {
    delete process.env.ADMIN_PASSWORD;
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "anything" }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toBe("Server not configured");
  });

  it("returns 400 on malformed JSON body", async () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Invalid request");
  });

  it("returns 401 on empty password", async () => {
    process.env.ADMIN_PASSWORD = "secret123";
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "" }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);
  });
});
