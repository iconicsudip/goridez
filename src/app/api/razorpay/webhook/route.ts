import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Server-side backstop for payment confirmation. The client-side checkout
// handler (see /api/razorpay/verify) is the fast path; if the browser closes
// or the network drops right after a successful charge, Razorpay still
// delivers this webhook so the booking doesn't stay stuck at PENDING forever.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  try {
    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const notes = payment?.notes || {};
      const paymentId = payment?.id;

      if (notes.type === 'SETTLEMENT' && notes.bookingId) {
        await prisma.booking.update({
          where: { id: notes.bookingId },
          data: { remainingAmount: 0 },
        });
      } else if (notes.bookingIds) {
        const bookingIds: string[] = JSON.parse(notes.bookingIds);
        if (bookingIds.length > 0) {
          await prisma.booking.updateMany({
            where: { id: { in: bookingIds }, status: { not: 'CONFIRMED' } },
            data: { status: 'CONFIRMED', razorpayPaymentId: paymentId },
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error);
    // Acknowledge receipt anyway so Razorpay doesn't endlessly retry a payload
    // our own bug can't process; the error is logged for manual reconciliation.
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
