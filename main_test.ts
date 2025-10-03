import { assertEquals, assertThrows } from "@std/assert";
import { type } from "arktype";
import { LexiconConverter } from "./lib.ts";

Deno.test("converts string type to Lexicon string", () => {
  const StringType = type("string");
  const result = LexiconConverter.toLexiconType(StringType);
  assertEquals(result, { type: "string" });
});

Deno.test("converts number type to Lexicon integer", () => {
  const NumberType = type("number");
  const result = LexiconConverter.toLexiconType(NumberType);
  assertEquals(result, { type: "integer" });
});

Deno.test("converts boolean type to Lexicon boolean", () => {
  const BoolType = type("boolean");
  const result = LexiconConverter.toLexiconType(BoolType);
  assertEquals(result, { type: "boolean" });
});

Deno.test("converts array type to Lexicon array", () => {
  const ArrayType = type("string[]");
  const result = LexiconConverter.toLexiconType(ArrayType);
  assertEquals(result, {
    type: "array",
    items: { type: "string" },
  });
});

Deno.test("converts object type to Lexicon object with required fields", () => {
  const ObjectType = type({
    name: "string",
    age: "number",
  });
  const result = LexiconConverter.toLexiconType(ObjectType);
  assertEquals(result, {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "integer" },
    },
    required: ["name", "age"],
  });
});

Deno.test("handles optional fields in object type", () => {
  const ObjectType = type({
    name: "string",
    "age?": "number",
  });
  const result = LexiconConverter.toLexiconType(ObjectType);
  assertEquals(result, {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "integer" },
    },
    required: ["name"],
  });
});

Deno.test("creates valid Lexicon record schema", () => {
  const RecordType = type({
    subject: "string",
    createdAt: "string",
  });
  const result = LexiconConverter.createRecord(
    "com.example.post",
    RecordType,
  );

  assertEquals(result.lexicon, 1);
  assertEquals(result.id, "com.example.post");
  assertEquals(result.defs.main.type, "record");
  assertEquals(result.defs.main.record.type, "object");
});

Deno.test("creates valid Lexicon query schema with params and output", () => {
  const ParamsType = type({
    limit: "number",
  });
  const OutputType = type({
    items: "string[]",
  });

  const result = LexiconConverter.createQuery(
    "com.example.listPosts",
    ParamsType,
    OutputType,
  );

  assertEquals(result.lexicon, 1);
  assertEquals(result.id, "com.example.listPosts");
  assertEquals(result.defs.main.type, "query");
  assertEquals(result.defs.main.parameters?.type, "params");
  assertEquals(result.defs.main.output?.encoding, "application/json");
});

Deno.test("validates NSID format", () => {
  const ValidType = type({ name: "string" });

  assertThrows(
    () => LexiconConverter.createRecord("invalid", ValidType),
    Error,
    "Invalid NSID format",
  );

  assertThrows(
    () => LexiconConverter.createRecord("also.invalid", ValidType),
    Error,
    "Invalid NSID format",
  );

  // This should not throw
  LexiconConverter.createRecord("com.example.valid", ValidType);
});

Deno.test("throws error for union types without refs", () => {
  const UnionType = type('"active" | "inactive"');

  assertThrows(
    () => LexiconConverter.toLexiconType(UnionType),
    Error,
    "Union types require named refs",
  );
});

Deno.test("throws error for non-object record types", () => {
  const StringType = type("string");

  assertThrows(
    () => LexiconConverter.createRecord("com.example.test", StringType),
    Error,
    "Record schemas must be object types",
  );
});

Deno.test("complex nested object with arrays", () => {
  const ComplexType = type({
    name: "string",
    "tags?": "string[]",
    metadata: {
      created: "string",
      "updated?": "string",
    },
  });

  const result = LexiconConverter.toLexiconType(ComplexType);

  assertEquals(result.type, "object");
  assertEquals(result.properties.name, { type: "string" });
  assertEquals(result.properties.tags, {
    type: "array",
    items: { type: "string" },
  });
  assertEquals(result.properties.metadata.type, "object");
  assertEquals(result.required, ["name", "metadata"]);
});
