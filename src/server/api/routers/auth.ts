import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { signUpSchema } from "~/utils/schemas";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (existingUser)
        throw new TRPCError({
          message: "Email already exists",
          code: "CONFLICT",
        });

      const hashedPassword = await hash(input.password, 12);

      const newUser = await ctx.prisma.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          password: hashedPassword,
        },
      });

      console.log({ newUser });

      return newUser;
    }),
});
