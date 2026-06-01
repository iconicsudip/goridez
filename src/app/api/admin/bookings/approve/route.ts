import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

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

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', rejectionReason: null },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: 'Booking Approved',
        message: `Great news! Your booking (${booking.id.slice(-8)}) has been approved and confirmed.`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Approve booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
