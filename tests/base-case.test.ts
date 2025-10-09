import { assertEquals } from "@std/assert";
import { lx } from "../lib.ts";

Deno.test("Bluesky Actor Profile", () => {
  const profileNamespace = lx.namespace({
    id: "app.bsky.actor.profile",
    defs: {
      main: lx.record({
        key: "self",
        record: lx.object({
          displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
          description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
        }),
      }),
    },
  });

  assertEquals(profileNamespace, {
    lexicon: 1,
    id: "app.bsky.actor.profile",
    defs: {
      main: {
        type: "record",
        key: "self",
        record: {
          type: "object",
          properties: {
            displayName: {
              type: "string",
              maxLength: 64,
              maxGraphemes: 64,
            },
            description: {
              type: "string",
              maxLength: 256,
              maxGraphemes: 256,
            },
          },
        },
      },
    },
  });
});
