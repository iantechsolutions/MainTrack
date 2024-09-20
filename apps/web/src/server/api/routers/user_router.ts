import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getUser } from "~/server/utils/user";

export const userRouter = createTRPCRouter({
    get: protectedProcedure
        .query(async ({ ctx }) => {
            const selfId = ctx.session.user.id;
            const user = await getUser(selfId);

            if (!user) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            // excluyo el email
            return user;
        }),
    editSelf: protectedProcedure
        .input(
            z.object({
                firstName: z.string().min(0).max(1024).optional().nullable(),
                lastName: z.string().min(0).max(1024).optional().nullable(),
                username: z.string().min(0).max(1024).optional().nullable(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const selfId = ctx.session.user.id;
            try {
                const res = await clerkClient.users.updateUser(selfId, {
                    firstName: input.firstName ?? undefined,
                    lastName: input.lastName ?? undefined,
                    username: input.username ?? undefined,
                });
                return { res };
            } catch (e) {
                return { message: "Error updating user" };
            }
        }),
    // el list de usuarios lo hice dependiente de la org (ver org_router)
});