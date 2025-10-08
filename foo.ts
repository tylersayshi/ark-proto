// namespace app.bsky.actor.profile {
//   @rec("self")
//   model Main {
//     @maxLength(64)
//     @maxGraphemes(64)
//     displayName?: string;

//     @maxLength(256)
//     @maxGraphemes(256)
//     description?: string;
//   }
// }

const arkProfile = ns({
  id: "app.bsky.actor.profile",
  models: {
    main: {
      displayName: {
        type: "string?",
        maxLength: 64,
        graphemes: 64,
      },
      description: {
        type: "string?",
        maxLength: 64,
        graphemes: 64,
      },
    },
  },
});

const zodProfile = ns({
  id: "app.bsky.actor.profile",
  models: {
    main: {
      displayName: {
        type: z.string().optional(),
        maxLength: 64,
        graphemes: 64,
      },
      description: {
        type: z.string().optional(),
        maxLength: 64,
        graphemes: 64,
      },
    },
  },
});
