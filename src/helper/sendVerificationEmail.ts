import {resend} from "@/lib/resend";
import {ApiResponse} from "@/types/ApiResponse";
import Index from "../../email";


export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const {error, data} =  await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: "22052939@kiit.ac.in",
      subject: 'Mystery Message Verification Code',
      react: Index({username, otp: verifyCode}),
    });

    if(error){
      return {success: false, message: "Failed to send verification email"}
    }

    return {success: true, message: "Verification email sent successfully"};
  } catch (error: any) {
    console.warn("Error sending email ", error);
    return {success: false, message: "Failed to send verification email"};
  }
}