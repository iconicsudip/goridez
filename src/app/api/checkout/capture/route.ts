import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let bodyText = '';
    // Handle both regular application/json and navigator.sendBeacon (text/plain or blob)
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json') || contentType.includes('text/plain')) {
      bodyText = await request.text();
    } else {
      bodyText = await request.text();
    }

    if (!bodyText) {
      return NextResponse.json({ success: false, error: 'Empty payload' }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const leadId = payload.leadId || null;
    const visitorId = payload.visitorId?.trim() || null;
    const name = payload.name?.trim() || null;
    const email = payload.email?.trim().toLowerCase() || null;
    const phone = payload.phone?.trim() || null;
    const dob = payload.dob?.trim() || null;
    const specialRequests = payload.specialRequests?.trim() || null;
    const cartSnapshot = payload.cartItems ? JSON.stringify(payload.cartItems) : null;
    const totalAmount = typeof payload.totalAmount === 'number' ? payload.totalAmount : null;
    const dropStage = payload.dropStage || 'VIEWED_CHECKOUT';
    const pickupDate = payload.pickupDate ? new Date(payload.pickupDate) : null;
    const returnDate = payload.returnDate ? new Date(payload.returnDate) : null;

    // Client device & network telemetry
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    let existing = null;

    // 1. Try to find by leadId if client already has one
    if (leadId) {
      existing = await prisma.checkoutLead.findUnique({
        where: { id: leadId },
      });
    }

    // 2. Fallback: match by email, phone, or visitorId created within the last 24 hours
    if (!existing) {
      const orConditions: any[] = [];
      if (email) orConditions.push({ email });
      if (phone) orConditions.push({ phone });
      if (visitorId) orConditions.push({ visitorId });

      if (orConditions.length > 0) {
        existing = await prisma.checkoutLead.findFirst({
          where: {
            status: 'ABANDONED',
            OR: orConditions,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          orderBy: { updatedAt: 'desc' },
        });
      }
    }

    const leadData: any = {
      visitorId: visitorId || existing?.visitorId || null,
      name: name || existing?.name || null,
      email: email || existing?.email || null,
      phone: phone || existing?.phone || null,
      dob: dob || existing?.dob || null,
      specialRequests: specialRequests || existing?.specialRequests || null,
      cartSnapshot: cartSnapshot || existing?.cartSnapshot || null,
      totalAmount: totalAmount !== null ? totalAmount : existing?.totalAmount || null,
      dropStage: dropStage || existing?.dropStage || 'VIEWED_CHECKOUT',
      pickupDate: pickupDate || existing?.pickupDate || null,
      returnDate: returnDate || existing?.returnDate || null,
      ipAddress: ipAddress || existing?.ipAddress || null,
      userAgent: userAgent || existing?.userAgent || null,
    };

    let lead;
    if (existing) {
      lead = await prisma.checkoutLead.update({
        where: { id: existing.id },
        data: leadData,
      });
    } else {
      lead = await prisma.checkoutLead.create({
        data: {
          ...leadData,
          status: 'ABANDONED',
        },
      });
    }

    return NextResponse.json({ success: true, leadId: lead.id, dropStage: lead.dropStage });
  } catch (error: any) {
    console.error('Error capturing checkout lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
