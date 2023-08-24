import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email can't be empty").optional(),
  password: z.string().min(1, "Password can't be empty").optional(),
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4, "Password must contain at least 4 characters"),
  firstName: z
    .string()
    .min(1, "First name must contain at least 1 character")
    .max(50, "First name must contain at most 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name must contain at least 1 character")
    .max(50, "Last name must contain at most 50 characters"),
});

export const membershipSchema = z.object({
  passcode: z.string(),
});

export const adminStatusSchema = z.object({
  passcode: z.string(),
});

export const newMessageSchema = z.object({
  title: z
    .string()
    .min(1, "Title must contain at least 1 character")
    .max(30, "Title must contain at most 30 characters"),
  text: z
    .string()
    .min(1, "Text must contain at least 1 character")
    .max(255, "Text must contain at most 255 characters"),
});
