import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUploadFiles = vi.hoisted(() => vi.fn());

vi.mock("uploadthing/server", () => {
  class MockUTFile {
    name: string;
    type: string;
    size: number;
    private parts: Uint8Array[];

    constructor(parts: (string | Buffer | Uint8Array)[], name: string, options?: { type?: string }) {
      this.name = name;
      this.type = options?.type ?? "application/octet-stream";
      this.parts = parts.map(p => {
        if (typeof p === "string") return new TextEncoder().encode(p);
        if (Buffer.isBuffer(p)) return new Uint8Array(p);
        if (p instanceof Uint8Array) return p;
        return new Uint8Array();
      });
      this.size = this.parts.reduce((acc, p) => acc + p.length, 0);
    }
  }

  class MockUTApi {
    constructor(_opts?: Record<string, unknown>) {}
    uploadFiles = mockUploadFiles;
  }

  return { UTApi: MockUTApi, UTFile: MockUTFile };
});

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 1,
            userId: "uuid-test",
            name: "Test User",
            email: null,
            photoUrl: null,
            qrCodeUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }]),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { "content-type": "application/json" },
      }),
  },
  NextRequest: class extends Request {
    constructor(input: string | URL, init?: RequestInit) {
      super(input, init);
    }
  },
}));

import { POST } from "@/app/api/members/qr/route";

describe("POST /api/members/qr — UTApi + UTFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadFiles.mockReset();
    process.env.UPLOADTHING_TOKEN = "mock-token";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("generates QR and uploads via UTApi", async () => {
    mockUploadFiles.mockResolvedValueOnce({
      data: { url: "https://files.uploadthing.com/qr-uuid-test.png" },
      error: null,
    });

    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: 1 }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.qrCodeUrl).toBe("https://files.uploadthing.com/qr-uuid-test.png");
    expect(mockUploadFiles).toHaveBeenCalledTimes(1);

    // Verify UTFile construction
    const fileArg = mockUploadFiles.mock.calls[0][0];
    expect(fileArg.name).toBe("qr-uuid-test.png");
    expect(fileArg.type).toBe("image/png");
    expect(fileArg.size).toBeGreaterThan(0);
  });

  it("returns 400 when memberId is missing", async () => {
    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "memberId is required" });
  });

  it("returns 400 on malformed JSON", async () => {
    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid request body" });
  });

  it("returns 500 when upload returns error", async () => {
    mockUploadFiles.mockResolvedValueOnce({
      data: null,
      error: { code: "UPLOAD_FAILED", message: "Upload failed" },
    });

    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: 1 }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Failed to upload QR" });
  });

  it("returns 500 when upload throws exception", async () => {
    mockUploadFiles.mockRejectedValueOnce(new Error("Network error"));

    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: 1 }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Network error" });
  });

  it("falls back to member.id in filename when userId is null", async () => {
    const { db } = await import("@/db");
    const mockSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 42,
            userId: null,
            name: "No UUID",
            email: null,
            photoUrl: null,
            qrCodeUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }]),
        }),
      }),
    });
    // @ts-expect-error - mocking
    db.select = mockSelect;

    mockUploadFiles.mockResolvedValueOnce({
      data: { url: "https://files.uploadthing.com/qr-42.png" },
      error: null,
    });

    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: 42 }),
    });

    await POST(req as unknown as Parameters<typeof POST>[0]);

    const fileArg = mockUploadFiles.mock.calls[0][0];
    expect(fileArg.name).toBe("qr-42.png");
  });
});
