import { appRouter } from "~/server/api/root";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "../../auth/[...nextauth]/route";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export const createContext = async (req: NextRequest) => {
    const session = await getServerSession(nextAuthOptions);
    return {
        db,
        session,
        headers: req.headers,
    };
};

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => createContext(req),
        onError:
            env.NODE_ENV === "development"
                ? ({ path, error }) => {
                    console.error(
                        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
                    );
                    }
                : undefined,
    });
  
  export { handler as GET, handler as POST };