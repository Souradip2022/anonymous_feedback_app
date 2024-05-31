import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";
import {getServerSession, Session} from "next-auth";
import {User} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {AcceptMessageSchema} from "@/schema/acceptMessageSchema";
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    const user = session?.user as User;
    if (!session || !session.user) {
      return Response.json(
        new ApiResponseHandler(false, "Not authenticated", {}),
        {status: 401}
      )
    }

    const {acceptingMessages} = await request.json();

    const verifyAcceptMessageType = {
      acceptingMessages
    }

    const result = AcceptMessageSchema.safeParse(verifyAcceptMessageType);
    if (!result.success) {
      const error = result.error.format()?.acceptMessage?._errors;

      return Response.json(new ApiResponseHandler(false, "There is an error", {error}),
        {status: 400})
    }

    const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
        isAcceptingMessage: acceptingMessages
      },
      {new: true}
    );

    if (!updatedUser) {
      Response.json(new ApiResponseHandler(false, "Unable to find and update user", {}),
        {status: 404})
    }

    return Response.json(
      new ApiResponseHandler(true, "Message accepting status updated successfully", {updatedUser}),
      {status: 200})
  } catch (error: any) {

    console.log("Failed to accept message ", error);
    return Response.json(new ApiResponseHandler(false, "Error updating message status", {}),
      {status: 500})
  }
}


export async function GET(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    const user = session?.user as User;

    if (!session || !session.user) {
      return Response.json(
        new ApiResponseHandler(false, "Not authenticated", {}),
        {status: 401}
      )
    }

    const foundUser = await UserModel.findById(user._id);
    if (!foundUser) {
      return Response.json(new ApiResponseHandler(false, "User not found", {}),
        {status: 404})
    } else {
      return Response.json(new ApiResponseHandler(true, "", {userAcceptingMessage: foundUser.isAcceptingMessage}),
        {status: 200})
    }

  } catch (error: any) {
    console.log("Error retrieving message accepting status ", error);

    return Response.json(new ApiResponseHandler(false, "Error retrieving message accepting status", {}),
      {status: 500})
  }
}