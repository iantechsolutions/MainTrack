// import 'server-only';
import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { HTTPException } from 'hono/http-exception';
import { env } from '~/env';
import { createClerkClient } from '@clerk/backend';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { api } from '~/trpc/server';
import { UserRolesEnum } from '~/server/utils/roles';
import { clerkClient } from '@clerk/nextjs/server';

// export const runtime = 'edge';
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
    // const response = await clerkClient.redirectUrls.createRedirectUrl({
    //     url: "http://localhost:3000",
    // })
    // console.log(response);
    const data = c.req.valid('json');
    const user = await clerkClient().users.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: [data.emailAddress],
        password: data.password,
    });
    const signInToken = await clerkClient.signInTokens.createSignInToken({
        userId: user.id,
        expiresInSeconds: 60 * 60 * 24 * 30,
    });

    // const res = await fetch(signInToken.url, {
    //     method: 'GET',
    //     credentials: 'include',
    // })

    const res = await fetch(signInToken.url);
    console.log(res);
    
    // Extract cookies from the response headers
    const cookies = res.headers.get('set-cookie');
    console.log("__session");
    console.log(cookies);
    console.log(signInToken.url);
    
    const jwtRes = await fetch("https://musical-wildcat-77.clerk.accounts.dev/v1/dev_browser?_clerk_js_version=5.22.3", {
        method: 'POST',
        credentials: 'include',
        // headers: {
        //     'Cookie': cookies // Include cookies in the request
        // }
    });
    const json = await jwtRes.json();
    console.log("jwtRes");
    console.log(json);
    
    const resres = await fetch(`https://musical-wildcat-77.clerk.accounts.dev/v1/environment?_clerk_js_version=5.22.3&__clerk_db_jwt=${json.id}`, {
        method: 'GET',
    });
    // const coso = await verifyToken(json.id, {authorizedParties: ["musical-wildcat-77.clerk.accounts.dev", "localhost:3000"]});
    console.log("resres");
    console.log(resres);
    // console.log(res.headers.get('set-cookie'));
    const sessions = await clerkClient.sessions.getSessionList({
        userId: user.id
    });
    


    // ojo, signInToken no es lo mismo que session token
    // ejemplo: https://clerk.com/docs/custom-flows/embedded-email-links
    return c.json({
        data: sessions.data,
        id: user.id
    });
});


app.get("/sessionById/:id", async (c) => {
    const session = await clerkClient.sessions.getSession(c.req.param('id'));
    return c.json(session);
})

app.get("/session", async (c) => {
    const sessions = await clerkClient.sessions.getSessionList({
        userId: "user_2mLGrtZvC1jJKFyASpWeAwm2Un4"
    });
    sessions.data.forEach(session => {
        console.log(session.id, session.userId);
    });
    return c.json(sessions);
})


app.get("/userSessions/:id", async (c) => {
    const sessions = await clerkClient.sessions.getSessionList({
        userId: c.req.param('id')
    });
    return c.json(sessions);
})


app.get("/userId", async (c) => {
    const user = await clerkClient.users.getUserList();
    return c.json(user);
})

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
    const users = await clerkClient().users.getUserList({
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

    const validPassword = await clerkClient().users.verifyPassword({
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

        const validTotp = await clerkClient().users.verifyTOTP({
            code: data.totp,
            userId: user.id,
        });
    
        if (!validTotp.verified) {
            throw new HTTPException(403, { message: 'Invalid Credentials' });
        }
    }

    return c.json({
        signInToken: await clerkClient().signInTokens.createSignInToken({
            userId: user.id,
            expiresInSeconds: 60 * 60 * 24 * 30,
        }),
        id: user.id
    });
});

// users

app.get('/p/user', async (c) => {
    return c.json(await api.user.get());
});

const schemaUserEdit = z.object({
    firstName: z.string().min(0).max(1024).optional().nullable(),
    lastName: z.string().min(0).max(1024).optional().nullable(),
    username: z.string().min(0).max(1024).optional().nullable(),
});

app.post('/p/user', zValidator('json', schemaUserEdit), async (c) => {
    return c.json(await api.user.editSelf(c.req.valid('json')));
});

// orgs
const schemaOrgPut = z.object({
    name: z.string().min(1).max(1024),
    seleccionar: z.boolean().default(false),
});

app.put('/p/org', zValidator('json', schemaOrgPut), async (c) => {
    return c.json(await api.org.create(c.req.valid('json')));
});

const schemaOrgPatch = z.object({
    name: z.string().min(1).max(1024),
    orgId: z.string(),
});

app.patch('/p/org', zValidator('json', schemaOrgPatch), async (c) => {
    return c.json(await api.org.edit(c.req.valid('json')));
});

const schemaOrgDel = z.object({
    orgId: z.string()
});

app.delete('/p/org', zValidator('json', schemaOrgDel), async (c) => {
    return c.json(await api.org.delete(c.req.valid('json')));
});

app.get('/p/org/:orgId', async (c) => {
    return c.json(await api.org.get({
        orgId: c.req.param('orgId')
    }));
});

app.get('/p/org/list', async (c) => {
    return c.json(await api.org.list());
});

app.get('/p/org/usuarios/:orgId', async (c) => {
    return c.json(await api.org.listUsers({
        orgId: c.req.param('orgId'),
    }));
});

const schemaOrgInvite = z.object({
    userId: z.string().optional(),
    userEmail: z.string().optional(),
    orgId: z.string(),
});

app.post('/p/org/invite', zValidator('json', schemaOrgInvite), async (c) => {
    return c.json(await api.org.inviteUser(c.req.valid('json')));
});

app.get('/p/org/join/:token', async (c) => {
    return c.json(await api.org.join({
        token: c.req.param('token')
    }));
});

app.get('/p/org/remove/:userId/:orgId', async (c) => {
    return c.json(await api.org.removeUser({
        userId: c.req.param('userId'),
        orgId: c.req.param('orgId')
    }));
});

const schemaOrgSetRole = z.object({
    userId: z.string(),
    orgId: z.string(),
    role: z.enum(UserRolesEnum)
});

app.post('/p/org/setrole', zValidator('json', schemaOrgSetRole), async (c) => {
    return c.json(await api.org.setRole(c.req.valid('json')));
});

app.get('/p/org/select/:orgId', async (c) => {
    return c.json(await api.org.select({
        orgId: c.req.param('orgId')
    }));
});

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
export const PATCH = app.fetch