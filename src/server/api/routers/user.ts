import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  adminStatusSchema,
  membershipSchema,
  signUpSchema,
} from "~/utils/schemas";

export const userRouter = createTRPCRouter({
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
  becomeMember: protectedProcedure
    .input(membershipSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.passcode !== process.env.MEMBER_PASSCODE)
        throw new TRPCError({
          message: "Wrong passcode",
          code: "FORBIDDEN",
        });

      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          membershipStatus: "MEMBER",
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return updatedUserWithoutPassword;
    }),
  becomeAdmin: protectedProcedure
    .input(adminStatusSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.passcode !== process.env.ADMIN_PASSCODE)
        throw new TRPCError({
          message: "Wrong passcode",
          code: "FORBIDDEN",
        });

      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          membershipStatus: "MEMBER",
          adminStatus: "ADMIN",
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...updatedUserWithoutPassword } = updatedUser;

      return updatedUserWithoutPassword;
    }),
});
