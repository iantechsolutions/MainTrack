import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { testRouter } from "./routers/test";

export const appRouter = createTRPCRouter({
    test: testRouter,
});

export const createCaller = createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
