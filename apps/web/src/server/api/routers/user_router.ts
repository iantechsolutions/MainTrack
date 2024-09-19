import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { getUser } from "~/server/utils/user";

export const userRouter = createTRPCRouter({
    get: protectedProcedure
        .query(async ({ ctx }) => {
            const selfId = ctx.session.user.id;
            const user = getUser(selfId);

            if (!user) {
                throw new TRPCError({code: 'NOT_FOUND'});
            }

            // excluyo el email
            return user;
        }),
    // el list de usuarios lo hice dependiente de la org (ver org_router)
});