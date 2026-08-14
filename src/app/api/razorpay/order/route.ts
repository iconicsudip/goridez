import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

function getRazorpayInstance(settings: { razorpayKeyId?: string | null; razorpayKeySecret?: string | null } | null) {
  return new Razorpay({
    key_id: settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
    key_secret: settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || 'mocksecret123',
  });
}

export async function POST(req: NextRequest) {
  try {
    const { amount, cartItems, driverDetails, couponCode, discount, pickupDate, returnDate } = await req.json();

    if (!amount || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Invalid checkout request data' }, { status: 400 });
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    });

    // 1. Authenticate user session, or fall back to a guest checkout account when admin
    // has switched that on (see SiteSettings.guestCheckoutEnabled / /admin/settings).
    const session = await getServerSession(authOptions);
    let dbUser;

    if (session?.user) {
      dbUser = await prisma.user.findUnique({
        where: { email: session.user.email as string },
      });

      if (!dbUser) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }

      // Update phone in user profile if it's missing or different
      if (driverDetails.phone && dbUser.phone !== driverDetails.phone) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { phone: driverDetails.phone },
        });
      }
    } else {
      if (!settings?.guestCheckoutEnabled) {
        return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
      }

      const guestName = (driverDetails?.name as string || '').trim();
      const guestEmail = (driverDetails?.email as string || '').trim().toLowerCase();
      const guestPhone = (driverDetails?.phone as string || '').trim();

      if (!guestName || !guestEmail || !guestPhone) {
        return NextResponse.json(
          { error: 'Name, email and phone are required for guest checkout' },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({ where: { email: guestEmail } });

      // If this email already belongs to a real (non-guest) account, don't silently attach
      // a booking to it — that would let anyone book against someone else's account just by
      // typing their email address. Send them to log in instead.
      if (existing && !existing.isGuest) {
        return NextResponse.json(
          { error: 'This email is already registered. Please log in to continue.' },
          { status: 409 }
        );
      }

      dbUser = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            data: { name: guestName, phone: guestPhone },
          })
        : await prisma.user.create({
            data: { name: guestName, email: guestEmail, phone: guestPhone, isGuest: true },
          });
    }

    // 2. Compute and log PENDING bookings in the database
    const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price, 0);
    const bookingIds: string[] = [];

    for (const item of cartItems) {
      // Proportional discount allocation
      const itemWeight = subtotal > 0 ? item.price / subtotal : 0;
      const itemDiscount = Math.round((discount || 0) * itemWeight);
      const discountedItemPrice = Math.max(0, item.price - itemDiscount);

      const itemGst = discountedItemPrice * 0.18;
      const itemTotal = discountedItemPrice + itemGst;
      const itemAdvance = itemTotal * 0.3; // 30% advance hold
      const itemRemaining = itemTotal - itemAdvance;

      let type = 'CAR';
      let carId = null;
      let tourId = null;
      let villaId = null;
      let serviceSubtype = null;

      if (item.serviceType === 'tours') {
        type = 'TOUR';
        tourId = item.referenceId;
      } else if (item.serviceType === 'villaCar') {
        type = 'VILLA';
        villaId = item.referenceId;
      } else {
        type = 'CAR';
        carId = item.referenceId;
        if (item.serviceType === 'selfDrive') serviceSubtype = 'SELF_DRIVE';
        else if (item.serviceType === 'withDriver') serviceSubtype = 'CHAUFFEUR';
        else if (item.serviceType === 'oneWayTaxi') serviceSubtype = 'ONE_WAY';
        else if (item.serviceType === 'roundTripTaxi') serviceSubtype = 'ROUND_TRIP';
        else if (item.serviceType === 'airportTransfer') serviceSubtype = 'AIRPORT_TRANSFER';
      }

      const startDate = pickupDate ? new Date(pickupDate) : new Date();
      const endDate = returnDate ? new Date(returnDate) : startDate;

      const booking = await prisma.booking.create({
        data: {
          userId: dbUser.id,
          type,
          carId,
          tourId,
          villaId,
          serviceSubtype,
          startDate,
          endDate,
          totalAmount: Math.round(itemTotal),
          advancePaid: Math.round(itemAdvance),
          remainingAmount: Math.round(itemRemaining),
          depositAmount: item.deposit || 0,
          status: 'PENDING',
          depositStatus: 'PENDING',
          driverName: driverDetails?.name || null,
          driverEmail: driverDetails?.email || null,
          driverPhone: driverDetails?.phone || null,
          driverDob: driverDetails?.dob || null,
          aadharFile: driverDetails?.aadharFile || null,
          dlFile: driverDetails?.dlFile || null,
          specialRequests: driverDetails?.specialRequests || null,
          pickupStation: item.pickupStation || null,
          dropStation: item.dropStation || null,
          deliveryFee: item.deliveryFee || 0,
        },
      });

      bookingIds.push(booking.id);
    }

    // 3. Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (e.g. ₹100 = 10000 paise)
      currency: 'INR',
      receipt: `receipt_${crypto.randomBytes(10).toString('hex')}`,
      notes: {
        bookingIds: JSON.stringify(bookingIds),
        userId: dbUser.id,
      },
    };

    const rzp = getRazorpayInstance(settings);
    const order = await rzp.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: 'Failed to generate payment gateway order' }, { status: 500 });
    }

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      bookingIds,
    });
  } catch (error: any) {
    console.error('Razorpay Order creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
