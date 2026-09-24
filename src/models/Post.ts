import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category?: string;
  likes: mongoose.Types.ObjectId[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'posts',
  }
);

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
