import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const studyRouter = createTRPCRouter({
  create: protectedProcedure // Só usuários logados podem criar
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        description: z.string().optional(),
        progress: z.number().min(0).max(100).default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.study.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  getAll: protectedProcedure.query(async({ ctx }) => {
    const study = await ctx.db.study.findMany({
      orderBy: { createdAt: "desc"},
      where: { userId: ctx.session.user.id}
    })

    return study ?? []
  }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const study = await ctx.db.study.findFirst({
      orderBy: { createdAt: "desc" },
      where: { userId: ctx.session.user.id },
    });

    return study ?? null;
  }),
});