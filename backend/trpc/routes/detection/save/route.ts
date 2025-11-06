import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const diseaseTypeSchema = z.enum(['normal', 'diabetes', 'glaucoma', 'cataract', 'amd', 'hypertension', 'myopia', 'other']);

const detectionSchema = z.object({
  disease: diseaseTypeSchema,
  confidence: z.number(),
  percentage: z.number(),
});

const saveDetectionSchema = z.object({
  id: z.string(),
  primaryDisease: diseaseTypeSchema,
  detections: z.array(detectionSchema),
  imageUri: z.string(),
  timestamp: z.string(),
  details: z.string(),
});

export const saveDetectionProcedure = publicProcedure
  .input(saveDetectionSchema)
  .mutation(async ({ input }) => {
    console.log('[Backend] Saving multi-class detection record:', input.id);
    console.log('[Backend] Primary disease:', input.primaryDisease);
    console.log('[Backend] Total detections:', input.detections.length);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      id: input.id,
      savedAt: new Date().toISOString(),
    };
  });

export default saveDetectionProcedure;
