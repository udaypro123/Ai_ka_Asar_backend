import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/appError';

export const getDashboardStats = async () => {
  const nonAdminUsers = { roles: { $nin: ['ADMIN', 'SUPER_ADMIN'] } };
  const totalUsers = await User.countDocuments(nonAdminUsers);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUsers = await User.countDocuments({ ...nonAdminUsers, createdAt: { $gte: today } });
  const recentUsers = await User.find(nonAdminUsers)
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email roles createdAt');

  return {
    totalUsers,
    todayUsers,
    recentUsers: recentUsers.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      roles: u.roles,
      createdAt: u.createdAt,
    })),
  };
};

export const getRecentActivity = async () => {
  const recentUsers = await User.find({ roles: { $nin: ['ADMIN', 'SUPER_ADMIN'] } })
    .sort({ updatedAt: -1 })
    .limit(20)
    .select('name email roles createdAt updatedAt');

  return recentUsers.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    roles: u.roles,
    action: 'profile_updated',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
};

export const getAllUsers = async () => {
  const users = await User.find({ roles: { $nin: ['ADMIN', 'SUPER_ADMIN'] } })
    .sort({ createdAt: -1 })
    .select(
      'name email roles profession employmentStatus currentRole previousRole previousCompany company jobDescription linkedinUrl githubUrl resume mobile skills isBlocked createdAt updatedAt'
    );

  return users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    roles: u.roles,
    profession: u.profession,
    employmentStatus: u.employmentStatus,
    currentRole: u.currentRole,
    previousRole: u.previousRole,
    previousCompany: u.previousCompany,
    company: u.company,
    jobDescription: u.jobDescription,
    linkedinUrl: u.linkedinUrl,
    githubUrl: u.githubUrl,
    resume: u.resume,
    mobile: u.mobile,
    skills: u.skills,
    isBlocked: u.isBlocked,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
};

export const getPublicUsers = async (excludeUserId?: string) => {
  const query: any = {
    roles: { $nin: ['ADMIN', 'SUPER_ADMIN'] },
  };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .select('name email roles currentRole previousRole company previousCompany jobDescription mobile skills createdAt');

  return users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    roles: u.roles,
    currentRole: u.currentRole,
    previousRole: u.previousRole,
    company: u.company,
    previousCompany: u.previousCompany,
    jobDescription: u.jobDescription,
    mobile: u.mobile,
    skills: u.skills,
    createdAt: u.createdAt,
  }));
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user.toObject();
};

export const setUserBlockedStatus = async (userId: string, isBlocked: boolean) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  if (user.roles.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN')) {
    throw new AppError('Admin accounts cannot be blocked here', 403, 'CANNOT_BLOCK_ADMIN');
  }
  if (!user.roles.some((role) => role === 'USER' || role === 'HR')) {
    throw new AppError('Only HR and user accounts can be blocked', 400, 'INVALID_BLOCK_TARGET');
  }

  user.isBlocked = isBlocked;
  await user.save();
  if (isBlocked) await RefreshToken.deleteMany({ userId: user._id });

  return { _id: user._id, isBlocked: user.isBlocked };
};
