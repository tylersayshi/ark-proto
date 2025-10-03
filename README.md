# ark-proto

an experiment for using arktype to author atproto schemas

example.ts

```ts
import { type } from "arktype";
import { LexiconConverter } from "./lib.ts";

// =============================================================================
// Example 1: Social Media Post Record
// =============================================================================
console.log("=== Example 1: Social Media Post ===\n");

const Post = type({
  text: "string",
  createdAt: "string",
});

const postSchema = LexiconConverter.createRecord("app.bsky.feed.post", Post);
console.log(JSON.stringify(postSchema, null, 2));

// =============================================================================
// Example 2: Like Record
// =============================================================================
console.log("\n=== Example 2: Like Record ===\n");

const Like = type({
  subject: {
    uri: "string",
    cid: "string",
  },
  createdAt: "string",
});

const likeSchema = LexiconConverter.createRecord("app.bsky.feed.like", Like);
console.log(JSON.stringify(likeSchema, null, 2));
```

```
$ deno run example.ts

=== Example 1: Social Media Post ===

{
  "lexicon": 1,
  "id": "app.bsky.feed.post",
  "defs": {
    "main": {
      "type": "record",
      "record": {
        "type": "object",
        "properties": {
          "createdAt": {
            "type": "string"
          },
          "text": {
            "type": "string"
          }
        },
        "required": [
          "createdAt",
          "text"
        ]
      }
    }
  }
}

=== Example 2: Like Record ===

{
  "lexicon": 1,
  "id": "app.bsky.feed.like",
  "defs": {
    "main": {
      "type": "record",
      "record": {
        "type": "object",
        "properties": {
          "createdAt": {
            "type": "string"
          },
          "subject": {
            "type": "object",
            "properties": {
              "cid": {
                "type": "string"
              },
              "uri": {
                "type": "string"
              }
            },
            "required": [
              "cid",
              "uri"
            ]
          }
        },
        "required": [
          "createdAt",
          "subject"
        ]
      }
    }
  }
}
```
