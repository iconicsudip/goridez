import { prisma } from '@/lib/prisma';
import RegisterClient from './RegisterClient';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  return <RegisterClient googleSignInEnabled={siteSettings?.googleSignInEnabled || false} />;
}
