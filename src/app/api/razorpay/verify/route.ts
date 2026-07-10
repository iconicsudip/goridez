import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingIds, settleBookingId } = await req.json();

    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    });
    const secret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || 'mocksecret123';

    // Verify the payment signature using HMAC SHA256
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed: Invalid signature' }, { status: 400 });
    }

    // Payment is verified successfully. Update the booking statuses to CONFIRMED.
    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds },
        },
        data: {
          status: 'CONFIRMED',
          razorpayPaymentId: razorpay_payment_id,
        },
      });
    }

    if (settleBookingId) {
      await prisma.booking.update({
        where: { id: settleBookingId },
        data: { remainingAmount: 0 },
      });
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
