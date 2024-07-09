import {Account, NextAuthOptions, Profile, Session, User} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import {dbConnect} from "@/lib/dbConnect";
import {UserModel} from "@/model/UserModel";
import {JWT} from "next-auth/jwt";
import {AdapterUser} from "next-auth/adapters";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: {label: 'Email or Username', type: 'text'},
        password: {label: 'Password', type: 'password'},
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              {email: credentials.identifier},
              {username: credentials.identifier},
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          if (!user.password) {
            throw new Error('No password set for this account. Did you sign up with Google?');
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),

    GoogleProvider({
      clientId: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    }),
  ],
  callbacks: {
    async signIn({user, account, profile}:{
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile | undefined;
      credentials?: Record<string, any> | undefined;
    }): Promise<boolean> {
      if (account?.provider === "google") {
        await dbConnect();
        try {
          let dbUser = await UserModel.findOne({email: profile?.email});
          if (!dbUser) {
            dbUser = await UserModel.create({
              username: profile?.name?.replace(/\s+/g, '').toLowerCase(),
              email: profile?.email,
              isVerified: true,
              provider: 'google',
            });
          } else if (dbUser.provider !== 'google') {
            dbUser.provider = 'google';
            await dbUser.save();
          }
          user._id = dbUser._id?.toString() as string;
          user.username = dbUser.username;
          user.isVerified = dbUser.isVerified;
          user.provider = dbUser.provider;
          user.isAcceptingMessages = dbUser.isAcceptingMessage;
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({token, user}: { token: JWT; user: User }): Promise<JWT> {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
        token.provider = user.provider;
      }
      return token;
    },
    async session({session, token}: { session: Session; token: JWT }): Promise<Session> {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in'
  },
};

export {authOptions};