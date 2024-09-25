import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { orgRouter } from "./routers/org_router";
import { userRouter } from "./routers/user_router";
import { testRouter } from "./routers/test";
import { authRouter } from "./routers/auth";
import { docTypeRouter } from "./routers/doctype_router";
import { docRouter } from "./routers/doc_router";
import { eqTypeRouter } from "./routers/eq_type_roouter";

export const appRouter = createTRPCRouter({
    org: orgRouter,
    user: userRouter,
    test: testRouter,
    auth: authRouter,
    docType: docTypeRouter,
    doc: docRouter,
    eqType: eqTypeRouter,
});

export const createCaller = createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
