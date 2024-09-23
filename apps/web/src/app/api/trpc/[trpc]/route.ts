import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "~/server/api/root";
import { createContext } from "~/server/api/trpc";
// export const maxDuration = 300;
// export const dynamic = "force-dynamic";

const handler = trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
});

export { handler as GET, handler as POST };
