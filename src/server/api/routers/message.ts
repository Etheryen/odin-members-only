import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { newMessageSchema } from "~/utils/schemas";

export const messageRouter = createTRPCRouter({
  addMessage: protectedProcedure
    .input(newMessageSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.message.create({
        data: {
          title: input.title,
          text: input.text,
          authorId: ctx.session.user.id,
        },
      });

      return { status: "ok" };
    }),
  getAllForNonMembers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.message.findMany({
      select: {
        id: true,
        title: true,
        text: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  }),
  getAllForMembers: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.membershipStatus === "NOT_MEMBER")
      throw new TRPCError({ code: "UNAUTHORIZED" });

    return ctx.prisma.message.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.adminStatus === "NOT_ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.prisma.message.delete({ where: { id: input.id } });

      return { status: "ok" };
    }),
});
