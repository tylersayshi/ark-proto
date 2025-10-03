# ark-proto

an experiment for using arktype to author atproto schemas

[example.ts](./example.ts)

```
$ deno run example.ts

=== Example 1: Social Media Post Record ===

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

=== Example 3: Query - Get Feed Timeline ===

{
  "lexicon": 1,
  "id": "app.bsky.feed.gettimeline",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "properties": {
          "cursor": {
            "type": "string"
          },
          "limit": {
            "type": "integer"
          }
        },
        "required": [
          "cursor",
          "limit"
        ]
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "properties": {
            "cursor": {
              "type": "string"
            },
            "feed": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "post": {
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
                  "post"
                ]
              }
            }
          },
          "required": [
            "cursor",
            "feed"
          ]
        }
      }
    }
  }
}

=== Example 4: Procedure - Create Post ===

{
  "lexicon": 1,
  "id": "app.bsky.feed.createpost",
  "defs": {
    "main": {
      "type": "procedure",
      "input": {
        "encoding": "application/json",
        "schema": {
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
      },
      "output": {
        "encoding": "application/json",
        "schema": {
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
      }
    }
  }
}
```
