import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mocksecret123',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bookingId, reason } = await req.json();
    if (!bookingId || !reason) {
      return NextResponse.json({ error: 'Missing bookingId or reason' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    let refundStatus = 'NONE';
    const amountToRefund = booking.advancePaid + booking.depositAmount;

    // Trigger Razorpay Refund if applicable
    if (amountToRefund > 0 && booking.razorpayPaymentId) {
      try {
        await razorpay.payments.refund(booking.razorpayPaymentId, {
          amount: Math.round(amountToRefund * 100),
        });
        refundStatus = 'PROCESSED';
      } catch (refundError: any) {
        console.error('Razorpay Refund Error:', refundError);
        refundStatus = 'FAILED';
      }
    } else if (amountToRefund > 0) {
      // Manual refund required if no razorpay payment ID
      refundStatus = 'PENDING';
    }

    // Update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        refundStatus,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: 'Booking Rejected',
        message: `Your booking for ${booking.type} has been rejected. Reason: ${reason}. Refund Status: ${refundStatus}.`,
      },
    });

    return NextResponse.json({ success: true, refundStatus });
  } catch (error: any) {
    console.error('Reject booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
