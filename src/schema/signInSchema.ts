import {z, ZodObject} from "zod";

export const signInSchema:z.ZodObject<any> = z.object({
  identifier: z.string().min(1, {message: "Username or email is required"}),
  password: z.string().min(1, {message: "password is required"})
});