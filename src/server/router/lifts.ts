import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const protectedLiftsRouter = createProtectedRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user?.id,
        },
        select: {
          deadlift: true,
          benchpress: true,
          squat: true,
          overhead: true,
        },
      });
    },
  })
  .mutation("addLifts", {
    input: z.object({
      deadlift: z.number().min(0),
      benchpress: z.number().min(0),
      squat: z.number().min(0),
      overhead: z.number().min(0),
    }),
    async resolve({ ctx, input }) {
      let sessionUser = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user?.id,
        },
        data: {
          maxLifts: {
            upsert: {
              update: {
                ...input,
              },
              create: {
                ...input,
              },
            },
          },
        },
      });

      return sessionUser;
    },
  });
