import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";
import {getServerSession, Session} from "next-auth";
import {User} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {AcceptMessageSchema} from "@/schema/acceptMessageSchema";

async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    const user = session?.user as User;
    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated"
        },
        {status: 401}
      )
    }

    const {acceptingMessages} = await request.json();

    const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
        isAcceptingMessage: acceptingMessages
      },
      {new: true}
    );

    if (!updatedUser) {
      Response.json({
          success: false,
          message: "Unable to find and update user"
        },
        {status: 401})
    }

    return Response.json({
        success: true,
        message: "Message accepting status updated successfully",
        updatedUser
      },
      {status: 200})
  } catch (error: any) {
    console.log("Failed to accept message ", error);
    return Response.json({
        success: false,
        message: "Error updating message status"
      },
      {status: 500})
  }
}


async function GET(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    const user = session?.user as User;

    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "User not authenticated"
        },
        {status: 401}
      )
    }

    const foundUser = await UserModel.findById(user._id);
    if (!foundUser) {
      return Response.json({
          success: false,
          message: "User not found"
        },
        {status: 404})
    } else {
      return Response.json({
        success: true,
        userAcceptingMessage: foundUser.isAcceptingMessage
      })
    }

  } catch (error: any) {
    console.log("Error retrieving message accepting status ", error);

    return Response.json({
        success: false,
        message: "Error retrieving message accepting status"
      },
      {status: 500})
  }
}