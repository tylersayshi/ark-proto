/**
 * Extracts the JSON representation from a type.
 * If the type has a `json` property, returns that property's type.
 * Otherwise, returns the type as-is.
 */
export type ExtractJson<T> = T extends { json: infer Json } ? Json : T;

export type InferType<T> = T extends { infer: infer Infer }
	? Infer
	: T extends { type: "array" }
		? InferArray<T>
		: T extends { type: "object" }
			? InferObject<T>
			: T extends { type: "unknown" }
				? unknown
				: T extends { type: "null" }
					? null
					: T extends { type: "boolean" }
						? boolean
						: T extends { type: "integer" }
							? number
							: T extends { type: "string" }
								? string
								: T extends { type: "bytes" }
									? Uint8Array
									: T extends { type: "cid-link" }
										? string
										: T extends { type: "blob" }
											? Blob
											: never;

type RequiredKeys<T> =
	T extends Record<string, unknown>
		? {
				[K in keyof T]: "_required" extends keyof T[K]
					? T[K]["_required"] extends true
						? K
						: false
					: never;
			}[keyof T]
		: never;
type NullableKeys<T> =
	T extends Record<string, unknown>
		? {
				[K in keyof T]: "_nullable" extends keyof T[K]
					? T[K]["_nullable"] extends true
						? K
						: never
					: never;
			}[keyof T]
		: never;

export type InferObject<
	T,
	Nullable extends string = NullableKeys<T> & string,
	Required extends string = RequiredKeys<T> & string,
	NullableAndRequired extends string = Required & Nullable & string,
	Normal extends string = Exclude<keyof T, Required | Nullable> & string,
> =
	T extends Record<string, { infer: unknown }>
		? {
				-readonly [K in Normal]?: T[K]["infer"];
			} & {
				-readonly [K in Exclude<
					Required,
					NullableAndRequired
				>]-?: T[K]["infer"];
			} & {
				-readonly [K in Exclude<Nullable, NullableAndRequired>]?:
					| T[K]["infer"]
					| null;
			} & {
				-readonly [K in NullableAndRequired]: T[K]["infer"] | null;
			}
		: never;

export type InferArray<T> = T extends { items: infer Items }
	? InferType<Items>[]
	: never[];

type InferUnion<T> = T extends { refs: readonly (infer R)[] }
	? R extends string
		? { $type: R; [key: string]: unknown }
		: never
	: never;

type InferRef<T> = T extends { ref: infer R }
	? R extends string
		? { $type: R; [key: string]: unknown }
		: unknown
	: unknown;

type InferParams<T> = T extends { properties: infer P }
	? InferObject<P>
	: never;

export type InferRecord<T extends { key: string; record: { infer: unknown } }> =
	InferType<T["record"]["infer"]>;

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type InferDefs<T extends Record<string, unknown>> = Prettify<{
	-readonly [K in keyof T]: InferType<T[K]>;
}>;
