import { Skill } from '../models/Skill';
import { User } from '../models/User';

export const getAllSkills = async () => {
  return Skill.find({});
};

export const getMySkills = async (userId: string) => {
  const user = await User.findById(userId).select('skills');
  if (!user) {
    throw new Error('User not found');
  }
  return user.skills || [];
};

export const updateSkill = async (userId: string, skillId: string, level: number) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.skills = user.skills || [];
  const existingIndex = user.skills.findIndex((s: any) => (s as any)._id === skillId);
  if (existingIndex >= 0) {
    (user.skills[existingIndex] as any).level = level;
  } else {
    user.skills.push({ _id: skillId, level } as any);
  }
  await user.save();
  return user.skills;
};
