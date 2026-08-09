import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGoogleCredentials } from '@/lib/google-credentials';
import bcrypt from 'bcryptjs';

// NOTE: `getServerSession(authOptions)` (used everywhere else in the app to read the current
// session) always overrides `providers` internally, so this static object never needs Google
// in it — only the actual sign-in route handler below does, and it's built dynamically per
// request from `buildRequestOptions()` so credentials can be rotated without a redeploy.
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        // On first setup, if database has no users, create default admin credentials
        const userCount = await prisma.user.count();
        if (userCount === 0) {
          const adminPassword = await bcrypt.hash('admin123', 10);
          await prisma.user.create({
            data: {
              name: 'Admin GoRidezz',
              email: 'admin@goridezz.com',
              password: adminPassword,
              role: 'ADMIN',
              phone: '+91 98000 00001'
            }
          });
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          throw new Error('No user found with this email');
        }

        const passwordMatch = await bcrypt.compare(credentials.password as string, user.password);

        if (!passwordMatch) {
          throw new Error('Incorrect password');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use-in-prod',
};

// "Sign in with Google" is opt-in — the provider is only added once OAuth credentials are
// configured (via the admin Google Integrations page, or GOOGLE_OAUTH_CLIENT_ID/SECRET env
// vars as a fallback). Built fresh per request so a credential change takes effect immediately.
async function buildRequestOptions() {
  const { clientId, clientSecret } = await getGoogleCredentials();
  if (!clientId || !clientSecret) return authOptions;

  return {
    ...authOptions,
    providers: [
      GoogleProvider({
        clientId,
        clientSecret,
        // Google verifies emails, so it's safe to link a Google sign-in to an existing
        // Credentials-based account (registered with the same email + a password).
        allowDangerousEmailAccountLinking: true,
      }),
      ...authOptions.providers,
    ],
  };
}

async function handler(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const options = await buildRequestOptions();
  return NextAuth(req, ctx, options);
}

export { handler as GET, handler as POST };
