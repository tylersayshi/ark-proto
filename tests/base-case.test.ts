import { assertEquals } from "@std/assert";
import { type } from "arktype";
import { arkproto } from "../lib.ts";

Deno.test("Social Media Post Record", () => {
  const Post = type({
    text: "string",
    createdAt: "string",
  });

  const postSchema = arkproto.createRecord("app.bsky.feed.post", Post);

  assertEquals(postSchema, {
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
  });
});

Deno.test("Like Record", () => {
  const Like = type({
    subject: {
      uri: "string",
      cid: "string",
    },
    createdAt: "string",
  });

  const likeSchema = arkproto.createRecord("app.bsky.feed.like", Like);

  assertEquals(likeSchema, {
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
  });
});

Deno.test("Query - Get Feed Timeline", () => {
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

  assertEquals(getFeedSchema, {
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
  });
});

Deno.test("Procedure - Create Post", () => {
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

  assertEquals(createPostSchema, {
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
  });
});
