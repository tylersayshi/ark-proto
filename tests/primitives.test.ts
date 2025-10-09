import { assertEquals } from "@std/assert";
import { lx } from "../lib.ts";

Deno.test("lx.null()", () => {
  const result = lx.null();
  assertEquals(result, { type: "null" });
});

Deno.test("lx.boolean()", () => {
  const result = lx.boolean();
  assertEquals(result, { type: "boolean" });
});

Deno.test("lx.boolean() with default", () => {
  const result = lx.boolean({ default: true });
  assertEquals(result, { type: "boolean", default: true });
});

Deno.test("lx.boolean() with const", () => {
  const result = lx.boolean({ const: false });
  assertEquals(result, { type: "boolean", const: false });
});

Deno.test("lx.integer()", () => {
  const result = lx.integer();
  assertEquals(result, { type: "integer" });
});

Deno.test("lx.integer() with minimum", () => {
  const result = lx.integer({ minimum: 0 });
  assertEquals(result, { type: "integer", minimum: 0 });
});

Deno.test("lx.integer() with maximum", () => {
  const result = lx.integer({ maximum: 100 });
  assertEquals(result, { type: "integer", maximum: 100 });
});

Deno.test("lx.integer() with minimum and maximum", () => {
  const result = lx.integer({ minimum: 0, maximum: 100 });
  assertEquals(result, { type: "integer", minimum: 0, maximum: 100 });
});

Deno.test("lx.integer() with enum", () => {
  const result = lx.integer({ enum: [1, 2, 3, 5, 8, 13] });
  assertEquals(result, { type: "integer", enum: [1, 2, 3, 5, 8, 13] });
});

Deno.test("lx.integer() with default", () => {
  const result = lx.integer({ default: 42 });
  assertEquals(result, { type: "integer", default: 42 });
});

Deno.test("lx.integer() with const", () => {
  const result = lx.integer({ const: 7 });
  assertEquals(result, { type: "integer", const: 7 });
});

Deno.test("lx.string()", () => {
  const result = lx.string();
  assertEquals(result, { type: "string" });
});

Deno.test("lx.string() with maxLength", () => {
  const result = lx.string({ maxLength: 64 });
  assertEquals(result, { type: "string", maxLength: 64 });
});

Deno.test("lx.string() with enum", () => {
  const result = lx.string({ enum: ["light", "dark", "auto"] });
  assertEquals(result, { type: "string", enum: ["light", "dark", "auto"] });
});

Deno.test("lx.unknown()", () => {
  const result = lx.unknown();
  assertEquals(result, { type: "unknown" });
});
