import { publicProcedure } from "../../../create-context";

export const trainingStatsProcedure = publicProcedure
  .query(async () => {
    console.log('[Backend] Fetching training statistics for all ODIR diseases');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      stats: [
        {
          disease: 'normal' as const,
          totalTrainingImages: 0,
          accuracy: 0.88,
          lastUpdated: new Date().toISOString(),
        },
        {
          disease: 'diabetes' as const,
          totalTrainingImages: 0,
          accuracy: 0.78,
          lastUpdated: new Date().toISOString(),
        },
        {
          disease: 'glaucoma' as const,
          totalTrainingImages: 0,
          accuracy: 0.75,
          lastUpdated: new Date().toISOString(),
        },
        {
          disease: 'cataract' as const,
          totalTrainingImages: 0,
          accuracy: 0.82,
          lastUpdated: new Date().toISOString(),
        },
        {
          disease: 'amd' as const,
          totalTrainingImages: 0,
          accuracy: 0.76,
          lastUpdated: new Date().toISOString(),
        },
        {
          disease: 'hypertension' as const,
          totalTrainingImages: 0,
          accuracy: 0.74,
          lastUpdated: new Date().toISOString(),
        },
        {
          disease: 'myopia' as const,
          totalTrainingImages: 0,
          accuracy: 0.79,
          lastUpdated: new Date().toISOString(),
        },
        {
          disease: 'other' as const,
          totalTrainingImages: 0,
          accuracy: 0.70,
          lastUpdated: new Date().toISOString(),
        },
      ],
    };
  });

export default trainingStatsProcedure;
