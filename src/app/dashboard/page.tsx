import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { authOptions } from '../api/auth/[...nextauth]/route'; // Ensure you have authOptions exported from your NextAuth route, or adapt the import

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      bookings: {
        include: { car: true, tour: true, villa: true },
        orderBy: { createdAt: 'desc' }
      },
      wishlistItems: {
        include: { car: true, tour: true, villa: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Format the bookings for the Client Component
  const formattedBookings = dbUser.bookings.map((b) => {
    let title = 'Unknown Booking';
    let desc = '';

    if (b.type === 'CAR' && b.car) {
      if (b.serviceSubtype === 'SELF_DRIVE') title = 'Self-Drive Car';
      else if (b.serviceSubtype === 'CHAUFFEUR') title = 'Chauffeur Car';
      else if (b.serviceSubtype === 'ONE_WAY') title = 'One-Way Taxi';
      else if (b.serviceSubtype === 'ROUND_TRIP') title = 'Round-Trip Taxi';
      else if (b.serviceSubtype === 'AIRPORT_TRANSFER') title = 'Airport Transfer';
      else title = 'Car Rental';

      desc = `${b.car.make} ${b.car.model}`;
    } else if (b.type === 'TOUR' && b.tour) {
      title = `Tour Package`;
      desc = b.tour.title;
    } else if (b.type === 'VILLA' && b.villa) {
      title = `Villa Stay`;
      desc = b.villa.name;
    }

    return {
      id: b.id,
      title,
      desc,
      startDate: b.startDate,
      status: b.status,
      depositStatus: b.depositStatus,
      totalAmount: b.totalAmount,
      advancePaid: b.advancePaid,
      remainingAmount: b.remainingAmount,
      depositAmount: b.depositAmount || 0,
      rejectionReason: b.rejectionReason,
      refundStatus: b.refundStatus,
    };
  });

  // Calculate aggregates
  let activeDeposits = 0;
  let totalSpent = 0;
  let advancedSettled = 0;
  let pendingLater = 0;

  formattedBookings.forEach((b) => {
    // Only count active holds
    if (b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.depositAmount > 0) {
      activeDeposits += b.depositAmount;
    }
    
    // Only count completed or confirmed
    if (b.status !== 'CANCELLED') {
      totalSpent += b.totalAmount;
      advancedSettled += b.advancePaid;
      pendingLater += b.remainingAmount;
    }
  });

  const aggregates = {
    totalBookings: formattedBookings.length,
    activeDeposits,
    totalSpent,
    advancedSettled,
    pendingLater,
  };

  const userProp = {
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
  };

  const notifications = await prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  return <DashboardClient user={userProp} bookings={formattedBookings} wishlist={dbUser.wishlistItems} aggregates={aggregates} notifications={notifications} razorpayKeyId={settings?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkey123'} />;
}
