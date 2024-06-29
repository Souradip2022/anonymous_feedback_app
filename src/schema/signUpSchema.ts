import {z} from "zod";

export const usernameValidation = z.string()
.min(3, "Username must contain at least 3 characters")
.max(20, "Username must not contain more than 20 characters")
.regex(/^[a-zA-Z0-9_]+$/, "Username must not contain any special characters");

export const signUpSchema = z.object({
  username: usernameValidation,

  email: z.string()
  .email({message: "Invalid email address"}),

  password: z
  .string()
  .min(6, {message: "Password must contain at least 6 characters"})
  .max(8, {message: "Password must not exceed 8 characters"})
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/, {message: "Password must contain at least 1 special character"})
  .regex(/[A-Z]+/, {message: "Password must contain at least 1 uppercase character"})
  .regex(/[a-z]+/, {message: "Password must contain at least 1 lowercase character"})
})
