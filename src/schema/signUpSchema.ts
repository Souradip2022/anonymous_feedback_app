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
  .refine(value => {

    const specialCharRegex:RegExp = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
    if(!specialCharRegex.test(value)){
      throw new Error("Password must contain at least 1 special character");
    }

    const uppercaseRegex:RegExp = /[A-Z]+/;
    if(!uppercaseRegex.test(value)){
      throw new Error("Password must contain at least 1 uppercase character")
    }

    const lowercaseRegex:RegExp = /[a-z]+/;
    if(!lowercaseRegex) {
      throw new Error("Password must contain at least 1 lowercase character")
    }

    return true;
  }, {message: "Invalid password"})
})
