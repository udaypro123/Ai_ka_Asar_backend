import mongoose, { Schema, Document } from 'mongoose';

export interface IUserLike extends Document {
  targetUserId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserLikeSchema = new Schema<IUserLike>(
  {
    targetUserId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'userLikes',
  }
);

UserLikeSchema.index({ targetUserId: 1, userId: 1 }, { unique: true });

export const UserLike = mongoose.model<IUserLike>('UserLike', UserLikeSchema);
