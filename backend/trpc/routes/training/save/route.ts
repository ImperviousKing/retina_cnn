import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const diseaseTypeSchema = z.enum(['normal', 'diabetes', 'glaucoma', 'cataract', 'amd', 'hypertension', 'myopia', 'other']);

const saveTrainingImageSchema = z.object({
  id: z.string(),
  disease: diseaseTypeSchema,
  imageUri: z.string(),
  uploadedAt: z.string(),
  validated: z.boolean(),
  validationReason: z.string().optional(),
});

export const saveTrainingImageProcedure = publicProcedure
  .input(saveTrainingImageSchema)
  .mutation(async ({ input }) => {
    console.log('[Backend] Saving training image:', input.id);
    console.log('[Backend] Disease:', input.disease);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      id: input.id,
      savedAt: new Date().toISOString(),
    };
  });

export default saveTrainingImageProcedure;
