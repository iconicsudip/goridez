import { NextResponse } from 'next/server';
import path from 'path';
import { compressImage } from '@/lib/compressImage';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

// Customer ID-document upload (Aadhar / passport / driving licence). Open to guests since
// guest checkout exists, but files are stored with a "kyc-" prefix and are only ever served
// back through the admin-only /api/admin/kyc route — never the public /api/uploads route.
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF or image files are allowed' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File must be under 8MB' }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());
    // Keep IDs legible: allow up to ~600KB after compression instead of the 80KB site-image default.
    const { buffer, contentType } = await compressImage(raw, file.type, 600 * 1024);

    const ext =
      contentType === 'application/pdf'
        ? '.pdf'
        : contentType === 'image/webp'
          ? '.webp'
          : path.extname(file.name) || '.jpg';
    const filename = `kyc-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    await prisma.uploadedFile.create({
      data: { filename, mimeType: contentType, data: new Uint8Array(buffer), size: buffer.length },
    });

    return NextResponse.json({ success: true, url: `/api/admin/kyc/${filename}` });
  } catch (error) {
    console.error('KYC upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
