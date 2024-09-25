// import 'server-only';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { env } from '~/env';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getApi } from '~/trpc/server';
import { UserRolesEnum } from '~/server/utils/roles';
import { authLoginSchema, authSignupSchema } from '~/server/api/routers/auth';
import { editSelfSchema } from '~/server/api/routers/user_router';
import { getServerSession } from 'next-auth';

type HonoVariables = {
    uid: string
}

// export const runtime = 'edge';
const app = new Hono<{ Variables: HonoVariables }>().basePath('/api/app/v1');

app.use('/p/*', async (c, next) => {
    const session = await getServerSession();
    if (!session) {
        return c.status(400);
    } else {
        c.set("uid", session.user.id);
        await next();
    }
});

app.get('/test', async (c) => {
    return c.text("'hono test'");
});

app.get('/p/test', async (c) => {
    return c.text("'hono test'");
});

app.post('/signup', zValidator('json', authSignupSchema), async (c) => {
    const api = await getApi();
    return c.json(api.auth.signUp(c.req.valid('json')));
});

// Usar endpoints de nextauth
app.post('/login', zValidator('json', authLoginSchema), async (c) => {
    const api = await getApi();
    return c.json(api.auth.logIn(c.req.valid('json')));
}); 

// users

app.get('/p/user', async (c) => {
    const api = await getApi();
    return c.json(await api.user.get());
});

app.post('/p/user', zValidator('json', editSelfSchema), async (c) => {
    const api = await getApi();
    return c.json(await api.user.editSelf(c.req.valid('json')));
});

// orgs
const schemaOrgPut = z.object({
    name: z.string().min(1).max(1024),
    seleccionar: z.boolean().default(false),
});

app.put('/p/org', zValidator('json', schemaOrgPut), async (c) => {
    const api = await getApi();
    return c.json(await api.org.create(c.req.valid('json')));
});

const schemaOrgPatch = z.object({
    name: z.string().min(1).max(1024),
    orgId: z.string(),
});

app.patch('/p/org', zValidator('json', schemaOrgPatch), async (c) => {
    const api = await getApi();
    return c.json(await api.org.edit(c.req.valid('json')));
});

const schemaOrgDel = z.object({
    orgId: z.string()
});

app.delete('/p/org', zValidator('json', schemaOrgDel), async (c) => {
    const api = await getApi();
    return c.json(await api.org.delete(c.req.valid('json')));
});

app.get('/p/org/:orgId', async (c) => {
    const api = await getApi();
    return c.json(await api.org.get({
        orgId: c.req.param('orgId')
    }));
});

app.get('/p/org/list', async (c) => {
    const api = await getApi();
    return c.json(await api.org.list());
});

app.get('/p/org/usuarios/:orgId', async (c) => {
    const api = await getApi();
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
    const api = await getApi();
    return c.json(await api.org.inviteUser(c.req.valid('json')));
});

app.get('/p/org/join/:token', async (c) => {
    const api = await getApi();
    return c.json(await api.org.join({
        token: c.req.param('token')
    }));
});

app.get('/p/org/remove/:userId/:orgId', async (c) => {
    const api = await getApi();
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
    const api = await getApi();
    return c.json(await api.org.setRole(c.req.valid('json')));
});

app.get('/p/org/select/:orgId', async (c) => {
    const api = await getApi();
    return c.json(await api.org.select({
        orgId: c.req.param('orgId')
    }));
});

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
export const PATCH = app.fetch