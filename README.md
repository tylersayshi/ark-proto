# ark-proto

an experiment for using arktype to author atproto schemas

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
