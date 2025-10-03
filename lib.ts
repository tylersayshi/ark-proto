import { Type } from "arktype";

// ATProto Lexicon schema types
export interface LexiconDoc {
  lexicon: 1;
  id: string; // NSID
  defs: Record<string, LexiconDef>;
}

export type LexiconDef =
  | LexiconRecord
  | LexiconQuery
  | LexiconProcedure
  | LexiconObject
  | LexiconArray
  | LexiconPrimitive
  | LexiconRef
  | LexiconUnion;

export interface LexiconRecord {
  type: "record";
  key?: string;
  record: LexiconObject;
}

export interface LexiconQuery {
  type: "query";
  parameters?: LexiconParams;
  output?: LexiconOutput;
}

export interface LexiconProcedure {
  type: "procedure";
  parameters?: LexiconParams;
  input?: LexiconInput;
  output?: LexiconOutput;
}

export interface LexiconParams {
  type: "params";
  properties: Record<string, LexiconType>;
  required?: string[];
}

export interface LexiconInput {
  encoding: string;
  schema?: LexiconType;
}

export interface LexiconOutput {
  encoding: string;
  schema?: LexiconType;
}

export interface LexiconObject {
  type: "object";
  properties: Record<string, LexiconType>;
  required?: string[];
}

export interface LexiconArray {
  type: "array";
  items: LexiconType;
  minLength?: number;
  maxLength?: number;
}

export interface LexiconPrimitive {
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

export interface LexiconRef {
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
export class LexiconConverter {
  /**
   * Convert an ArkType Type to a Lexicon type definition
   */
  static toLexiconType(arktypeType: Type): LexiconType {
    const json = arktypeType.json;
    return this.jsonToLexiconType(json);
  }

  private static jsonToLexiconType(json: any): LexiconType {
    // Handle string references to primitive types
    if (typeof json === "string") {
      if (json === "string") return { type: "string" };
      if (json === "number") return { type: "integer" };
      if (json === "boolean") return { type: "boolean" };
      if (json === "null") return { type: "null" };
      throw new Error(`Unsupported string reference: ${json}`);
    }

    // Handle primitives with domain
    if (json.domain === "string") {
      return { type: "string" };
    }
    if (json.domain === "number") {
      return { type: "integer" };
    }

    // Handle boolean (represented as union of true/false units)
    if (Array.isArray(json) && json.every((n: any) => "unit" in n && typeof n.unit === "boolean")) {
      return { type: "boolean" };
    }

    // Handle null
    if (json.unit === null) {
      return { type: "null" };
    }

    // Handle arrays (sequence with proto: "Array")
    if (json.sequence && json.proto === "Array") {
      return {
        type: "array",
        items: this.jsonToLexiconType(json.sequence),
      };
    }

    // Handle objects
    if (json.domain === "object") {
      const properties: Record<string, LexiconType> = {};
      const required: string[] = [];

      // Process required properties
      if (json.required) {
        for (const prop of json.required) {
          properties[prop.key] = this.jsonToLexiconType(prop.value);
          required.push(prop.key);
        }
      }

      // Process optional properties
      if (json.optional) {
        for (const prop of json.optional) {
          properties[prop.key] = this.jsonToLexiconType(prop.value);
        }
      }

      return {
        type: "object",
        properties,
        ...(required.length > 0 && { required }),
      };
    }

    // Handle unions (array of unit types)
    if (Array.isArray(json) && json.every((n: any) => "unit" in n)) {
      throw new Error(
        `Union types require named refs in Lexicon. Got union: ${json.map((n: any) => JSON.stringify(n.unit)).join(" | ")}`
      );
    }

    throw new Error(`Unsupported ArkType JSON structure: ${JSON.stringify(json)}`);
  }

  /**
   * Create a Lexicon record schema from an ArkType type
   */
  static createRecord(nsid: string, arktypeType: Type): LexiconDoc {
    this.validateNSID(nsid);

    const lexiconType = this.toLexiconType(arktypeType);

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
   * Create a Lexicon query schema from ArkType types
   */
  static createQuery(
    nsid: string,
    options?: {
      parameters?: Type;
      output?: Type;
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
   * Create a Lexicon procedure schema from ArkType types
   */
  static createProcedure(
    nsid: string,
    options?: {
      parameters?: Type;
      input?: Type;
      output?: Type;
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
