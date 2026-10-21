import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// Admin-only viewer for customer ID documents (Aadhar / licence).
export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 });

  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  const { filename } = await params;
  if (!filename.startsWith('kyc-')) return new NextResponse('Not found', { status: 404 });

  const file = await prisma.uploadedFile.findUnique({ where: { filename } });
  if (!file) return new NextResponse('File not found', { status: 404 });

  return new NextResponse(Buffer.from(file.data), {
    status: 200,
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': file.data.length.toString(),
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
