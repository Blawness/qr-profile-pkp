import { describe, it, expect } from "vitest";
import { generateQRCode } from "@/lib/qr";

describe("generateQRCode", () => {
  it("generates a PNG buffer with both userId and name", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const buffer = await generateQRCode("user-abc", "John Doe");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // Check PNG magic bytes
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
  });

  it("generates a valid PNG buffer without userId (profile-only)", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const buffer = await generateQRCode(null, "Jane Doe");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
  });

  it("handles special characters in name", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const buffer = await generateQRCode("u1", "José & María");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("generates different QR codes for different inputs", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const buf1 = await generateQRCode("u1", "Alice");
    const buf2 = await generateQRCode("u2", "Bob");
    expect(buf1.equals(buf2)).toBe(false);
  });

  it("falls back to default URL when env var is unset", async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    const buffer = await generateQRCode("u1", "Test");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
