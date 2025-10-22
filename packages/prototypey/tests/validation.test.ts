import { describe, it, expect } from "vitest";
import { lx } from "../src/lib.ts";

describe("basic validation", () => {
	const schema = lx.lexicon("test.simple", {
		main: lx.object({
			id: lx.string({ required: true }),
			name: lx.string({ required: true }),
		}),
	});

	it("should validate valid data", () => {
		const result = schema.validate({ id: "123", name: "test" });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.value).toEqual({ id: "123", name: "test" });
		}
	});

	it("should reject missing required fields", () => {
		const result = schema.validate({ id: "123" });
		expect(result.success).toBe(false);
	});

	it("should reject invalid types", () => {
		const result = schema.validate({ id: 123, name: "test" });
		expect(result.success).toBe(false);
	});
});

describe("complex types", () => {
	const schema = lx.lexicon("test.complex", {
		user: lx.object({
			handle: lx.string({ required: true }),
			displayName: lx.string(),
		}),
		reply: lx.object({
			text: lx.string({ required: true }),
			author: lx.ref("#user", { required: true }),
		}),
		main: lx.record({
			key: "tid",
			record: lx.object({
				author: lx.ref("#user", { required: true }),
				replies: lx.array(lx.ref("#reply")),
				content: lx.string({ required: true }),
				createdAt: lx.string({ required: true, format: "datetime" }),
			}),
		}),
	});

	it("should validate complex nested objects", () => {
		const result = schema.validate({
			author: { handle: "alice.bsky.social", displayName: "Alice" },
			replies: [
				{
					text: "Great post!",
					author: { handle: "bob.bsky.social", displayName: "Bob" },
				},
			],
			content: "Hello world",
			createdAt: "2025-01-01T00:00:00Z",
		});
		expect(result.success).toBe(true);
	});

	it("should reject invalid nested objects", () => {
		const result = schema.validate({
			author: { displayName: "Alice" }, // missing required handle
			content: "Hello world",
			createdAt: "2025-01-01T00:00:00Z",
		});
		expect(result.success).toBe(false);
	});
});
