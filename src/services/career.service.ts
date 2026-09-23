import { CareerJourney, ICareerMilestone } from '../models/CareerJourney';

export const getCareerJourney = async (userId: string) => {
  let journey = await CareerJourney.findOne({ userId });
  if (!journey) {
    journey = await CareerJourney.create({
      userId,
      milestones: [
        { key: 'assessment', label: 'Assessment', completed: false },
        { key: 'skill-gap', label: 'Skill Gap', completed: false },
        { key: 'learning', label: 'Learning', completed: false },
        { key: 'project', label: 'Project', completed: false },
        { key: 'applications', label: 'Applications', completed: false },
        { key: 'interview', label: 'Interview', completed: false },
        { key: 'transition', label: 'Career Transition', completed: false },
      ],
      currentMilestone: 'assessment',
    });
  }
  return journey;
};

export const updateCareerJourney = async (userId: string, milestones: ICareerMilestone[]) => {
  const journey = await CareerJourney.findOne({ userId });
  if (!journey) {
    throw new Error('Career journey not found');
  }
  journey.milestones = milestones;
  const current = milestones.find((m) => !m.completed);
  journey.currentMilestone = current ? current.key : 'transition';
  await journey.save();
  return journey;
};

export const getRecommendations = async (userId: string) => {
  return [];
};
