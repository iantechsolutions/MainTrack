import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { orgRouter } from "./routers/org_router";
import { userRouter } from "./routers/user_router";
import { testRouter } from "./routers/test";
import { authRouter } from "./routers/auth";

export const appRouter = createTRPCRouter({
    org: orgRouter,
    user: userRouter,
    test: testRouter,
    auth: authRouter
});

export const createCaller = createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
