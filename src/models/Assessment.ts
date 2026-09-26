import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  responses: Record<string, any>;
  score?: number;
  recommendations?: string[];
  createdAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    responses: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'assessments',
  }
);

AssessmentSchema.index({ userId: 1, createdAt: -1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
