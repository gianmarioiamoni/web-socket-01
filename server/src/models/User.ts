import mongoose, { Schema, Document } from "mongoose";
import * as bcrypt from "bcryptjs";
import { User as IUser } from "../../../shared/types";

interface IUserDocument extends Omit<IUser, "id">, Document {
  id: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, "password">;
}

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    avatar: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: any) {
        ret.id = ret._id.toString();
        // Use destructuring to avoid delete operator errors
        const { _id, __v, password, ...cleanRet } = ret;
        return { id: ret.id, ...cleanRet };
      },
    },
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isOnline: 1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  const user = this as any;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as any;
  return bcrypt.compare(candidatePassword, user.password);
};

// Instance method to return safe user object
userSchema.methods.toSafeObject = function (): Omit<IUser, "password"> {
  const user = this as any;
  const userObject = user.toObject();
  const { password, ...safeUser } = userObject;
  return {
    ...safeUser,
    id: userObject._id.toString(),
  };
};

// Static methods
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username: new RegExp(`^${username}$`, "i") });
};

export const User = mongoose.model<IUserDocument>("User", userSchema);
export type { IUserDocument };
