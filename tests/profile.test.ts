import { assertEquals } from "@std/assert";
import { ns } from "../new-lib.ts";

Deno.test("app.bsky.actor.profile - creates correct lexicon schema", () => {
  const arkProfile = ns({
    id: "app.bsky.actor.profile",
    key: "self",
    models: {
      main: {
        displayName: {
          type: "string?",
          maxLength: 64,
          graphemes: 64,
        },
        description: {
          type: "string?",
          maxLength: 256,
          graphemes: 256,
        },
      },
    },
  });

  const expected = {
    lexicon: 1 as const,
    id: "app.bsky.actor.profile",
    defs: {
      main: {
        type: "record" as const,
        key: "self",
        record: {
          type: "object" as const,
          properties: {
            displayName: {
              type: "string" as const,
              maxLength: 64,
              maxGraphemes: 64,
            },
            description: {
              type: "string" as const,
              maxLength: 256,
              maxGraphemes: 256,
            },
          },
        },
      },
    },
  };

  assertEquals(arkProfile, expected);
});
