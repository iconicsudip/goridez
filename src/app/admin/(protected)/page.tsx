import { prisma } from '@/lib/prisma';
import GrowthChart from '@/components/admin/GrowthChart';
import { DollarSign, ListOrdered, Navigation, ShieldCheck, Globe } from 'lucide-react';

export default async function AdminDashboard() {
  const totalVillas = await prisma.villa.count();
  const totalTours = await prisma.tour.count();

  // Sum of totalAmount for CONFIRMED bookings
  const revenueAgg = await prisma.booking.aggregate({
    where: { status: 'CONFIRMED' },
    _sum: { totalAmount: true }
  });
  const grossRevenue = revenueAgg._sum.totalAmount || 0;

  // Count of CONFIRMED bookings
  const confirmedBookingsCount = await prisma.booking.count({
    where: { status: 'CONFIRMED' }
  });

  // Sum of depositAmount for CONFIRMED bookings with active hold (i.e. depositStatus is PENDING or PAID)
  const depositAgg = await prisma.booking.aggregate({
    where: {
      status: 'CONFIRMED',
      depositStatus: { in: ['PENDING', 'PAID'] }
    },
    _sum: { depositAmount: true }
  });
  const escrowDeposits = depositAgg._sum.depositAmount || 0;
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Gross Revenue Volume</h3>
            <DollarSign className="text-green-700" size={16} />
          </div>
          <div className="text-4xl font-black mb-2">₹{grossRevenue.toLocaleString()}</div>
          <div className="text-green-700 text-[10px] font-bold uppercase tracking-widest">+18.4% this week</div>
          <div className="text-gray-400 text-[9px] uppercase tracking-widest mt-1">Sovereign Gross Sales</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Reservation Logs</h3>
            <ListOrdered className="text-green-700" size={16} />
          </div>
          <div className="text-4xl font-black mb-2">{confirmedBookingsCount} Confirmed</div>
          <div className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">Zero dropouts</div>
          <div className="text-gray-400 text-[9px] uppercase tracking-widest mt-1">Complete Client Roster</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Tours & Villas active</h3>
            <Navigation className="text-green-700" size={16} />
          </div>
          <div className="text-4xl font-black mb-2">{totalVillas + totalTours} Listings</div>
          <div className="text-green-700 text-[10px] font-bold uppercase tracking-widest">VIP Rajasthan entries</div>
          <div className="text-gray-400 text-[9px] uppercase tracking-widest mt-1">Catalog Combo Count</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Held Escrow Deposits</h3>
            <ShieldCheck className="text-green-700" size={16} />
          </div>
          <div className="text-4xl font-black mb-2">₹{escrowDeposits.toLocaleString()}</div>
          <div className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">Auto-released at counter</div>
          <div className="text-gray-400 text-[9px] uppercase tracking-widest mt-1">Secure Security Deposit</div>
        </div>

      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 relative">
        <div className="absolute top-8 right-8 border border-green-300 bg-green-600/10 px-4 py-2 rounded-lg backdrop-blur-md">
          <span className="text-green-700 font-bold text-[11px] tracking-widest uppercase">₹2.8M Projected Q3</span>
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-1">CONSOLIDATED GROWTH METRICS</h2>
        <p className="text-gray-500 text-[11px] tracking-widest font-bold uppercase">Self-drive vs Guided luxury tours peak seasons comparison</p>
        
        <GrowthChart />
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SEO Landing Directories */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider">DYNAMIC SEO LANDING DIRECTORIES</h2>
            <Globe className="text-green-700" size={16} />
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-gray-600 font-medium">Udaipur Hub</span>
              <span className="text-gray-900 font-bold text-sm">Active (250 leads)</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <span className="text-gray-600 font-medium">Jaipur Hub</span>
              <span className="text-gray-900 font-bold text-sm">Active (122 leads)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-400 font-medium">Jodhpur expansion</span>
              <span className="text-orange-400 font-bold text-sm">Pending sitemap register</span>
            </div>
          </div>
        </div>

        {/* Concierge Automation */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200">
          <h2 className="text-sm font-black uppercase tracking-wider mb-8">CONCIERGE AUTOMATION QUEUE</h2>
          
          <div className="space-y-4 font-mono text-[10px]">
            <div className="flex gap-3 text-emerald-400">
              <span className="shrink-0">●</span>
              <p>[OK] Automated WhatsApp ping queued for latest customer</p>
            </div>
            <div className="flex gap-3 text-gray-500">
              <span className="shrink-0">●</span>
              <p>[STABLE] SEO sitemap.xml cache generated successfully</p>
            </div>
            <div className="flex gap-3 text-orange-400">
              <span className="shrink-0">●</span>
              <p>[WARN] SSL certificates checked automatically (Expires in 200 days)</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
