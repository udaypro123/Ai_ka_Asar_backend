import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerMilestone {
  key: string;
  label: string;
  completed: boolean;
  completedAt?: Date;
}

export interface ICareerJourney extends Document {
  userId: mongoose.Types.ObjectId;
  milestones: ICareerMilestone[];
  currentMilestone: string;
  createdAt: Date;
  updatedAt: Date;
}

const CareerJourneySchema = new Schema<ICareerJourney>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    milestones: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    currentMilestone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'careerJourneys',
  }
);

CareerJourneySchema.index({ userId: 1 }, { unique: true });

export const CareerJourney = mongoose.model<ICareerJourney>('CareerJourney', CareerJourneySchema);
