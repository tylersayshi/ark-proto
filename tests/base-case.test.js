"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var lib_ts_1 = require("../src/lib.ts");
(0, vitest_1.test)("app.bsky.actor.profile", function () {
    var profileNamespace = lib_ts_1.lx.namespace("app.bsky.actor.profile", {
        main: lib_ts_1.lx.record({
            key: "self",
            record: lib_ts_1.lx.object({
                displayName: lib_ts_1.lx.string({ maxLength: 64, maxGraphemes: 64 }),
                description: lib_ts_1.lx.string({ maxLength: 256, maxGraphemes: 256 }),
            }),
        }),
    });
    (0, vitest_1.expect)(profileNamespace.json).toEqual({
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
