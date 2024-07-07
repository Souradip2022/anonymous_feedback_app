import {UserModel} from "@/model/UserModel";
import mongoose from "mongoose";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {User} from "next-auth";
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";
import {dbConnect} from "@/lib/dbConnect";

export async function POST(req: Request): Promise<Response> {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user = session?.user as User;

  if (!_user) {
    return Response.json(
      new ApiResponseHandler(false, "User not authenticated", {}),
      {status: 401}
    )
  }

  const userId = new mongoose.Types.ObjectId(_user._id);
  console.log(userId);

  try {
    const {content, createdAt} = await req.json();

    const user = await UserModel.findOne({_id: userId});

    if (!user) {
      return Response.json(
        new ApiResponseHandler(false, "User not found", {}),
        {status: 404}
      )
    }

    const updatedDocument = await UserModel.findByIdAndUpdate({
        _id: userId
      },
      {
        $pull: {
          messages: {content, createdAt}
        }
      },
      {new: true}
    );

    if (!updatedDocument) {
      return Response.json(
        new ApiResponseHandler(false, "Unable to delete message", {}),
        {status: 400}
      )
    }

    return Response.json(
      new ApiResponseHandler(true, "Message deleted successfully", {}),
      {status: 200}
    );

  } catch (error: unknown) {
    console.log("Internal server error", error);
    return Response.json(
      new ApiResponseHandler(false, "Internal server error", {error}),
      {status: 500}
    )
  }

}