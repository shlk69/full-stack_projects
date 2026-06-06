import VerificationEmail from "../../emails/VerificationEmail"
import { ApiResponse } from "@/types/ApiResponse"
import { Resend } from "resend";



export const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode:string
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Real thoughts | Verication Code",
          react: VerificationEmail({username,otp:verifyCode}),
        });
        
        return {success:true,message:'Verification email sent successfully'}
    } catch (emailError) {
        console.error('Error while sending verification email ', emailError)
        return {success:false,message:'Failed to send verification email'}
    }
}