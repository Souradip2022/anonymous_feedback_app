import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";
import {z} from "zod";
import {usernameValidation} from "@/schema/signUpSchema";

const UserQuerySchema = z.object({
  username: usernameValidation
})

export async function GET(request: Request) {
  await dbConnect();

  try {
    const {searchParams} = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username")
    }

    const result = UserQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message: usernameErrors?.length > 0 ?
            usernameErrors.join(", ") :
            "Invalid query parameters"
        },
        {status: 400}
      )
    }

    const {username} = result.data;
  } catch (error) {

  }
}
