import { prisma } from '@/lib/prisma';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  return <LoginClient googleSignInEnabled={siteSettings?.googleSignInEnabled || false} />;
}
