import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { googlePlaceId } = body;

    await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', googlePlaceId: googlePlaceId || '' },
      update: { googlePlaceId: googlePlaceId || '' },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
