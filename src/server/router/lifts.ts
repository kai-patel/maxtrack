import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const protectedLiftsRouter = createProtectedRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user.id,
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
  .query("getHistories", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          deadliftHistory: true,
          benchpressHistory: true,
          squatHistory: true,
          overheadHistory: true,
        },
      });
    },
  })
  .query("allDeadlift", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          deadliftHistory: true,
        },
      });
    },
  })
  .query("allBenchpress", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          benchpressHistory: true,
        },
      });
    },
  })
  .query("allSquat", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          squatHistory: true,
        },
      });
    },
  })
  .query("allOverhead", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          overheadHistory: true,
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
      const oldLifts = await ctx.prisma.maxLifts.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          deadlift: true,
          benchpress: true,
          squat: true,
          overhead: true,
        },
      });

      const newLifts = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          maxLifts: {
            upsert: {
              update: {
                deadlift: Math.max(input.deadlift, oldLifts?.deadlift || 0),
                benchpress: Math.max(
                  input.benchpress,
                  oldLifts?.benchpress || 0
                ),
                squat: Math.max(input.squat, oldLifts?.squat || 0),
                overhead: Math.max(input.overhead, oldLifts?.overhead || 0),
                deadliftHistory: {
                  push: input.deadlift,
                },
                benchpressHistory: {
                  push: input.benchpress,
                },
                squatHistory: {
                  push: input.squat,
                },
                overheadHistory: {
                  push: input.overhead,
                },
              },
              create: {
                ...input,
                deadliftHistory: input.deadlift,
                benchpressHistory: input.benchpress,
                squatHistory: input.squat,
                overheadHistory: input.overhead,
              },
            },
          },
        },
      });

      return newLifts;
    },
  })
  .mutation("removeLifts", {
    async resolve({ ctx }) {
      return await ctx.prisma.maxLifts.delete({
        where: {
          userId: ctx.session.user.id,
        },
      });
    },
  });
