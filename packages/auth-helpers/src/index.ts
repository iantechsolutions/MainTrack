import { getSession } from '@auth0/nextjs-auth0/edge'

export type User = {
    id: string
    name: string
    email: string
    picture?: string
}

export type Session = {
    user: User
}

export async function getServerAuthSession(): Promise<Session | null> {
    const auth0Session = await getSession()

    const auth0User = auth0Session?.user

    if (!auth0User) {
        return null
    }

    const user: User = {
        email: auth0User.email,
        id: auth0User.sub,
        name: auth0User.name,
        picture: auth0User.picture,
    }

    const session: Session = {
        user,
    }

    return session
}

export async function getUserFromAccessToken(accessToken: string): Promise<User | null> {
    try {
        const response = await fetch('https://dev-66yy7ysg5y71pl8j.us.auth0.com/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        const data = await response.json()

        if (!data.sub) {
            return null
        }

        const user = {
            email: data.email,
            id: data.sub,
            name: data.name,
            picture: data.picture,
        }

        return user
    } catch (_error) {
        return null
    }
}
