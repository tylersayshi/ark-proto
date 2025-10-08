import { type } from "arktype";

/**
 * Namespace schema builder for ATProto Lexicon
 *
 * Converts a simple, declarative schema into ATProto Lexicon format.
 * Uses arktype for runtime validation of field types.
 */

// Field configuration
type FieldConfig = {
  type: string; // arktype syntax, e.g. "string?", "integer", "boolean"
  maxLength?: number;
  minLength?: number;
  graphemes?: number; // maps to maxGraphemes
  minGraphemes?: number;
  format?: string;
  minimum?: number;
  maximum?: number;
};

// Model is a collection of fields
type Model = Record<string, FieldConfig>;

// Schema input
type Schema = {
  id: string; // NSID
  key?: "self" | "tid"; // record key type
  models: {
    main: Model;
    [name: string]: Model;
  };
};

// Lexicon output types
type LexiconPrimitive = {
  type: "string" | "integer" | "boolean" | "bytes" | "cid-link" | "blob";
  maxLength?: number;
  minLength?: number;
  maxGraphemes?: number;
  minGraphemes?: number;
  format?: string;
  minimum?: number;
  maximum?: number;
};

type LexiconObject = {
  type: "object";
  properties: Record<string, LexiconPrimitive>;
  required?: string[];
};

type LexiconRecord = {
  type: "record";
  key?: string;
  record: LexiconObject;
};

type LexiconDoc = {
  lexicon: 1;
  id: string;
  defs: Record<string, LexiconRecord | LexiconObject>;
};

/**
 * Main API: Create a namespace (lexicon document)
 */
export function ns(schema: Schema): LexiconDoc {
  validateNSID(schema.id);

  const defs: Record<string, LexiconRecord | LexiconObject> = {};

  // Process main model as a record
  const mainModel = buildModel(schema.models.main);
  defs.main = {
    type: "record",
    ...(schema.key && { key: schema.key }),
    record: mainModel,
  };

  // Process other models as objects
  for (const [name, model] of Object.entries(schema.models)) {
    if (name !== "main") {
      defs[name] = buildModel(model);
    }
  }

  return {
    lexicon: 1,
    id: schema.id,
    defs,
  };
}

/**
 * Build a LexiconObject from a Model
 */
function buildModel(model: Model): LexiconObject {
  const properties: Record<string, LexiconPrimitive> = {};
  const required: string[] = [];

  for (const [fieldName, config] of Object.entries(model)) {
    // Parse type to check if optional
    const { baseType, isOptional } = parseType(config.type);

    // Create arktype validator
    type(config.type as never);

    // Build lexicon primitive
    const primitive = buildPrimitive(baseType, config);
    properties[fieldName] = primitive;

    // Track required fields
    if (!isOptional) {
      required.push(fieldName);
    }
  }

  const result: LexiconObject = { type: "object", properties };
  if (required.length > 0) {
    result.required = required;
  }

  return result;
}

/**
 * Parse arktype syntax to extract base type and optionality
 */
function parseType(typeStr: string): { baseType: string; isOptional: boolean } {
  const isOptional = typeStr.endsWith("?");
  const baseType = isOptional ? typeStr.slice(0, -1) : typeStr;
  return { baseType, isOptional };
}

/**
 * Build a Lexicon primitive from field config
 */
function buildPrimitive(
  baseType: string,
  config: FieldConfig
): LexiconPrimitive {
  const primitive: LexiconPrimitive = {
    type: baseType as LexiconPrimitive["type"],
  };

  // String constraints
  if (baseType === "string") {
    if (config.maxLength) primitive.maxLength = config.maxLength;
    if (config.minLength) primitive.minLength = config.minLength;
    if (config.graphemes) primitive.maxGraphemes = config.graphemes;
    if (config.minGraphemes) primitive.minGraphemes = config.minGraphemes;
    if (config.format) primitive.format = config.format;
  }

  // Numeric constraints
  if (baseType === "integer") {
    if (config.maximum) primitive.maximum = config.maximum;
    if (config.minimum) primitive.minimum = config.minimum;
  }

  return primitive;
}

/**
 * Validate NSID format (domain.name.method)
 */
function validateNSID(nsid: string): void {
  const parts = nsid.split(".");
  if (parts.length < 3) {
    throw new Error(
      `Invalid NSID: "${nsid}". Expected format: domain.name.method`
    );
  }

  if (!/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/.test(nsid)) {
    throw new Error(`Invalid NSID format: "${nsid}"`);
  }
}
