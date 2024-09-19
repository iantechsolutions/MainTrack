import 'server-only';
import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { HTTPException } from 'hono/http-exception';
import { env } from '~/env';
import { createClerkClient } from '@clerk/backend';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { api } from '~/trpc/server';

export const runtime = 'edge';
const app = new Hono().basePath('/api/app/v1');

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

app.use('*', clerkMiddleware());
app.get('/test', async (c) => {
    return c.text("'hono test'");
});

app.get('/p/test', async (c) => {
    const auth = getAuth(c)

    if (!auth?.userId) {
        throw new HTTPException(403, { message: 'Not logged in' });
    }

    return c.text("'hono test'");
});

const schemaSignup = z.object({
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string(),
    password: z.string().min(8, "Invalid password length"),
});

app.post('/signup', zValidator('json', schemaSignup), async (c) => {
    const auth = getAuth(c);
    if (auth?.userId) {
        throw new HTTPException(400, { message: 'Already logged in' });
    }

    const data = c.req.valid('json');
    const user = await clerkClient.users.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: [data.emailAddress],
        password: data.password,
    });

    // ojo, signInToken no es lo mismo que session token
    // ejemplo: https://clerk.com/docs/custom-flows/embedded-email-links
    return c.json({
        signInToken: await clerkClient.signInTokens.createSignInToken({
            userId: user.id,
            expiresInSeconds: 60 * 60 * 24 * 30,
        }),
        id: user.id
    });
});

const schemaSignin = z.object({
    emailAddress: z.string(),
    password: z.string().min(8, "Invalid password length"),
    totp: z.string().optional(),
});

app.post('/signin', zValidator('json', schemaSignin), async (c) => {
    const auth = getAuth(c);
    if (auth?.userId) {
        throw new HTTPException(400, { message: 'Already logged in' });
    }

    const data = c.req.valid('json');
    const users = await clerkClient.users.getUserList({
        emailAddress: [data.emailAddress]
    });

    const user = users.data.at(0);
    if (!user) {
        throw new HTTPException(403, { message: 'Invalid Credentials' });
    }

    if (user.totpEnabled) {
        if (!data.totp) {
            throw new HTTPException(400, { message: 'TOTP Needed' });
        }
    }

    const validPassword = await clerkClient.users.verifyPassword({
        password: data.password,
        userId: user.id,
    });

    if (!validPassword.verified) {
        throw new HTTPException(403, { message: 'Invalid Credentials' });
    }

    if (user.totpEnabled) {
        if (!data.totp) {
            throw new HTTPException(403, { message: 'Invalid Credentials' });
        }

        const validTotp = await clerkClient.users.verifyTOTP({
            code: data.totp,
            userId: user.id,
        });
    
        if (!validTotp.verified) {
            throw new HTTPException(403, { message: 'Invalid Credentials' });
        }
    }

    return c.json({
        signInToken: await clerkClient.signInTokens.createSignInToken({
            userId: user.id,
            expiresInSeconds: 60 * 60 * 24 * 30,
        }),
        id: user.id
    });
});

app.get('/p/org/usuarios/:orgId', async (c) => {
    return c.json(await api.org.listUsers({
        orgId: c.req.param('orgId'),
    }));
});

app.get('/p/org/:orgId', async (c) => {
    return c.json(await api.org.get({
        orgId: c.req.param('orgId')
    }));
});

app.get('/p/org/remove/:userId/:orgId', async (c) => {
    return c.json(await api.org.removeUser({
        userId: c.req.param('userId'),
        orgId: c.req.param('orgId')
    }));
});

app.get('/p/user/:Id', async (c) => {
    return c.json(await api.user.get({
        userId: c.req.param('Id')
    }));
});

app.get('/p/org/invite-email/:orgId/:userEmail', async (c) => {
    return c.json(await api.org.inviteUser({
        userEmail: c.req.param('userEmail'),
        orgId: c.req.param('orgId')
    }));
});

app.get('/p/org/invite-id/:orgId/:userId', async (c) => {
    return c.json(await api.org.inviteUser({
        userId: c.req.param('userId'),
        orgId: c.req.param('orgId')
    }));
});

app.get('/p/org/join/:token', async (c) => {
    return c.json(await api.org.join({
        token: c.req.param('token')
    }));
});

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
export const PATCH = app.fetch