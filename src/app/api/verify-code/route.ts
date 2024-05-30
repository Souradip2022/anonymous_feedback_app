import {VerifyCodeSchema} from "@/schema/VerifyCodeSchema";
import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";

export async function POST(request: Request): Promise<any> {
  await dbConnect();

  try {
    const {username, code} = await request.json();

    const codeReceived = {
      code
    }

    const result = VerifyCodeSchema.safeParse(codeReceived);
    console.log(result.error?.format());

    if (!result.success) {
      const error = result.error.format().code?._errors;
      return Response.json({
          success: false,
          message: error
        },
        {status: 400});
    }


    const user = await UserModel.findOne({username});

    if (!user) {
      return Response.json({
          success: false,
          message: "User not found"
        },
        {status: 404})
    }

    const isCodeValid = user.verifyCode === code;
    const codeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && codeNotExpired) {
      await UserModel.findByIdAndUpdate(user._id, {isVerified: true});

      return Response.json({
          success: true,
          message: "User verified successfully"
        },
        {status: 200})
    } else if (!codeNotExpired) {
      return Response.json({
          success: false,
          message: "Verification code expired. Try again"
        },
        {status: 400})
    } else {
      return Response.json({
          success: false,
          message: "Invalid verification code"
        },
        {status: 400}
      )
    }

  } catch (error: any) {
    console.log("Failed to verify code ", error.message);
    return Response.json(
      {
        success: false,
        message: "Error verifying user"
      },
      {status: 400}
    )
  }
}