import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDb } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export const authOptions = {
  providers: [
    Credentials({
      id: "credential",
      name: "Credential",
      credentials: {
        email: {
          label: "Email",
          type: "emmail",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials: any): Promise<any> {
        await connectDb();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.indentifier },
              { username: credentials.indentifier },
            ],
          });
          if (!user) {
            throw new Error("No user found with this email");
          }
          if (!user.isVerified) {
            throw new Error("Please verify before login");
          }
          const isPassValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (!isPassValid) {
            throw new Error("Invalid credentials");
          }
          return user;
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
    ],
    callbacks: {
        
    },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
