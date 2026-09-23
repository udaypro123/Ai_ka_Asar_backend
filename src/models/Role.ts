import mongoose, { Schema, Document } from 'mongoose';

export type RoleType = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface IRole extends Document {
  name: RoleType;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
      required: true,
      unique: true,
    },
    permissions: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'roles',
  }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
