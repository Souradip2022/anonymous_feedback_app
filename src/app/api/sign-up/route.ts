import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";
import {sendVerificationEmail} from "@/helper/sendVerificationEmail";
import bcrypt from "bcryptjs"
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();

  try {
    const {password, email, username} = await request.json();

    if (!password || !email || !username || [password, email, username].some(field => field.trim() === "")) {
      throw new Error("All fields required !!");
    }

    const existingUsername = await UserModel.findOne({
      username,
      isVerified: true
    })

    if (existingUsername) {
      return Response
      .json(
        new ApiResponseHandler(false, "Username already exists", {}),
        {status: 403}
      )
    }

    const existingUserByEmail = await UserModel.findOne({email});
    // console.log(existingUserByEmail);
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          new ApiResponseHandler(false, "User already exists with this mail", {}),
          {status: 403}
        )
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();

        return Response.json(
          new ApiResponseHandler(true, "User not verified", {}),
          {status: 200}
        );
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        password: hashedPassword,
        email,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: []
      });

      const emailResponse = await sendVerificationEmail(email, username, verifyCode);
      // console.log(emailResponse);

      if (!emailResponse.success) {
        return Response.json(
          new ApiResponseHandler(false, `${emailResponse.message}`, {}),
          {status: 500}
        )
      }

      await newUser.save();
    }

    return Response.json(
      new ApiResponseHandler(true, "User created", {}),
      {status: 201}
    );

  } catch (error) {
    console.log("Error registering user ", error);

    return Response.json(
      new ApiResponseHandler(false, `Error registering user`, {error}),
      {status: 500}
    )
  }
}