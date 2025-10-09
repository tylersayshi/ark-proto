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

interface BooleanOptions extends LexiconItemCommonOptions {
  default?: boolean;
  const?: boolean;
}

interface IntegerOptions extends LexiconItemCommonOptions {
  minimum?: number;
  maximum?: number;
  enum?: number[];
  default?: number;
  const?: number;
}

interface BytesOptions extends LexiconItemCommonOptions {
  minLength?: number;
  maxLength?: number;
}

interface BlobOptions extends LexiconItemCommonOptions {
  accept?: string[];
  maxSize?: number;
}

interface ArrayOptions extends LexiconItemCommonOptions {
  minLength?: number;
  maxLength?: number;
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
  null(
    options?: LexiconItemCommonOptions
  ): { type: "null" } & LexiconItemCommonOptions {
    return {
      type: "null",
      ...options,
    };
  },
  boolean<T extends BooleanOptions>(options?: T): T & { type: "boolean" } {
    return {
      type: "boolean",
      ...options,
    } as T & { type: "boolean" };
  },
  integer<T extends IntegerOptions>(options?: T): T & { type: "integer" } {
    return {
      type: "integer",
      ...options,
    } as T & { type: "integer" };
  },
  string<T extends StringOptions>(options?: T): T & { type: "string" } {
    return {
      type: "string",
      ...options,
    } as T & { type: "string" };
  },
  unknown(
    options?: LexiconItemCommonOptions
  ): { type: "unknown" } & LexiconItemCommonOptions {
    return {
      type: "unknown",
      ...options,
    };
  },
  bytes<T extends BytesOptions>(options?: T): T & { type: "bytes" } {
    return {
      type: "bytes",
      ...options,
    } as T & { type: "bytes" };
  },
  blob<T extends BlobOptions>(options?: T): T & { type: "blob" } {
    return {
      type: "blob",
      ...options,
    } as T & { type: "blob" };
  },
  array<Items extends LexiconItem, Options extends ArrayOptions>(
    items: Items,
    options?: Options
  ): Options & { type: "array"; items: Items } {
    return {
      type: "array",
      items,
      ...options,
    } as Options & { type: "array"; items: Items };
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
  namespace<ID extends string, D extends LexiconNamespace["defs"]>(
    id: ID,
    defs: D
  ): { lexicon: 1; id: ID; defs: D } {
    return {
      lexicon: 1,
      id,
      defs,
    };
  },
};
