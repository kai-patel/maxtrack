// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { protectedLiftsRouter } from "./lifts";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("lifts.", protectedLiftsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
