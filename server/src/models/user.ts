// models/user.ts
import { Document, Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  vip: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createPasswordResetToken: () => string;
}

const userSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    select: false  // 默认情况下不包含在查询结果中
  },
  password: { 
    type: String, 
    required: true, 
    select: false  // 默认情况下不包含在查询结果中
  },
  vip: {
    type: Boolean,
    default: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token 10分钟后过期
  return resetToken;
};

export default model<IUser>('User', userSchema);
