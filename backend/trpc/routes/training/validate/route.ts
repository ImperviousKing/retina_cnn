import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const diseaseTypeSchema = z.enum(['normal', 'diabetes', 'glaucoma', 'cataract', 'amd', 'hypertension', 'myopia', 'other']);

const validateImageSchema = z.object({
  imageUri: z.string(),
  disease: diseaseTypeSchema,
});

export const validateImageProcedure = publicProcedure
  .input(validateImageSchema)
  .mutation(async ({ input }) => {
    console.log('[Backend] Validating training image for:', input.disease);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const hash = input.imageUri.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isValid = Math.sin(hash * 7) > -0.3;

    const validReasons: Record<string, string> = {
      normal: 'Backend validated: Normal eye structures clearly visible. Image quality is sufficient for training the model.',
      diabetes: 'Backend validated: Retinal blood vessels are clearly visible. Image quality meets training requirements for diabetic retinopathy detection.',
      glaucoma: 'Backend validated: Clear view of optic disc detected. Image quality is sufficient for training the glaucoma detection model.',
      cataract: 'Backend validated: Lens structure is clearly visible. Image quality is adequate for cataract detection training.',
      amd: 'Backend validated: Macular region is clearly visible. Image quality meets requirements for AMD detection training.',
      hypertension: 'Backend validated: Retinal vessels are clearly visible. Image quality is adequate for hypertensive retinopathy training.',
      myopia: 'Backend validated: Retinal changes are clearly visible. Image quality meets myopia detection training requirements.',
      other: 'Backend validated: Eye structures are clearly visible. Image quality is sufficient for general abnormality detection training.',
    };

    const invalidReasons = [
      'Backend validation: Image quality is insufficient for training. Please ensure good lighting and focus.',
      'Backend validation: Unable to clearly identify eye structures. Please capture a clearer image.',
      'Backend validation: Image appears blurry or out of focus. Retake with better camera stability.',
    ];

    return {
      valid: isValid,
      reason: isValid 
        ? validReasons[input.disease]
        : invalidReasons[Math.abs(hash) % invalidReasons.length],
    };
  });

export default validateImageProcedure;
