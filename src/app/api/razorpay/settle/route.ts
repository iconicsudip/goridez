import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

async function getRazorpayInstance() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });
  return new Razorpay({
    key_id: settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
    key_secret: settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || 'mocksecret123',
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.remainingAmount <= 0) {
      return NextResponse.json({ error: 'Invalid booking or no outstanding amount' }, { status: 400 });
    }

    const options = {
      amount: Math.round(booking.remainingAmount * 100),
      currency: 'INR',
      receipt: `receipt_settle_${crypto.randomBytes(10).toString('hex')}`,
      notes: {
        bookingId: booking.id,
        userId: booking.userId,
        type: 'SETTLEMENT',
      },
    };

    const rzp = await getRazorpayInstance();
    const order = await rzp.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: 'Failed to generate payment gateway order' }, { status: 500 });
    }

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      bookingId,
    });
  } catch (error: any) {
    console.error('Razorpay Settle error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
