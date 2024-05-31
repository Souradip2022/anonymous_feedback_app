import {dbConnect} from "@/lib/dbConnect";
import {Message} from "@/model/UserModel";
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";
import {UserModel} from "@/model/UserModel";
import {MessageSchema} from "@/schema/MessageSchema";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const {username, content} = await request.json();

    const verifyContent = {
      content
    }

    const result = MessageSchema.safeParse(verifyContent);

    if(!result.success){
      const error = result.error.format().content?._errors;

    }

    const user = await UserModel.findOne({username});

    if (!user) {
      return Response.json(
        new ApiResponseHandler(false, "User not found", {}),
        {status: 404});
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        new ApiResponseHandler(false, "User is not accepting message", {}),
        {status: 403} //Forbidden status code
      );
    }

    const newMessage = {content, createdAt: new Date(Date.now())};
    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      new ApiResponseHandler(true, "New message saved successfully", {newMessage}),
      {status: 200}
    )

  } catch (error: unknown) {
    console.log("Unexpected error occurred ", error);
    return Response.json(
      new ApiResponseHandler(false, "Unexpected error occurred", {error}),
      {status: 500}
    )
  }
}


