import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const dynamic = 'force-dynamic';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_client_id_placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret_placeholder',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'messmanager_super_secret_key_123',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
