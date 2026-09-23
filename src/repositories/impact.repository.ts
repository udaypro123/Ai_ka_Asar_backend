import { AIImpactReport } from '../models/AIImpactReport';
import { ImpactHistory } from '../models/ImpactHistory';

export const createImpactReport = async (userId: string, data: any) =>
  AIImpactReport.create({ ...data, userId });
export const getMyImpactReports = async (userId: string) =>
  AIImpactReport.find({ userId }).sort({ createdAt: -1 });
export const getImpactHistory = async (userId: string) =>
  ImpactHistory.find({ userId }).sort({ createdAt: -1 });
