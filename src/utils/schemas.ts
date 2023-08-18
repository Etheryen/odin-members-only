import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4, "Password must contain at least 4 characters"),
});

export const signUpSchema = loginSchema.extend({
  firstName: z.string().min(1, "First name must contain at least 1 character"),
  lastName: z.string().min(1, "Last name must contain at least 1 character"),
});
