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
    .select('name email roles profession employmentStatus createdAt updatedAt');

  return users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    roles: u.roles,
    profession: u.profession,
    employmentStatus: u.employmentStatus,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
};
