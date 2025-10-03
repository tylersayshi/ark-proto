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
