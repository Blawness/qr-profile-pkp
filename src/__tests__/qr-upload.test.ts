import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the uploadToUploadThing function
const mockPrepareUpload = vi.fn();
const mockUploadToPresigned = vi.fn();

vi.mock("@/app/api/members/qr/route", async () => {
  const actual = await vi.importActual<typeof import("@/app/api/members/qr/route")>("@/app/api/members/qr/route");
  return actual;
});

// We mock the fetch calls used by the route
const originalFetch = globalThis.fetch;
const mockFetch = vi.fn();

beforeEach(() => {
  globalThis.fetch = mockFetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

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

import { POST } from "@/app/api/members/qr/route";

describe("POST /api/members/qr — raw UploadThing integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPLOADTHING_SECRET = "sk_test_123";
    process.env.UPLOADTHING_APP_ID = "testapp";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  it("uploads QR via UploadThing REST API and returns URL", async () => {
    mockFetch
      // First call: prepareUpload
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              key: "testapp/qr-uuid-test.png",
              url: "https://testapp.ufs.sh/f/qr-uuid-test",
              presignedUrl: "https://sin1.ingest.uploadthing.com/abc123",
            },
          ]),
          { status: 200 }
        )
      )
      // Second call: upload to presigned URL
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: 1 }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.qrCodeUrl).toContain("qr-uuid-test");

    // Verify prepareUpload was called
    const prepareCall = mockFetch.mock.calls[0];
    expect(prepareCall[0]).toBe("https://uploadthing.com/api/prepareUpload");
    expect(prepareCall[1]?.method).toBe("POST");
    expect(prepareCall[1]?.body).toContain("qr-uuid-test");
  });

  it("returns 400 when memberId is missing", async () => {
    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("memberId is required");
  });

  it("returns 400 on malformed JSON", async () => {
    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("Invalid request body");
  });

  it("returns 500 when prepareUpload fails", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401 })
    );

    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: 1 }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(500);
  });

  it("returns 500 when presigned URL upload fails", async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              key: "testapp/qr-test.png",
              url: "https://testapp.ufs.sh/f/qr-test",
              presignedUrl: "https://sin1.ingest.uploadthing.com/abc",
            },
          ]),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response("Error", { status: 500 })
      );

    const req = new Request("http://localhost/api/members/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: 1 }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(500);
  });
});
