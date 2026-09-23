import { Profession } from '../models/Profession';

export const getAllProfessions = async () => {
  return Profession.find({});
};
