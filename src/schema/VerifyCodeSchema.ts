import {z} from "zod";

export const VerifyCodeSchema = z.object({
  code: z.string().length(6, "Verification must be of 6 digits"),
});
