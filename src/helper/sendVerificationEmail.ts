import {resend} from "@/lib/resend";
import {ApiResponse} from "@/types/ApiResponse";
import VerificationEmailTemplate from "../../email/VerificationEmailTemplate";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'you@example.com',
      to: email,
      subject: 'Mystery Message Verification Code',
      react: VerificationEmailTemplate({username, otp: verifyCode}),
    });

    return {success: true, message: "Verification email sent successfully"};
  } catch (EmailError) {
    console.warn("Error sending email ", EmailError);
    return {success: false, message: "Failed to send verification email"};
  }
}