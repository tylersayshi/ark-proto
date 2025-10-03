# ark-proto

an experiment for using arktype to author atproto schemas

[example.ts](./example.ts)

```bash
$ deno run example.ts
```

## **Social Media Post Record**

```typescript
const Post = type({
  text: "string",
  createdAt: "string",
});

const postSchema = arkproto.createRecord("app.bsky.feed.post", Post);
```

```json
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
        "required": ["createdAt", "text"]
      }
    }
  }
}
```

## **Like Record**

```typescript
const Like = type({
  subject: {
    uri: "string",
    cid: "string",
  },
  createdAt: "string",
});

const likeSchema = arkproto.createRecord("app.bsky.feed.like", Like);
```

```json
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
            "required": ["cid", "uri"]
          }
        },
        "required": ["createdAt", "subject"]
      }
    }
  }
}
```

## **Query - Get Feed Timeline**

```typescript
const GetFeedParams = type({
  limit: "number",
  cursor: "string",
});

const FeedItem = type({
  post: {
    uri: "string",
    cid: "string",
  },
});

const FeedResponse = type({
  cursor: "string",
  feed: FeedItem.array(),
});

const getFeedSchema = arkproto.createQuery("app.bsky.feed.gettimeline", {
  parameters: GetFeedParams,
  output: FeedResponse,
});
```

```json
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
        "required": ["cursor", "limit"]
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
                    "required": ["cid", "uri"]
                  }
                },
                "required": ["post"]
              }
            }
          },
          "required": ["cursor", "feed"]
        }
      }
    }
  }
}
```

## **Procedure - Create Post**

```typescript
const CreatePostInput = type({
  text: "string",
  createdAt: "string",
});

const CreatePostOutput = type({
  uri: "string",
  cid: "string",
});

const createPostSchema = arkproto.createProcedure("app.bsky.feed.createpost", {
  input: CreatePostInput,
  output: CreatePostOutput,
});
```

```json
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
          "required": ["createdAt", "text"]
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
          "required": ["cid", "uri"]
        }
      }
    }
  }
}
```

## Reflecting

- `createProcedure` and `createSchema` are a bit ugly like this, but i'm not sure how to improve them
- if there's value to having the type definition in typescript and/or validating that data fits a particular lexicon, this pattern would be very powerful
- the richness of arktype's autocomplete & validation on different data shapes could make this pattern quite powerful
