import { createTRPCRouter, protectedProcedure } from "../trpc";

export const testRouter = createTRPCRouter({
    test: protectedProcedure.query(async () => {
      return "test";
    })
});
