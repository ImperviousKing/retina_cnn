import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const diseaseTypeSchema = z.enum(['normal', 'diabetes', 'glaucoma', 'cataract', 'amd', 'hypertension', 'myopia', 'other']);

const historyInputSchema = z.object({
  disease: diseaseTypeSchema.optional(),
  limit: z.number().default(20),
});

export const historyProcedure = publicProcedure
  .input(historyInputSchema)
  .query(async ({ input }) => {
    console.log('[Backend] Fetching detection history');
    console.log('[Backend] Filter by disease:', input.disease || 'all');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      records: [],
      total: 0,
    };
  });

export default historyProcedure;
