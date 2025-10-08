import type { StandardSchemaV1 } from "@standard-schema/spec";

// ATProto Lexicon schema types
interface LexiconDoc {
  lexicon: 1;
  id: string; // NSID
  defs: Record<string, LexiconDef>;
}

type LexiconDef =
  | LexiconRecord
  | LexiconQuery
  | LexiconProcedure
  | LexiconObject
  | LexiconArray
  | LexiconPrimitive
  | LexiconRef
  | LexiconUnion;

interface LexiconRecord {
  type: "record";
  key?: string;
  record: LexiconObject;
}

interface LexiconQuery {
  type: "query";
  parameters?: LexiconParams;
  output?: LexiconOutput;
}

interface LexiconProcedure {
  type: "procedure";
  parameters?: LexiconParams;
  input?: LexiconInput;
  output?: LexiconOutput;
}

interface LexiconParams {
  type: "params";
  properties: Record<string, LexiconType>;
  required?: string[];
}

interface LexiconInput {
  encoding: string;
  schema?: LexiconType;
}

interface LexiconOutput {
  encoding: string;
  schema?: LexiconType;
}

interface LexiconObject {
  type: "object";
  properties: Record<string, LexiconType>;
  required?: string[];
}

interface LexiconArray {
  type: "array";
  items: LexiconType;
  minLength?: number;
  maxLength?: number;
}

interface LexiconPrimitive {
  type:
    | "string"
    | "integer"
    | "boolean"
    | "null"
    | "bytes"
    | "cid-link"
    | "blob";
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}

interface LexiconRef {
  type: "ref";
  ref: string;
}

export interface LexiconUnion {
  type: "union";
  refs: string[];
}

export type LexiconType =
  | LexiconObject
  | LexiconArray
  | LexiconPrimitive
  | LexiconRef
  | LexiconUnion;

// Type mapping utilities
export class arkproto {
  /**
   * Convert a StandardSchema to a Lexicon type definition
   */
  static toLexiconType(schema: StandardSchemaV1): LexiconType {
    const standardSchema = schema["~standard"];
    if (!("toJSONSchema" in standardSchema)) {
      throw new Error(
        "standard-lexicon builds from the proposed toJSONSchema method of standard-schema"
      );
    }

    // Lol this part will get better when/if the standard adopts `toJSONSchema`

    const jsonSchema = // deno-lint-ignore no-explicit-any
      (standardSchema.toJSONSchema as (options: unknown) => any)({});
    return this.jsonSchemaToLexiconType(jsonSchema);
  }

  // deno-lint-ignore no-explicit-any
  private static jsonSchemaToLexiconType(json: any): LexiconType {
    // Handle primitives
    if (["string", "boolean", "null"].includes(json.type)) {
      return { type: json.type };
    }

    if (json.type === "number" || json.type === "integer") {
      return { type: "integer" };
    }

    // Handle arrays
    if (json.type === "array") {
      return {
        type: "array",
        items: this.jsonSchemaToLexiconType(json.items),
      };
    }

    // Handle objects
    if (json.type === "object") {
      const properties: Record<string, LexiconType> = {};

      if (json.properties) {
        for (const [key, value] of Object.entries(json.properties)) {
          properties[key] = this.jsonSchemaToLexiconType(value);
        }
      }

      const result: LexiconObject = { type: "object", properties };
      if (json.required?.length > 0) {
        result.required = json.required;
      }
      return result;
    }

    throw new Error(
      `Unsupported JSON Schema structure: ${JSON.stringify(json)}`
    );
  }

  /**
   * Create a Lexicon record schema from a StandardSchema
   */
  static createRecord(nsid: string, schema: StandardSchemaV1): LexiconDoc {
    this.validateNSID(nsid);

    const lexiconType = this.toLexiconType(schema);

    if (lexiconType.type !== "object") {
      throw new Error("Record schemas must be object types");
    }

    return {
      lexicon: 1,
      id: nsid,
      defs: {
        main: {
          type: "record",
          record: lexiconType,
        },
      },
    };
  }

  /**
   * Create a Lexicon query schema from StandardSchemas
   */
  static createQuery(
    nsid: string,
    options?: {
      parameters?: StandardSchemaV1;
      output?: StandardSchemaV1;
      encoding?: string;
    }
  ): LexiconDoc {
    this.validateNSID(nsid);

    const defs: Record<string, LexiconDef> = {
      main: {
        type: "query",
      } as LexiconQuery,
    };

    const mainDef = defs.main as LexiconQuery;

    if (options?.parameters) {
      const paramsType = this.toLexiconType(options.parameters);
      if (paramsType.type !== "object") {
        throw new Error("Query parameters must be an object type");
      }

      // Validate that all parameter properties are primitives
      this.validateQueryParams(paramsType);

      mainDef.parameters = {
        type: "params",
        properties: paramsType.properties,
        ...(paramsType.required && { required: paramsType.required }),
      };
    }

    if (options?.output) {
      mainDef.output = {
        encoding: options.encoding || "application/json",
        schema: this.toLexiconType(options.output),
      };
    }

    return {
      lexicon: 1,
      id: nsid,
      defs,
    };
  }

  /**
   * Create a Lexicon procedure schema from StandardSchemas
   */
  static createProcedure(
    nsid: string,
    options?: {
      parameters?: StandardSchemaV1;
      input?: StandardSchemaV1;
      output?: StandardSchemaV1;
      encoding?: string;
    }
  ): LexiconDoc {
    this.validateNSID(nsid);

    const defs: Record<string, LexiconDef> = {
      main: {
        type: "procedure",
      } as LexiconProcedure,
    };

    const mainDef = defs.main as LexiconProcedure;

    if (options?.parameters) {
      const paramsType = this.toLexiconType(options.parameters);
      if (paramsType.type !== "object") {
        throw new Error("Procedure parameters must be an object type");
      }

      // Validate that all parameter properties are primitives
      this.validateQueryParams(paramsType);

      mainDef.parameters = {
        type: "params",
        properties: paramsType.properties,
        ...(paramsType.required && { required: paramsType.required }),
      };
    }

    if (options?.input) {
      mainDef.input = {
        encoding: options.encoding || "application/json",
        schema: this.toLexiconType(options.input),
      };
    }

    if (options?.output) {
      mainDef.output = {
        encoding: options.encoding || "application/json",
        schema: this.toLexiconType(options.output),
      };
    }

    return {
      lexicon: 1,
      id: nsid,
      defs,
    };
  }

  /**
   * Validate that query/procedure parameters only contain primitive types
   */
  private static validateQueryParams(objType: LexiconObject): void {
    for (const [key, propType] of Object.entries(objType.properties)) {
      if (propType.type === "object" || propType.type === "array") {
        throw new Error(
          `Query/procedure parameter "${key}" must be a primitive type (boolean, integer, string). Got: ${propType.type}`
        );
      }
    }
  }

  private static validateNSID(nsid: string): void {
    // NSID format: domain.name.method
    const parts = nsid.split(".");
    if (parts.length < 3) {
      throw new Error(
        `Invalid NSID format. Expected "domain.name.method", got "${nsid}"`
      );
    }

    const nsidRegex = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;
    if (!nsidRegex.test(nsid)) {
      throw new Error(`Invalid NSID format. Must match pattern: ${nsidRegex}`);
    }
  }
}

// about the different primary types https://atproto.com/specs/lexicon#primary-type-definitions
