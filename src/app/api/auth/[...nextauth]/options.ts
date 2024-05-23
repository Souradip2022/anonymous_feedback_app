import {NextAuthOptions, Session} from "next-auth";
import {CredentialsProvider} from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";
import {JWT} from "next-auth/jwt";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider<CredentialsProvider>({
      name: "Credentials",
      id: "Credentials",
      credentials: {
        email: {label: "Email", type: "text"},
        password: {label: "Password", type: "password"}
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              {email: credentials.identifier},
              {username: credentials.identifier}
            ]
          });

          if (!user) {
            throw new Error("User not found with this email");
          }
          if (!user.isVerified) {
            throw new Error("Please verify user before logging in");
          }
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }

        } catch (error: any) {
          console.log(error.message);
          throw new Error(error);
        }
      }
    })
  ],
  callbacks: {
    async jwt({token, user}) :Promise<JWT>{
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
      }

      return token;
    },
    async session({token, session}):Promise<Session>{
      if(token){
        session._id = token._id;
        session.username = token.username;
        session.isVerified = token.isVerified;
        session.isAcceptingMessages = token.isAcceptingMessages;
      }

      return session;
    },
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/sign-in",

    }
  }
}

export {authOptions};