import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
        return user.rows[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    if (!user.email_verified) {
                        throw new Error('Please verify your email before logging in.');
                    }
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            email: user.email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                        };
                    }
                }
                
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            //console.log('auth.ts user, token', user, token);
            if (user) {
                token.first_name = user.first_name;
                token.last_name = user.last_name;
            }

            //console.log('auth.ts changed token', token);
            return token;
        },
        async session({ session, token }) {
            //console.log('auth.ts session, token', session, token);
            if (session.user) {
                session.user.first_name = token.first_name as string;
                session.user.last_name = token.last_name as string;
            }
            //console.log('auth.ts changed session', session);
            return session;
        },
    }
});