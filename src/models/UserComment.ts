import mongoose, { Schema, Document } from 'mongoose';

export interface IUserComment extends Document {
  targetUserId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserCommentSchema = new Schema<IUserComment>(
  {
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'userComments',
  }
);

UserCommentSchema.index({ targetUserId: 1, createdAt: -1 });

export const UserComment = mongoose.model<IUserComment>('UserComment', UserCommentSchema);
