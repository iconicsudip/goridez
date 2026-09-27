import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return new NextResponse('Bad request', { status: 400 });
    }

    const fullPath = slug.join('/');
    const baseName = slug[slug.length - 1];

    const file = await prisma.uploadedFile.findFirst({
      where: {
        OR: [
          { filename: fullPath },
          { filename: `uploads/${baseName}` },
          { filename: baseName },
          { id: baseName },
          { filename: { endsWith: baseName } },
        ],
      },
    });

    if (!file || !file.data) {
      return new NextResponse('File not found', { status: 404 });
    }

    return new NextResponse(Buffer.from(file.data), {
      status: 200,
      headers: {
        'Content-Type': file.mimeType || 'image/webp',
        'Content-Length': file.data.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file from DB:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
