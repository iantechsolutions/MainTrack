import { appRouter } from "~/server/api/root";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { createContext } from "./context";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const onError = ({
  path,
  error,
}: {
  path: unknown;
  error: {
    message: string | unknown;
  };
}) => {
  console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error?.message ?? error}`);
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: env.NODE_ENV === "development" ? onError : undefined,
  });

export { handler as GET, handler as POST };
