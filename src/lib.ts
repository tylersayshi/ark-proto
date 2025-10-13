import type { InferNS, InferType, Prettify } from "./infer.ts";

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

/**
 * Common options available for lexicon items.
 * @see https://atproto.com/specs/lexicon#string-formats
 */
interface LexiconItemCommonOptions {
	/** Indicates this field must be provided */
	required?: boolean;
	/** Indicates this field can be explicitly set to null */
	nullable?: boolean;
}

/**
 * Definition in a lexicon namespace.
 * @see https://atproto.com/specs/lexicon#lexicon-document
 */
type Def = BaseLexiconItem;

/**
 * Lexicon namespace document structure.
 * @see https://atproto.com/specs/lexicon#lexicon-document
 */
interface LexiconNamespace {
	/** Namespaced identifier (NSID) for this lexicon */
	id: string;
	/** Named definitions within this namespace */
	defs: Record<string, Def>;
}

/**
 * String type options.
 * @see https://atproto.com/specs/lexicon#string
 */
interface StringOptions extends LexiconItemCommonOptions {
	/**
	 * Semantic string format constraint.
	 * @see https://atproto.com/specs/lexicon#string-formats
	 */
	format?:
		| "at-identifier" // Handle or DID
		| "at-uri" // AT Protocol URI
		| "cid" // Content Identifier
		| "datetime" // Timestamp (UTC, ISO 8601)
		| "did" // Decentralized Identifier
		| "handle" // User handle identifier
		| "nsid" // Namespaced Identifier
		| "tid" // Timestamp Identifier
		| "record-key" // Repository record key
		| "uri" // Generic URI
		| "language"; // IETF BCP 47 language tag
	/** Maximum string length in bytes */
	maxLength?: number;
	/** Minimum string length in bytes */
	minLength?: number;
	/** Maximum string length in Unicode graphemes */
	maxGraphemes?: number;
	/** Minimum string length in Unicode graphemes */
	minGraphemes?: number;
	/** Hints at expected values, not enforced */
	knownValues?: string[];
	/** Restricts to an exact set of string values */
	enum?: string[];
	/** Default value if not provided */
	default?: string;
	/** Fixed, unchangeable value */
	const?: string;
}

/**
 * Boolean type options.
 * @see https://atproto.com/specs/lexicon#boolean
 */
interface BooleanOptions extends LexiconItemCommonOptions {
	/** Default value if not provided */
	default?: boolean;
	/** Fixed, unchangeable value */
	const?: boolean;
}

/**
 * Integer type options.
 * @see https://atproto.com/specs/lexicon#integer
 */
interface IntegerOptions extends LexiconItemCommonOptions {
	/** Minimum allowed value (inclusive) */
	minimum?: number;
	/** Maximum allowed value (inclusive) */
	maximum?: number;
	/** Restricts to an exact set of integer values */
	enum?: number[];
	/** Default value if not provided */
	default?: number;
	/** Fixed, unchangeable value */
	const?: number;
}

/**
 * Bytes type options for arbitrary byte arrays.
 * @see https://atproto.com/specs/lexicon#bytes
 */
interface BytesOptions extends LexiconItemCommonOptions {
	/** Minimum byte array length */
	minLength?: number;
	/** Maximum byte array length */
	maxLength?: number;
}

/**
 * Blob type options for binary data with MIME types.
 * @see https://atproto.com/specs/lexicon#blob
 */
interface BlobOptions extends LexiconItemCommonOptions {
	/** Allowed MIME types (e.g., ["image/png", "image/jpeg"]) */
	accept?: string[];
	/** Maximum blob size in bytes */
	maxSize?: number;
}

/**
 * Array type options.
 * @see https://atproto.com/specs/lexicon#array
 */
interface ArrayOptions extends LexiconItemCommonOptions {
	/** Minimum array length */
	minLength?: number;
	/** Maximum array length */
	maxLength?: number;
}

/**
 * Record type options for repository records.
 * @see https://atproto.com/specs/lexicon#record
 */
interface RecordOptions {
	/** Record key strategy: "self" for self-describing or "tid" for timestamp IDs */
	key: "self" | "tid";
	/** Object schema defining the record structure */
	record: LxObject<ObjectProperties>;
	/** Human-readable description */
	description?: string;
}

/**
 * Union type options for multiple possible types.
 * @see https://atproto.com/specs/lexicon#union
 */
interface UnionOptions extends LexiconItemCommonOptions {
	/** If true, only listed refs are allowed; if false, additional types may be added */
	closed?: boolean;
}

/**
 * Map of property names to their lexicon item definitions.
 * @see https://atproto.com/specs/lexicon#object
 */
type ObjectProperties = Record<string, Def>;

/**
 * Resulting object schema with required and nullable fields extracted.
 * @see https://atproto.com/specs/lexicon#object
 */
interface ObjectResult<T extends ObjectProperties> {
	type: "object";
	/** Property definitions */
	properties: T;
	/** List of required property names */
	required?: string[];
	/** List of nullable property names */
	nullable?: string[];
}

/**
 * Map of parameter names to their lexicon item definitions.
 * @see https://atproto.com/specs/lexicon#params
 */
type ParamsProperties = Record<string, Def>;

/**
 * Resulting params schema with required fields extracted.
 * @see https://atproto.com/specs/lexicon#params
 */
interface ParamsResult<T extends ParamsProperties> {
	json: {
		type: "params";
		/** Parameter definitions */
		properties: T;
		/** List of required parameter names */
		required?: string[];
	};
	infer: InferType<T & { type: "params" }>;
}

/**
 * HTTP request or response body schema.
 * @see https://atproto.com/specs/lexicon#http-endpoints
 */
interface BodySchema {
	/** MIME type encoding (typically "application/json") */
	encoding: "application/json" | (string & {});
	/** Human-readable description */
	description?: string;
	/** Object schema defining the body structure */
	schema?: LxObject<ObjectProperties>;
}

/**
 * Error definition for HTTP endpoints.
 * @see https://atproto.com/specs/lexicon#http-endpoints
 */
interface ErrorDef {
	/** Error name/code */
	name: string;
	/** Human-readable error description */
	description?: string;
}

/**
 * Query endpoint options (HTTP GET).
 * @see https://atproto.com/specs/lexicon#query
 */
interface QueryOptions {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: LxParams<ParamsProperties>;
	/** Response body schema */
	output?: BodySchema;
	/** Possible error responses */
	errors?: ErrorDef[];
}

/**
 * Procedure endpoint options (HTTP POST).
 * @see https://atproto.com/specs/lexicon#procedure
 */
interface ProcedureOptions {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: LxParams<ParamsProperties>;
	/** Request body schema */
	input?: BodySchema;
	/** Response body schema */
	output?: BodySchema;
	/** Possible error responses */
	errors?: ErrorDef[];
}

/**
 * WebSocket message schema for subscriptions.
 * @see https://atproto.com/specs/lexicon#subscription
 */
interface MessageSchema {
	/** Human-readable description */
	description?: string;
	/** Union of possible message types */
	schema: LxUnion<readonly string[], UnionOptions>;
}

/**
 * Subscription endpoint options (WebSocket).
 * @see https://atproto.com/specs/lexicon#subscription
 */
interface SubscriptionOptions {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: LxParams<ParamsProperties>;
	/** Message schema for events */
	message?: MessageSchema;
	/** Possible error responses */
	errors?: ErrorDef[];
}

/**
 * Base class for all lexicon items with .json and .infer properties.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
abstract class BaseLexiconItem<Json = any> {
	abstract json: Json;

	get infer(): InferType<Json> {
		return {} as InferType<Json>;
	}
}

/**
 * Null type class.
 */
class LxNull extends BaseLexiconItem<
	{ type: "null" } & LexiconItemCommonOptions
> {
	public json: { type: "null" } & LexiconItemCommonOptions;

	constructor(options?: LexiconItemCommonOptions) {
		super();
		this.json = { type: "null", ...options };
	}
}

/**
 * Boolean type class.
 */
class LxBoolean<Options extends BooleanOptions> extends BaseLexiconItem<
	Options & { type: "boolean" }
> {
	public json: Options & { type: "boolean" };

	constructor(options?: Options) {
		super();
		this.json = { type: "boolean", ...options } as Options & {
			type: "boolean";
		};
	}
}

/**
 * Integer type class.
 */
class LxInteger<Options extends IntegerOptions> extends BaseLexiconItem<
	Options & { type: "integer" }
> {
	public json: Options & { type: "integer" };

	constructor(options?: Options) {
		super();
		this.json = { type: "integer", ...options } as Options & {
			type: "integer";
		};
	}

	get infer(): InferType<Options & { type: "integer" }> {
		return {} as InferType<Options & { type: "integer" }>;
	}
}

/**
 * String type class.
 */
class LxString<Options extends StringOptions> extends BaseLexiconItem<
	Options & { type: "string" }
> {
	public json: Options & { type: "string" };

	constructor(options?: Options) {
		super();
		this.json = { type: "string", ...options } as Options & { type: "string" };
	}
}

/**
 * Unknown type class.
 */
class LxUnknown extends BaseLexiconItem<
	{ type: "unknown" } & LexiconItemCommonOptions
> {
	public json: { type: "unknown" } & LexiconItemCommonOptions;

	constructor(options?: LexiconItemCommonOptions) {
		super();
		this.json = { type: "unknown", ...options };
	}
}

/**
 * Bytes type class.
 */
class LxBytes<Options extends BytesOptions> extends BaseLexiconItem<
	Options & { type: "bytes" }
> {
	public json: Options & { type: "bytes" };

	constructor(options?: Options) {
		super();
		this.json = { type: "bytes", ...options } as Options & { type: "bytes" };
	}
}

/**
 * CID Link type class.
 */
class LxCidLink<Link extends string> extends BaseLexiconItem<{
	type: "cid-link";
	$link: Link;
}> {
	public json: { type: "cid-link"; $link: Link };

	constructor(link: Link) {
		super();
		this.json = { type: "cid-link", $link: link };
	}
}

/**
 * Blob type class.
 */
class LxBlob<Options extends BlobOptions> extends BaseLexiconItem<
	Options & { type: "blob" }
> {
	public json: Options & { type: "blob" };

	constructor(options?: Options) {
		super();
		this.json = { type: "blob", ...options } as Options & { type: "blob" };
	}
}

/**
 * Array type class.
 */
class LxArray<
	Items extends Def["json"],
	Options extends ArrayOptions,
> extends BaseLexiconItem<Options & { type: "array"; items: Items }> {
	public json: Options & { type: "array"; items: Items };

	constructor(items: Def | Items, options?: Options) {
		super();
		// Serialize items using .json if available
		const serializedItems = (items as any)?.json ?? items;
		this.json = {
			type: "array",
			items: serializedItems,
			...options,
		} as Options & { type: "array"; items: Items };
	}
}

/**
 * Object type class.
 */
class LxObject<T extends ObjectProperties> extends BaseLexiconItem<
	ObjectResult<T>
> {
	public json: ObjectResult<T>;

	constructor(properties: T) {
		super();
		// Extract required and nullable fields
		const required = Object.keys(properties).filter((key) => {
			const value = properties[key] as any;
			return value?.json?.required ?? value?.required;
		});
		const nullable = Object.keys(properties).filter((key) => {
			const value = properties[key] as any;
			return value?.json?.nullable ?? value?.nullable;
		});

		// Serialize properties using .json if available
		const serializedProps = Object.fromEntries(
			Object.entries(properties).map(([key, value]) => [
				key,
				(value as any)?.json ?? value,
			]),
		) as T;

		const result: ObjectResult<T> = {
			type: "object",
			properties: serializedProps,
		};

		if (required.length > 0) {
			result.required = required;
		}
		if (nullable.length > 0) {
			result.nullable = nullable;
		}

		this.json = result;
	}
}

/**
 * Params type class.
 */
class LxParams<T extends ParamsProperties> extends BaseLexiconItem<
	ParamsResult<T>
> {
	public json: ParamsResult<T>;

	constructor(properties: T) {
		super();
		// Extract required fields
		const required = Object.keys(properties).filter((key) => {
			const value = properties[key] as any;
			return value?.json?.required ?? value?.required;
		});

		// Serialize properties using .json if available
		const serializedProps = Object.fromEntries(
			Object.entries(properties).map(([key, value]) => [
				key,
				(value as any)?.json ?? value,
			]),
		) as T;

		const result: ParamsResult<T> = {
			type: "params",
			properties: serializedProps,
		};

		if (required.length > 0) {
			result.required = required;
		}

		this.json = result;
	}

	get infer(): InferType<T & { type: "params" }> {
		return {} as InferType<T & { type: "params" }>;
	}
}

/**
 * Token type class.
 */
class LxToken<Description extends string> extends BaseLexiconItem<{
	type: "token";
	description: Description;
}> {
	public json: { type: "token"; description: Description };

	constructor(description: Description) {
		super();
		this.json = { type: "token", description };
	}
}

/**
 * Ref type class.
 */
class LxRef<Ref extends string> extends BaseLexiconItem<
	LexiconItemCommonOptions & { type: "ref"; ref: Ref }
> {
	public json: LexiconItemCommonOptions & { type: "ref"; ref: Ref };

	constructor(ref: Ref, options?: LexiconItemCommonOptions) {
		super();
		this.json = { type: "ref", ref, ...options };
	}
}

/**
 * Union type class.
 */
class LxUnion<
	Refs extends readonly string[],
	Options extends UnionOptions,
> extends BaseLexiconItem<Options & { type: "union"; refs: Refs }> {
	public json: Options & { type: "union"; refs: Refs };

	constructor(refs: Refs, options?: Options) {
		super();
		this.json = { type: "union", refs, ...options } as Options & {
			type: "union";
			refs: Refs;
		};
	}
}

/**
 * Record type class.
 */
class LxRecord<T extends RecordOptions> extends BaseLexiconItem<
	T & { type: "record" }
> {
	public json: T & { type: "record" };

	constructor(options: T) {
		super();
		// Serialize the record property if it's a class instance
		const serializedOptions = {
			...options,
			record: (options.record as any)?.json ?? options.record,
		} as T;
		this.json = { type: "record", ...serializedOptions };
	}
}

/**
 * Query type class.
 */
class LxQuery<T extends QueryOptions> extends BaseLexiconItem<
	T & { type: "query" }
> {
	public json: T & { type: "query" };

	constructor(options?: T) {
		super();
		// Serialize nested params and output if they have .json
		const serializedOptions = options
			? {
					...options,
					parameters: (options.parameters as any)?.json ?? options.parameters,
					output: options.output
						? {
								...options.output,
								schema:
									(options.output.schema as any)?.json ?? options.output.schema,
							}
						: undefined,
				}
			: {};
		this.json = { type: "query", ...serializedOptions } as T & {
			type: "query";
		};
	}
}

/**
 * Procedure type class.
 */
class LxProcedure<T extends ProcedureOptions> extends BaseLexiconItem<
	T & { type: "procedure" }
> {
	public json: T & { type: "procedure" };

	constructor(options?: T) {
		super();
		// Serialize nested params, input, and output if they have .json
		const serializedOptions = options
			? {
					...options,
					parameters: (options.parameters as any)?.json ?? options.parameters,
					input: options.input
						? {
								...options.input,
								schema:
									(options.input.schema as any)?.json ?? options.input.schema,
							}
						: undefined,
					output: options.output
						? {
								...options.output,
								schema:
									(options.output.schema as any)?.json ?? options.output.schema,
							}
						: undefined,
				}
			: {};
		this.json = {
			type: "procedure",
			...serializedOptions,
		} as T & { type: "procedure" };
	}
}

/**
 * Subscription type class.
 */
class LxSubscription<T extends SubscriptionOptions> extends BaseLexiconItem<
	T & { type: "subscription" }
> {
	public json: T & { type: "subscription" };

	constructor(options?: T) {
		super();
		// Serialize nested params and message if they have .json
		const serializedOptions = options
			? {
					...options,
					parameters: (options.parameters as any)?.json ?? options.parameters,
					message: options.message
						? {
								...options.message,
								schema:
									(options.message.schema as any)?.json ??
									options.message.schema,
							}
						: undefined,
				}
			: {};
		this.json = {
			type: "subscription",
			...serializedOptions,
		} as T & { type: "subscription" };
	}
}

class Namespace<ID extends string, D extends LexiconNamespace["defs"]> {
	public json: { lexicon: 1; id: ID; defs: D };
	constructor(
		public id: ID,
		public defs: D,
	) {
		// Serialize defs if they contain class instances
		const serializedDefs = Object.fromEntries(
			Object.entries(defs).map(([key, value]) => [
				key,
				(value as any)?.json ?? value,
			]),
		) as D;

		this.json = {
			lexicon: 1,
			id,
			defs: serializedDefs,
		};
	}

	get infer(): InferNS<typeof this> {
		// TODO this could return the runtime inferred type if we need it
		return {} as InferNS<typeof this>;
	}
}

/**
 * Main API for creating lexicon schemas.
 * @see https://atproto.com/specs/lexicon
 */
export const lx = {
	/**
	 * Creates a null type.
	 * @see https://atproto.com/specs/lexicon#null
	 */
	null(options?: LexiconItemCommonOptions): LxNull {
		return new LxNull(options);
	},
	/**
	 * Creates a boolean type with optional constraints.
	 * @see https://atproto.com/specs/lexicon#boolean
	 */
	boolean<T extends BooleanOptions>(options?: T): LxBoolean<T> {
		return new LxBoolean(options);
	},
	/**
	 * Creates an integer type with optional min/max and enum constraints.
	 * @see https://atproto.com/specs/lexicon#integer
	 */
	integer<T extends IntegerOptions>(options?: T): Prettify<LxInteger<T>> {
		return new LxInteger(options);
	},
	/**
	 * Creates a string type with optional format, length, and value constraints.
	 * @see https://atproto.com/specs/lexicon#string
	 */
	string<T extends StringOptions>(options?: T): Prettify<LxString<T>> {
		return new LxString(options);
	},
	/**
	 * Creates an unknown type for flexible, unvalidated objects.
	 * @see https://atproto.com/specs/lexicon#unknown
	 */
	unknown(options?: LexiconItemCommonOptions): LxUnknown {
		return new LxUnknown(options);
	},
	/**
	 * Creates a bytes type for arbitrary byte arrays.
	 * @see https://atproto.com/specs/lexicon#bytes
	 */
	bytes<T extends BytesOptions>(options?: T): LxBytes<T> {
		return new LxBytes(options);
	},
	/**
	 * Creates a CID link reference to content-addressed data.
	 * @see https://atproto.com/specs/lexicon#cid-link
	 */
	cidLink<Link extends string>(link: Link): LxCidLink<Link> {
		return new LxCidLink(link);
	},
	/**
	 * Creates a blob type for binary data with MIME type constraints.
	 * @see https://atproto.com/specs/lexicon#blob
	 */
	blob<T extends BlobOptions>(options?: T): LxBlob<T> {
		return new LxBlob(options);
	},
	/**
	 * Creates an array type with item schema and length constraints.
	 * @see https://atproto.com/specs/lexicon#array
	 */
	array<Items extends Def["json"], Options extends ArrayOptions>(
		items: Def | Items,
		options?: Options,
	): LxArray<Items, Options> {
		return new LxArray(items, options);
	},
	/**
	 * Creates a token type for symbolic values in unions.
	 * @see https://atproto.com/specs/lexicon#token
	 */
	token<Description extends string>(
		description: Description,
	): LxToken<Description> {
		return new LxToken(description);
	},
	/**
	 * Creates a reference to another schema definition.
	 * @see https://atproto.com/specs/lexicon#ref
	 */
	ref<Ref extends string>(
		ref: Ref,
		options?: LexiconItemCommonOptions,
	): LxRef<Ref> {
		return new LxRef(ref, options);
	},
	/**
	 * Creates a union type for multiple possible type variants.
	 * @see https://atproto.com/specs/lexicon#union
	 */
	union<const Refs extends readonly string[], Options extends UnionOptions>(
		refs: Refs,
		options?: Options,
	): LxUnion<Refs, Options> {
		return new LxUnion(refs, options);
	},
	/**
	 * Creates a record type for repository records.
	 * @see https://atproto.com/specs/lexicon#record
	 */
	record<T extends RecordOptions>(options: T): LxRecord<T> {
		return new LxRecord(options);
	},
	/**
	 * Creates an object type with defined properties.
	 * @see https://atproto.com/specs/lexicon#object
	 */
	object<T extends ObjectProperties>(properties: T): LxObject<T> {
		return new LxObject(properties);
	},
	/**
	 * Creates a params type for query string parameters.
	 * @see https://atproto.com/specs/lexicon#params
	 */
	params<Properties extends ParamsProperties>(
		properties: Properties,
	): Prettify<LxParams<Properties>> {
		return new LxParams(properties);
	},
	/**
	 * Creates a query endpoint definition (HTTP GET).
	 * @see https://atproto.com/specs/lexicon#query
	 */
	query<T extends QueryOptions>(options?: T): LxQuery<T> {
		return new LxQuery(options);
	},
	/**
	 * Creates a procedure endpoint definition (HTTP POST).
	 * @see https://atproto.com/specs/lexicon#procedure
	 */
	procedure<T extends ProcedureOptions>(options?: T): LxProcedure<T> {
		return new LxProcedure(options);
	},
	/**
	 * Creates a subscription endpoint definition (WebSocket).
	 * @see https://atproto.com/specs/lexicon#subscription
	 */
	subscription<T extends SubscriptionOptions>(options?: T): LxSubscription<T> {
		return new LxSubscription(options);
	},
	/**
	 * Creates a lexicon namespace document.
	 * @see https://atproto.com/specs/lexicon#lexicon-document
	 */
	namespace<ID extends string, D extends LexiconNamespace["defs"]>(
		id: ID,
		defs: D,
	) {
		return new Namespace(id, defs);
	},
};
