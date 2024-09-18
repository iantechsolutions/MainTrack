import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserPublic } from "~/server/utils/other";

export const userRouter = createTRPCRouter({
    get: protectedProcedure.input(
            z.object({
                userId: z.string(),
            })
        ).query(async ({ input }) => {
            const user = await db.query.users.findFirst({
                where: eq(schema.users.Id, input.userId)
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            // excluyo el email
            return getUserPublic(user);
        }),
    // el list de usuarios lo hice dependiente de la org (ver org_router)
});