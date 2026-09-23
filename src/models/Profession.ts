import mongoose, { Schema, Document } from 'mongoose';

export interface IProfession extends Document {
  name: string;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfessionSchema = new Schema<IProfession>(
  {
    name: {
      type: String,
      required: [true, 'Profession name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'professions',
  }
);

export const Profession = mongoose.model<IProfession>('Profession', ProfessionSchema);
