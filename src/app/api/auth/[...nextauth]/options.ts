import {NextAuthOptions} from "next-auth";
import {CredentialsProvider} from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {dbConnect} from "@/lib/dbConnect";
import {User} from "@/model/User";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "Credentials",
      credentials:{
        email: {label: "Email", type: "text"},
        password: {label:"Password", type: "password"}
      },
      async authorize (credentials: any): Promise<any>{
        await dbConnect();

      }
    })
  ]
}