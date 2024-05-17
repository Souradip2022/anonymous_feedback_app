import {dbConnect} from "@/lib/dbConnect";
import {User} from "@/model/User";
import {sendVerificationEmail} from "@/helper/sendVerificationEmail";
import bcrypt from "bcryptjs"
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const {password, email, username} = await request.json();

    if (!password || !email || !username || [password, email, username].some(field => field.trim() === "")) {
      throw new Error("All fields required !!");
    }

    const existingUsername = await User.findOne({
      username,
      isVerified: true
    })

    if (existingUsername) {
      return Response
      .json(
        new ApiResponseHandler(401, {}, "Username already exists")
      )
    }

    const existingUserByEmail = await User.findOne({email});
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          new ApiResponseHandler(400, {}, "User already exists with this mail")
        )
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new User({
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: []
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(email, username, verifyCode);

    if (!emailResponse.success) {
      return Response.json(
        new ApiResponseHandler(500, {}, `Sending email failed ${emailResponse.message}`)
      )
    }

    return Response.json(
      new ApiResponseHandler(201, {}, `Email successfully send`)
    )

  } catch (error) {
    Response.json(
      new ApiResponseHandler(500, {}, `Error registering user ${error}`)
    )
  }
}