import { prisma } from '@/lib/prisma';
import PricingClient from './PricingClient';

export default async function AdminPricing() {
  const [rule, tiers] = await Promise.all([
    prisma.pricingRule.findFirst(),
    prisma.globalPackageTier.findMany({ orderBy: { createdAt: 'asc' } })
  ]);

  return (
    <div className="container mx-auto space-y-8 pb-24">
      <PricingClient initialRule={rule} initialTiers={tiers} />
    </div>
  );
}
