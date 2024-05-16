import {z} from "zod";

export const signUpSchema: z.ZodObject<{}> = z.object({
  username: z.string()
  .min(3, "Username must contain at least 3 characters")
  .max(20, "Username must not contain more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain any special characters"),

  email: z.string()
  .email({message: "Invalid email address"}),

  password: z
  .string()
  .min(6, {message: "Password must contain at least 6 characters"})
  .max(8, {message: "Password must not exceed 8 characters"})
})
