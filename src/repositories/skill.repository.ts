import { Skill } from '../models/Skill';
import { User } from '../models/User';

export const getAllSkills = async () => Skill.find({});
export const getMySkills = async (userId: string) => {
  const user = await User.findById(userId).select('skills');
  return user?.skills || [];
};
export const updateSkill = async (userId: string, skillId: string, level: number) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.skills = user.skills || [];
  const idx = user.skills.findIndex((s: any) => (s as any)._id === skillId);
  if (idx >= 0) {
    (user.skills[idx] as any).level = level;
  } else {
    user.skills.push({ _id: skillId, level } as any);
  }
  await user.save();
  return user.skills;
};
