import { publicProcedure } from "../../../create-context";
import { z } from "zod";

const analyzeInputSchema = z.object({
  imageUri: z.string(),
});

export const analyzeProcedure = publicProcedure
  .input(analyzeInputSchema)
  .mutation(async ({ input }) => {
    console.log('[Backend] Multi-class analysis request');
    console.log('[Backend] Note: This endpoint is deprecated. Frontend now uses on-device ML.');
    
    throw new Error(
      'This backend endpoint is no longer used. ' +
      'The app now uses on-device multi-class neural network for offline detection. ' +
      'All analysis is performed locally without server calls.'
    );
  });

export default analyzeProcedure;
