import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/UserModel";
import { ApiResponseHandler } from "@/utils/ApiResponseHandler";
import { MessageSchema } from "@/schema/MessageSchema";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const { username, content } = await request.json();
    console.table([ username, content]);

    // Validate content using Zod schema
    const verifyContent = { content };
    const result = MessageSchema.safeParse(verifyContent);

    if (!result.success) {
      const error = result.error.format().content?._errors;
      console.log("Validation error:", error);
      return new Response(
        JSON.stringify(new ApiResponseHandler(false, "Error parsing content", { error })),
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      console.log("User not found:", username);
      return new Response(
        JSON.stringify(new ApiResponseHandler(false, "User not found", {})),
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      console.log("User is not accepting messages:", username);
      return new Response(
        JSON.stringify(new ApiResponseHandler(false, "User is not accepting messages", {})),
        { status: 403 }
      );
    }

    // Create a new message using the MessageSchema
    const newMessage = { content, createdAt: new Date(Date.now()) };
    user.messages.push(newMessage);
    await user.save();

    console.log("Message saved successfully:", newMessage);
    return new Response(
      JSON.stringify(new ApiResponseHandler(true, "New message saved successfully", { newMessage })),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log("Unexpected error occurred:", error);
    return new Response(
      JSON.stringify(new ApiResponseHandler(false, "Internal server error", { error })),
      { status: 500 }
    );
  }
}
