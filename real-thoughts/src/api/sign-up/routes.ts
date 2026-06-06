import { connectDb } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/helpers/sendVarificationEmail";

export async function POST(request: Request) {
  await connectDb();
  try {
    const { username, email, password } = await request.json();

    //find by username
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    //if username esists
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 },
      );
    }

    //find by email
    const existingUserByEmail = await UserModel.findOne(email);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    //if exists & verified
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            message: "Email already in use",
            success: false,
          },
          {
            status: 400,
          },
        );
        //update the existing one
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }

      // create user if neither exists nore veified
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    //send email response
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );

    //if email failed
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    console.error("Error while creating user ", error.message);
    return Response.json(
      {
        success: false,
        message: "Unable to register user",
      },
      { status: 500 },
    );
  }
}
