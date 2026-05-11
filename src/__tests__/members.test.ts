import { describe, it, expect } from "vitest";

function validateCreateBody(body: {
  userId?: string;
  name?: string;
  email?: string;
}) {
  if (!body.name) {
    return { error: "name is required", status: 400 };
  }

  const member = {
    userId: body.userId || null,
    name: body.name,
    email: body.email || null,
    photoUrl: null,
    qrCodeUrl: null,
  };

  return { member, status: 201 };
}

describe("Members API — create validation", () => {
  it("requires name to be present", () => {
    const result = validateCreateBody({ name: "" });
    expect(result.status).toBe(400);
    expect(result.error).toBe("name is required");
  });

  it("allows creating member without userId", () => {
    const result = validateCreateBody({ name: "Alice" });
    expect(result.status).toBe(201);
    expect(result.member).toEqual({
      userId: null,
      name: "Alice",
      email: null,
      photoUrl: null,
      qrCodeUrl: null,
    });
  });

  it("sets userId to null when empty string is provided", () => {
    const result = validateCreateBody({ name: "Bob", userId: "" });
    expect(result.status).toBe(201);
    expect(result.member?.userId).toBeNull();
    expect(result.member?.name).toBe("Bob");
  });

  it("preserves userId when provided", () => {
    const result = validateCreateBody({
      name: "Charlie",
      userId: "uuid-123",
    });
    expect(result.status).toBe(201);
    expect(result.member?.userId).toBe("uuid-123");
    expect(result.member?.name).toBe("Charlie");
  });

  it("preserves email when provided", () => {
    const result = validateCreateBody({
      name: "Diana",
      email: "diana@example.com",
    });
    expect(result.status).toBe(201);
    expect(result.member?.email).toBe("diana@example.com");
  });

  it("sets email to null when empty string provided", () => {
    const result = validateCreateBody({ name: "Eve", email: "" });
    expect(result.status).toBe(201);
    expect(result.member?.email).toBeNull();
  });
});
