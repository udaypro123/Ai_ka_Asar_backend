import { AIImpactReport } from '../models/AIImpactReport';
import { ImpactHistory } from '../models/ImpactHistory';

export const createImpactReport = async (userId: string, data: any) => {
  return AIImpactReport.create({ ...data, userId });
};

export const getMyImpactReports = async (userId: string) => {
  return AIImpactReport.find({ userId }).sort({ createdAt: -1 });
};

export const getImpactHistory = async (userId: string) => {
  return ImpactHistory.find({ userId }).sort({ createdAt: -1 });
};
