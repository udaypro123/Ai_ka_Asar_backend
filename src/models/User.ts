import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { RoleType } from './Role';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  country?: string;
  profession?: string;
  industry?: string;
  experience?: string;
  employmentStatus?: string;
  skills?: string[];
  careerGoal?: string;
  aiUsage?: string;
  aiImpactStatus?: string;
  mobile?: string;
  currentRole?: string;
  previousRole?: string;
  previousCompany?: string;
  company?: string;
  jobDescription?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resume?: string;
  isEmailVerified: boolean;
  isBlocked: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  roles: RoleType[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    country: {
      type: String,
      trim: true,
    },
    profession: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    employmentStatus: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    careerGoal: {
      type: String,
      trim: true,
    },
    aiUsage: {
      type: String,
      trim: true,
    },
    aiImpactStatus: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    currentRole: {
      type: String,
      trim: true,
    },
    previousRole: {
      type: String,
      trim: true,
    },
    previousCompany: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    jobDescription: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    resume: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    roles: {
      type: [String],
      enum: ['USER', 'ADMIN', 'SUPER_ADMIN', "HR"],
      default: ['USER'],
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const safeUser = ret as unknown as Record<string, unknown>;
    delete safeUser.password;
    delete safeUser.resetPasswordToken;
    delete safeUser.resetPasswordExpires;
    delete safeUser.emailVerificationToken;
    delete safeUser.emailVerificationExpires;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
