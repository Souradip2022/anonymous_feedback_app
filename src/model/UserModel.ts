import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document {
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

export interface User extends Document {
  username: string;
  email: string;
  password?: string; // Make password optional
  verifyCode?: string; // Make verifyCode optional
  verifyCodeExpiry?: Date; // Make verifyCodeExpiry optional
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Array<Message>;
  provider: string; // Add provider field
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
    required: false,
  },
  verifyCode: {
    type: String,
    required: false
  },
  verifyCodeExpiry: {
    type: Date,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
  provider: {
    type: String,
    required: [true, "Provider is required"],
    enum: ['credentials', 'google'],
    default: 'credentials'
  }
});

export const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);