import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";
import mongoose from "mongoose";
import {User} from "next-auth";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";

export async function GET(request: Request): Promise<Response> {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const _user = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      new ApiResponseHandler(false, "User authentication error", {}),
      {status: 401}
    )
  }

  const userId = new mongoose.Types.ObjectId(_user._id);

  try {
    const user = await UserModel.aggregate([
      {$match: {_id: userId}},
      {$unwind: '$messages'},
      {$sort: {'messages.createdAt': -1}},
      {$group: {_id: '$_id', messages: {$push: '$messages'}}},
    ]).exec();

    if (!user || user.length === 0) {
      return Response.json(
        new ApiResponseHandler(false, "User not found", {}),
        {status: 404}
      )
    }

    return Response.json(
      new ApiResponseHandler(true, "", {messages: user[0].messages}),
      {status: 200}
    )
  } catch (error) {
    console.log("An unexpected error occurred");

    return Response.json(
      new ApiResponseHandler(false, "An unexpected error occurred", {error}),
      {status: 500}
    )
  }
}