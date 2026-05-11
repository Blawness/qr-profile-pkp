import { describe, it, expect } from "vitest";

function buildScanUrl(params: {
  name: string;
  userId?: string | null;
}) {
  const encodedName = encodeURIComponent(params.name);
  const p = new URLSearchParams({ name: encodedName });
  if (params.userId) p.set("userId", params.userId);
  return `http://localhost:3000/scan?${p.toString()}`;
}

function parseScanParams(searchParams: URLSearchParams) {
  const userId = searchParams.get("userId") || null;
  const name = searchParams.get("name");

  if (!name) return { error: "Missing name" } as const;

  const decodedName = decodeURIComponent(name);

  return { userId, name: decodedName, hasAttendance: !!userId };
}

describe("Scan page — URL and param handling", () => {
  it("builds URL with userId and name", () => {
    const url = buildScanUrl({ name: "John Doe", userId: "uuid-123" });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("userId")).toBe("uuid-123");
    expect(parsed.searchParams.get("name")).toBe("John%20Doe");
  });

  it("builds URL without userId (profile-only)", () => {
    const url = buildScanUrl({ name: "Jane Doe" });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("userId")).toBeNull();
    expect(parsed.searchParams.get("name")).toBe("Jane%20Doe");
  });

  it("builds URL with null userId (profile-only)", () => {
    const url = buildScanUrl({ name: "Bob", userId: null });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("userId")).toBeNull();
    expect(parsed.searchParams.get("name")).toBe("Bob");
  });

  it("parses QR URL with userId — attendance enabled", () => {
    const url = new URL(
      "http://localhost:3000/scan?userId=uuid-456&name=John%20Doe"
    );
    const result = parseScanParams(url.searchParams);
    expect(result).toEqual({
      userId: "uuid-456",
      name: "John Doe",
      hasAttendance: true,
    });
  });

  it("parses QR URL without userId — attendance disabled", () => {
    const url = new URL("http://localhost:3000/scan?name=Jane%20Doe");
    const result = parseScanParams(url.searchParams);
    expect(result).toEqual({
      userId: null,
      name: "Jane Doe",
      hasAttendance: false,
    });
  });

  it("returns error when name is missing", () => {
    const url = new URL("http://localhost:3000/scan?userId=uuid");
    const result = parseScanParams(url.searchParams);
    expect(result).toEqual({ error: "Missing name" });
  });

  it("handles special characters in name", () => {
    const url = buildScanUrl({ name: "José María", userId: "u1" });
    const parsed = new URL(url);
    const result = parseScanParams(parsed.searchParams);
    expect(result.name).toBe("José María");
  });
});
