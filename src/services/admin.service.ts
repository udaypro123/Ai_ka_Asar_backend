import { User } from '../models/User';

export const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
  const recentUsers = await User.find()
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
  const recentUsers = await User.find()
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
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select(
      'name email roles profession employmentStatus currentRole previousRole previousCompany company jobDescription linkedinUrl githubUrl resume mobile skills createdAt updatedAt'
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
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
};

export const getPublicUsers = async (excludeUserId?: string) => {
  const query: any = {
    roles: { $nin: [['ADMIN'], ['SUPER_ADMIN']] },
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
