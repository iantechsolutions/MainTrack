import { type AfterCallbackAppRoute, handleAuth, handleCallback } from '@auth0/nextjs-auth0/edge'
import { db, schema } from '~/server/db'

const afterCallback: AfterCallbackAppRoute = async (_req, session, _state) => {
    // await db.insert(schema.users).values({
    //     email: session.user.email,
    //     name: session.user.name,
    //     picture: session.user.picture,
    // })

    return session
}

export const GET = handleAuth({
    callback: handleCallback({
        afterCallback,
    }),
})
