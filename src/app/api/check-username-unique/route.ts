import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/UserModel";
import { z } from "zod";
import { usernameValidation } from "@/schema/signUpSchema";

const UserQuerySchema = z.object({
  username: usernameValidation
});

export async function GET(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username")
    }

    const result = UserQuerySchema.safeParse(queryParams);
    // console.log(result.error?.format());

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return new Response(
        JSON.stringify({
          success: false,
          message: usernameErrors.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters"
        }),
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true
    });

    if (existingVerifiedUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username already taken"
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Username is unique"
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username: ", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Error checking username"
      }),
      { status: 400 }
    );
  }
}
