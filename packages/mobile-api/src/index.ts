import { Hono } from 'hono';

/* declare module 'hono' {
    interface ContextVariableMap {
        ...
    }
} */

export const appv1 = new Hono();