/** @see https://atproto.com/specs/lexicon#overview-of-types */
type LexiconType =
  // Concrete types
  | "null"
  | "boolean"
  | "integer"
  | "string"
  | "bytes"
  | "cid-link"
  | "blob"
  // Container types
  | "array"
  | "object"
  | "params"
  // Meta types
  | "token"
  | "ref"
  | "union"
  | "unknown"
  // Primary types
  | "record"
  | "query"
  | "procedure"
  | "subscription";

interface LexiconItemCommonOptions {
  required?: boolean;
  nullable?: boolean;
}

interface LexiconItem extends LexiconItemCommonOptions {
  type: LexiconType;
}

type Def = {
  type: LexiconType;
};

interface LexiconNamespace {
  id: string;
  defs: {
    [name: string]: Def;
  };
}

interface StringOptions extends LexiconItemCommonOptions {
  format?: string;
  maxLength?: number;
  minLength?: number;
  maxGraphemes?: number;
  minGraphemes?: number;
  knownValues?: string[];
  enum?: string[];
  default?: string;
  const?: string;
}

interface RecordOptions {
  key: "self" | "tid";
  record: { type: "object" };
}

interface ObjectProperties {
  [key: string]: LexiconItem;
}

interface ObjectResult<T extends ObjectProperties> {
  type: "object";
  properties: T;
  required?: string[];
  nullable?: string[];
}

/**
 * Main API: Create a namespace (lexicon document)
 */
export const lx = {
  string<T extends StringOptions>(options: T): T & { type: "string" } {
    return {
      type: "string",
      ...options,
    };
  },
  record<T extends RecordOptions>(options: T): T & { type: "record" } {
    return {
      type: "record",
      ...options,
    };
  },
  object<T extends ObjectProperties>(
    options: T
  ): {
    type: "object";
    properties: T;
    required?: string[];
    nullable?: string[];
  } {
    const required = Object.keys(options).filter(
      (key) => options[key].required
    );
    const nullable = Object.keys(options).filter(
      (key) => options[key].nullable
    );
    const result: ObjectResult<T> = {
      type: "object",
      properties: options,
    };
    if (required.length > 0) {
      result.required = required;
    }
    if (nullable.length > 0) {
      result.nullable = nullable;
    }
    return result;
  },
  namespace<T extends LexiconNamespace>(schema: T): T & { lexicon: 1 } {
    return {
      lexicon: 1,
      ...schema,
    };
  },
};
