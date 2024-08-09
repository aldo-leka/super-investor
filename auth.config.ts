import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith('/login')
      const isOnRegisterPage = nextUrl.pathname.startsWith('/register')

      if (isLoggedIn) {
        if (isOnLoginPage || isOnRegisterPage) {
          return Response.redirect(new URL('/', nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.first_name = user.first_name;
        token.last_name = user.last_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;