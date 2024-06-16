import {z, ZodObject} from "zod";

export const signInSchema: ZodObject<{}> = z.object({
  identifier: z.string().min(1, {message: "Username is required"}),
  password: z.string().min(1, {message: "password is required"})
});