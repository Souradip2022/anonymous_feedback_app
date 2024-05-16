import {z, ZodObject} from "zod";

export const signInSchema:ZodObject<{}> = z.object({
  identifier: z.string(),
  password: z.string()
})