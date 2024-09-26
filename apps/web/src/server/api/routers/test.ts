import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const testRouter = createTRPCRouter({
  testProt: protectedProcedure.query(async () => {
    return "'trpc test'";
  }),
  test: publicProcedure.query(async () => {
    return "'trpc test'";
  }),
});
