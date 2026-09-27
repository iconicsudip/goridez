import { NextResponse } from 'next/server';
import path from 'path';
import { compressImage } from '@/lib/compressImage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const { buffer, contentType } = await compressImage(Buffer.from(bytes), file.type);

    // Create unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = contentType === 'image/webp'
      ? '.webp'
      : contentType === 'image/jpeg'
        ? '.jpg'
        : (path.extname(file.name) || '.webp');
    const filename = `${uniqueSuffix}${ext}`;

    // Save directly to PostgreSQL database
    await prisma.uploadedFile.create({
      data: {
        filename,
        mimeType: contentType,
        data: new Uint8Array(buffer),
        size: buffer.length,
      },
    });

    const fileUrl = `/api/uploads/${filename}`;
    console.log(`File uploaded successfully to database: ${fileUrl} (${buffer.length} bytes, HD quality)`);

    return NextResponse.json({ url: fileUrl, success: true });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file to database' }, { status: 500 });
  }
}
