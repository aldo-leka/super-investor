import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            first_name: string;
            last_name: string;
        } & DefaultSession['user'];
    }

    interface User {
        first_name: string;
        last_name: string;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        first_name: string;
        last_name: string;
    }
}