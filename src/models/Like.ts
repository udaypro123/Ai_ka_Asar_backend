import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
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
    collection: 'likes',
  }
);

LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
