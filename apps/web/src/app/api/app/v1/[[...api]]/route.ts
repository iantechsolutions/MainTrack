import { Hono } from 'hono';
export const runtime = 'edge';
const app = new Hono().basePath('/api/app/v1');

app.get('/test', async (c, _next) => {
    return c.text("'hono test'");
});

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
export const PATCH = app.fetch