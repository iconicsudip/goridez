import CouponManager from '@/components/admin/CouponManager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <CouponManager coupons={coupons} />;
}
