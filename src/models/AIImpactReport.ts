import mongoose, { Schema, Document } from 'mongoose';

export interface IAIImpactReport extends Document {
  userId: mongoose.Types.ObjectId;
  professionId?: mongoose.Types.ObjectId;
  employmentStatus: string;
  impactStatus: string;
  impactAreas: string[];
  incomeImpact: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIImpactReportSchema = new Schema<IAIImpactReport>(
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
    employmentStatus: {
      type: String,
      required: true,
      trim: true,
    },
    impactStatus: {
      type: String,
      required: true,
      trim: true,
    },
    impactAreas: {
      type: [String],
      required: true,
    },
    incomeImpact: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'aiImpactReports',
  }
);

AIImpactReportSchema.index({ userId: 1, createdAt: -1 });

export const AIImpactReport = mongoose.model<IAIImpactReport>('AIImpactReport', AIImpactReportSchema);
