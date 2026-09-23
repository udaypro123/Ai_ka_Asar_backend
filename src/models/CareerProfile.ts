import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  professionId?: mongoose.Types.ObjectId;
  industry?: string;
  experience?: string;
  employmentStatus?: string;
  skills?: string[];
  careerGoal?: string;
  aiUsage?: string;
  aiImpactStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CareerProfileSchema = new Schema<ICareerProfile>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professionId: {
      type: mongoose.Types.ObjectId,
      ref: 'Profession',
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
  },
  {
    timestamps: true,
    collection: 'careerProfiles',
  }
);

CareerProfileSchema.index({ userId: 1 }, { unique: true });

export const CareerProfile = mongoose.model<ICareerProfile>('CareerProfile', CareerProfileSchema);
