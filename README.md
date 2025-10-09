# typed-lexicon

this will be a toolkit for writing lexicon json schema's in typescript and providing types for lexicon data shape. it will:

- remove boilerplate and improve ergonomics
- type hint for [atproto type parameters](https://atproto.com/specs/lexicon#overview-of-types)
- infer the typescript type definitions for the data shape to avoid duplication and skew
- methods and a cli for generating json

**what you'd write:**

```typescript
const profileNamespace = lx.namespace("app.bsky.actor.profile", {
  main: lx.record({
    key: "self",
    record: lx.object({
      displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
      description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
    }),
  }),
});
```

**generates to:**

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.profile",
  "defs": {
    "main": {
      "type": "record",
      "key": "self",
      "record": {
        "type": "object",
        "properties": {
          "displayName": {
            "type": "string",
            "maxLength": 64,
            "maxGraphemes": 64
          },
          "description": {
            "type": "string",
            "maxLength": 256,
            "maxGraphemes": 256
          }
        }
      }
    }
  }
}
```
