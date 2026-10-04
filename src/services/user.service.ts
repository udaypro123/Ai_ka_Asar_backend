import { User } from '../models/User';
import { CareerProfile } from '../models/CareerProfile';
import {
  AIImpactReport,
  Assessment,
  CareerJourney,
  Comment,
  ImpactHistory,
  Like,
  Notification,
  Post,
  RefreshToken,
  UserComment,
  UserLike,
} from '../models';
import { AppError } from '../utils/appError';
import fs from 'fs/promises';
import path from 'path';
import {
  createLocalResumeDownloadToken,
  createResumeDownloadUrl,
  deleteResume,
  uploadResume as uploadResumeToCloudinary,
} from './cloudinary.service';

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-resumePublicId');
  if (!user) {
    throw new Error('User not found');
  }
  const careerProfile = await CareerProfile.findOne({ userId });
  return { ...user.toObject(), careerProfile };
};

export const getResumeDownloadUrl = async (
  requesterId: string,
  requesterRoles: string[],
  targetUserId: string
): Promise<string> => {
  const targetUser = await User.findById(targetUserId)
    .select('resume resumePublicId privacySettings.profileDiscoverable');
  if (!targetUser) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  if (!targetUser.resume) throw new AppError('No resume found', 404, 'RESUME_NOT_FOUND');

  const canAccessPrivateProfiles = requesterRoles.some((role) =>
    ['ADMIN', 'SUPER_ADMIN', 'HR'].includes(role)
  );
  if (
    requesterId !== targetUserId &&
    !canAccessPrivateProfiles &&
    targetUser.privacySettings?.profileDiscoverable === false
  ) {
    throw new AppError('This resume is not available', 403, 'RESUME_NOT_AVAILABLE');
  }

  if (targetUser.resumePublicId) {
    return createResumeDownloadUrl(targetUser.resumePublicId, targetUser.resume);
  }

  const token = createLocalResumeDownloadToken(targetUserId);
  return `/api/${process.env.API_VERSION || 'v1'}/users/${targetUserId}/resume/file?token=${encodeURIComponent(token)}`;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const saveUserResume = async (
  userId: string,
  file: { buffer: Buffer; originalname: string }
) => {
  const existingUser = await User.findById(userId).select('resume resumePublicId');
  if (!existingUser) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const uploaded = await uploadResumeToCloudinary(file.buffer, userId, file.originalname);
  let user;
  try {
    user = await User.findByIdAndUpdate(
      userId,
      { resume: file.originalname, resumePublicId: uploaded.public_id },
      { new: true }
    ).select('-password');
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  } catch (error) {
    try {
      await deleteResume(uploaded.public_id);
    } catch (cleanupError) {
      console.error('Failed to remove an unlinked Cloudinary resume upload', cleanupError);
    }
    throw error;
  }

  if (existingUser.resumePublicId) {
    try {
      await deleteResume(existingUser.resumePublicId);
    } catch (error) {
      console.error('Failed to remove replaced Cloudinary resume', { error, userId });
    }
  } else if (existingUser.resume && !/^https?:\/\//i.test(existingUser.resume)) {
    const uploadDirectory = path.resolve(process.cwd(), 'uploads');
    const previousPath = path.resolve(uploadDirectory, path.basename(existingUser.resume));
    if (previousPath.startsWith(`${uploadDirectory}${path.sep}`)) {
      await fs.rm(previousPath, { force: true });
    }
  }
  return user;
};

export const deleteUserAccount = async (userId: string) => {
  const user = await User.findById(userId).select('resume resumePublicId');
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const ownedPostIds = await Post.find({ userId: user._id }).distinct('_id');
  const authoredCommentCounts = await Comment.aggregate([
    { $match: { userId: user._id, postId: { $nin: ownedPostIds } } },
    { $group: { _id: '$postId', count: { $sum: 1 } } },
  ]);
  if (user.resume) {
    if (user.resumePublicId) {
      await deleteResume(user.resumePublicId);
    } else if (!/^https?:\/\//i.test(user.resume)) {
      const uploadDirectory = path.resolve(process.cwd(), 'uploads');
      const resumePath = path.resolve(uploadDirectory, path.basename(user.resume));
      if (!resumePath.startsWith(`${uploadDirectory}${path.sep}`)) {
        throw new AppError('Resume not found', 404, 'RESUME_NOT_FOUND');
      }
      await fs.rm(resumePath, { force: true });
    }
  }

  await Promise.all([
    CareerProfile.deleteMany({ userId: user._id }),
    CareerJourney.deleteMany({ userId: user._id }),
    Assessment.deleteMany({ userId: user._id }),
    AIImpactReport.deleteMany({ userId: user._id }),
    ImpactHistory.deleteMany({ userId: user._id }),
    Notification.deleteMany({ userId: user._id }),
    RefreshToken.deleteMany({ userId: user._id }),
    UserLike.deleteMany({ $or: [{ userId: user._id }, { targetUserId: user._id }] }),
    UserComment.deleteMany({ $or: [{ userId: user._id }, { targetUserId: user._id }] }),
    Comment.deleteMany({ $or: [{ userId: user._id }, { postId: { $in: ownedPostIds } }] }),
    Like.deleteMany({ $or: [{ userId: user._id }, { postId: { $in: ownedPostIds } }] }),
    Post.deleteMany({ userId: user._id }),
    Post.updateMany({ likes: user._id }, { $pull: { likes: user._id } }),
    ...authoredCommentCounts.map(({ _id, count }) =>
      Post.updateOne({ _id }, { $inc: { commentCount: -count } })
    ),
  ]);
  await User.deleteOne({ _id: user._id });
};
