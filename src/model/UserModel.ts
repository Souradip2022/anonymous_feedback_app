import mongoose, {Schema, Document, Model} from "mongoose";

export interface Message extends Schema {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

const passwordValidator = {
  validator: function (value: string) {
    const hasUppercase = /[A-Z]/.test(value);

    const hasLowercase = /[a-z]/.test(value);

    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

    return hasUppercase && hasLowercase && hasSpecialChar;
  },
  message: (props: any) => `${props.value} does not meet the password criteria`,
};

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: passwordValidator,
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"]
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema]
});

export const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);