/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import superjson from "superjson";
import { TRPCError, initTRPC } from "@trpc/server";
import { Session } from "next-auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { createContext } from "~/app/api/trpc/[trpc]/context";

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    let zodErrorMessage: string | null = null;

    if (error.cause instanceof ZodError) {
      zodErrorMessage = fromZodError(error.cause).toString().replaceAll("; ", "\n").split(":").slice(1).join(":");
    }
    if (error.cause instanceof ZodError) {
      zodErrorMessage = fromZodError(error.cause).toString().replaceAll("; ", "\n").split(":").slice(1).join(":");
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        cause: zodErrorMessage ?? error.cause?.message,
        zodError: error.cause instanceof ZodError ? error.cause : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  const ctxCast = ctx as { session?: Session };

  if (!ctxCast.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctxCast.session, user: ctxCast.session.user },
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
