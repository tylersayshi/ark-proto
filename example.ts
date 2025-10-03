import { type } from "arktype";
import { LexiconConverter } from "./lib.ts";

// =============================================================================
// Example 1: Social Media Post Record
// =============================================================================
console.log("=== Example 1: Social Media Post Record ===\n");

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

// =============================================================================
// Example 3: Query - Get Feed Timeline
// =============================================================================
console.log("\n=== Example 3: Query - Get Feed Timeline ===\n");

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

const getFeedSchema = LexiconConverter.createQuery(
  "app.bsky.feed.gettimeline",
  {
    parameters: GetFeedParams,
    output: FeedResponse,
  }
);
console.log(JSON.stringify(getFeedSchema, null, 2));

// =============================================================================
// Example 4: Procedure - Create Post
// =============================================================================
console.log("\n=== Example 4: Procedure - Create Post ===\n");

const CreatePostInput = type({
  text: "string",
  createdAt: "string",
});

const CreatePostOutput = type({
  uri: "string",
  cid: "string",
});

const createPostSchema = LexiconConverter.createProcedure(
  "app.bsky.feed.createpost",
  {
    input: CreatePostInput,
    output: CreatePostOutput,
  }
);
console.log(JSON.stringify(createPostSchema, null, 2));
