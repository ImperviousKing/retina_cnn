import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import analyzeProcedure from "./routes/detection/analyze/route";
import saveDetectionProcedure from "./routes/detection/save/route";
import historyProcedure from "./routes/detection/history/route";
import validateImageProcedure from "./routes/training/validate/route";
import saveTrainingImageProcedure from "./routes/training/save/route";
import trainingStatsProcedure from "./routes/training/stats/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  detection: createTRPCRouter({
    analyze: analyzeProcedure,
    save: saveDetectionProcedure,
    history: historyProcedure,
  }),
  training: createTRPCRouter({
    validate: validateImageProcedure,
    save: saveTrainingImageProcedure,
    stats: trainingStatsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
