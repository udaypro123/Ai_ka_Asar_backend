import mongoose, { Schema, Document } from 'mongoose';

export interface IImpactHistory extends Document {
  userId: mongoose.Types.ObjectId;
  reportId: mongoose.Types.ObjectId;
  status: string;
  areas: string[];
  createdAt: Date;
}

const ImpactHistorySchema = new Schema<IImpactHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'AIImpactReport',
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    areas: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'impactHistory',
  }
);

ImpactHistorySchema.index({ userId: 1, createdAt: -1 });

export const ImpactHistory = mongoose.model<IImpactHistory>('ImpactHistory', ImpactHistorySchema);
