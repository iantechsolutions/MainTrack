import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { orgRouter } from "./routers/org_router";
import { userRouter } from "./routers/user_router";
import { testRouter } from "./routers/test";

export const appRouter = createTRPCRouter({
    org: orgRouter,
    user: userRouter,
    test: testRouter,
});

export const createCaller = createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
