// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedLiftsRouter } from "./lifts";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("lifts.", protectedLiftsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
