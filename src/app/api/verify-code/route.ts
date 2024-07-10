import { VerifyCodeSchema } from "@/schema/VerifyCodeSchema";
import { dbConnect } from "@/lib/dbConnect";
import { UserModel } from "@/model/UserModel";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    console.table([username, code]);
    const codeReceived = {
      code
    };

    const result = VerifyCodeSchema.safeParse(codeReceived);
    console.log(result.error?.format());

    if (!result.success) {
      const error = result.error.format().code?._errors;
      return new Response(JSON.stringify({
        success: false,
        message: error
      }), { status: 400 });
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: "User not found"
      }), { status: 404 });
    }

    const isCodeValid = user.verifyCode === code;
    const codeNotExpired = user.verifyCodeExpiry && new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && codeNotExpired) {
      await UserModel.findByIdAndUpdate(user._id, { isVerified: true });

      return new Response(JSON.stringify({
        success: true,
        message: "User verified successfully"
      }), { status: 200 });
    } else if (!codeNotExpired) {
      return new Response(JSON.stringify({
        success: false,
        message: "Verification code expired. Try again"
      }), { status: 400 });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid verification code"
      }), { status: 400 });
    }

  } catch (error: any) {
    console.log("Failed to verify code ", error.message);
    return new Response(JSON.stringify({
      success: false,
      message: "Error verifying user"
    }), { status: 500 });
  }
}