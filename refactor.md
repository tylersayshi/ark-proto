# Implementation Plan: Class-Based Schema Builder

## Current State Analysis
- **Namespace class** (src/lib.ts:308-325): Already implemented with `.infer` and `.json` properties
- **lx methods**: Currently return plain objects (e.g., `{ type: "string", ...options }`)
- **InferNS type**: Working type inference system in src/infer.ts
- **Tests**: Comprehensive test coverage expects both runtime `.json` and type-level `.infer`

## Design Approach (Inspired by ArkType)

### 1. Base Class Architecture
Create a base `LexiconItem` class that all schema types inherit from:
- **Properties**: `.json` (runtime value), `.infer` (type-level phantom property)
- **Generic Structure**: `LexiconItem<Type, Json>` where Type is the lexicon type string and Json is the actual JSON shape
- **Minimal Redundancy**: Common logic lives in base class

### 2. Type-Specific Classes
Create classes for each lexicon type category:

**Primitive Types**:
- `LxNull`, `LxBoolean`, `LxInteger`, `LxString`, `LxBytes`, `LxBlob`, `LxUnknown`, `LxCidLink`

**Container Types**:
- `LxArray`, `LxObject`, `LxParams`

**Meta Types**:
- `LxToken`, `LxRef`, `LxUnion`

**Primary Types**:
- `LxRecord`, `LxQuery`, `LxProcedure`, `LxSubscription`

### 3. Inference Integration
- Each class will have a `.infer` getter that returns the proper inferred type using the existing `InferType` logic from src/infer.ts
- The inference will be compile-time only (phantom property, like Namespace)

### 4. Implementation Strategy

**Phase 1**: Create base class with shared logic
**Phase 2**: Migrate simple types (null, boolean, integer, string, etc.)
**Phase 3**: Migrate container types (array, object, params)
**Phase 4**: Migrate meta types (token, ref, union)
**Phase 5**: Migrate primary types (record, query, procedure, subscription)
**Phase 6**: Update all existing tests to use new API

### 5. Key Design Decisions

- **Factory Pattern**: Keep `lx.*` methods as factories that return class instances
- **JSON Property**: Each class stores the complete JSON representation
- **Type Safety**: Leverage TypeScript's type inference with generics
- **Backward Compatibility**: The `.json` property provides the same output as current plain objects
- **No Redundancy**: Constructor logic processes options once, stores in `.json`, inference is type-only

### 6. Example Structure
```typescript
class LxString<Options extends StringOptions> {
  public json: Options & { type: "string" };

  constructor(options?: Options) {
    this.json = { type: "string", ...options } as Options & { type: "string" };
  }

  get infer(): InferType<typeof this.json> {
    return {} as InferType<typeof this.json>;
  }
}
```

This approach minimizes redundancy by:
1. Single source of truth (`.json` property)
2. Type inference handled by existing `InferType` utilities
3. Common patterns abstracted to base class or utility functions

## Test Update Instructions

### Current Test Pattern (Before Refactor)
```typescript
test("lx.string() with maxLength", () => {
  const result = lx.string({ maxLength: 64 });
  expect(result).toEqual({ type: "string", maxLength: 64 });
});
```

### Updated Test Pattern (After Refactor)

#### Option 1: Test the `.json` property
```typescript
test("lx.string() with maxLength", () => {
  const result = lx.string({ maxLength: 64 });
  expect(result.json).toEqual({ type: "string", maxLength: 64 });
});
```

#### Option 2: Keep testing direct object (if we implement valueOf/toJSON)
```typescript
test("lx.string() with maxLength", () => {
  const result = lx.string({ maxLength: 64 });
  // If we implement toJSON(), this could still work:
  expect(result).toEqual({ type: "string", maxLength: 64 });
});
```

### Test Migration Strategy

**Step 1**: Update primitive tests (tests/primitives.test.ts)
- Add `.json` to all `expect(result)` → `expect(result.json)`
- ~100 test assertions to update

**Step 2**: Update namespace tests (tests/base-case.test.ts, tests/bsky-*.test.ts)
- For nested objects in namespaces, the existing tests already access `.json` on the namespace
- Example: `expect(profileNamespace.json).toEqual({...})` will still work
- The nested definitions will now be class instances, but their serialization in the namespace should handle this

**Step 3**: Update inference tests (tests/infer.test.ts)
- These tests already use `.infer` for the namespace
- Type inference tests should continue to work as-is
- Example: `attest(namespace.infer).type.toString.snap(...)` should work unchanged

**Step 4**: Add new test cases for class instances
```typescript
test("lx.string() returns class instance with .infer", () => {
  const result = lx.string({ maxLength: 64 });

  // Test runtime .json property
  expect(result.json).toEqual({ type: "string", maxLength: 64 });

  // Test type-level .infer property (compile-time only)
  type Inferred = typeof result.infer;
  const value: Inferred = "hello"; // should be string
  expect(typeof value).toBe("string");
});
```

### Handling Nested Structures

**Challenge**: When `lx.object()` or `lx.namespace()` receives class instances as properties

**Before**:
```typescript
const obj = lx.object({
  name: lx.string(), // returns { type: "string" }
});
// obj = { type: "object", properties: { name: { type: "string" } } }
```

**After**:
```typescript
const obj = lx.object({
  name: lx.string(), // returns LxString instance
});
// obj.json = { type: "object", properties: { name: { type: "string" } } }
```

**Solution**: The `lx.object()` and `lx.params()` functions need to serialize nested class instances:
```typescript
object<T extends ObjectProperties>(options: T): LxObject<T> {
  // Serialize properties to plain objects
  const serializedProps = Object.fromEntries(
    Object.entries(options).map(([key, value]) => [
      key,
      value?.json ?? value // Use .json if available, otherwise use value
    ])
  );

  // Extract required/nullable as before
  const required = Object.keys(options).filter(key => options[key].required);
  const nullable = Object.keys(options).filter(key => options[key].nullable);

  return new LxObject(serializedProps, required, nullable);
}
```

### Test File Breakdown

**tests/primitives.test.ts** (~90 tests):
- Simple find/replace: `expect(result)` → `expect(result.json)`

**tests/bsky-feed.test.ts**, **tests/bsky-actor.test.ts** (~50 tests):
- Most expect on plain `lx.object()` results
- Update to `expect(result.json)`
- Namespace tests like `expect(feedDefs.json)` should work unchanged

**tests/base-case.test.ts** (~2 tests):
- Already uses `.json` on namespace
- Should work unchanged

**tests/infer.test.ts** (~6 tests):
- Already uses `.infer` on namespace
- Should work unchanged or minimal changes

## Research Notes

### ArkType Pattern Analysis
- ArkType uses a flexible type parser with method attachments
- Core structure defined as extensible interface with generics
- Inference mechanism uses conditional types: `<const def, r = type.instantiate<def, $>>(def: type.validate<def, $>): r extends infer _ ? _ : never`
- Leverages TypeScript's advanced type system for minimal runtime overhead

### Current Implementation
- `Namespace` class sets the pattern: constructor stores data, `.json` provides runtime access, `.infer` is type-only
- Tests verify both runtime JSON structure and compile-time type inference
- All lx methods currently return plain objects with spread operators
- `InferType` utility in src/infer.ts handles all type-level inference logic
