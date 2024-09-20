import type { User } from 'auth-helpers'
import { Hono } from 'hono'

declare module 'hono' {
    interface ContextVariableMap {
        user: User
    }
}

export const appv1 = new Hono()

appv1.get('/user/info', (c) => {
    const user = c.get('user')

    return c.json({ user })
})
