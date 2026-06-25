'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, Car, Layers, Globe, Map, MapPin, Building, FileText, 
  Search, Activity, Users, Percent, LogOut, UserCircle, ListOrdered, HelpCircle, Info
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Consolidated Overview', icon: LayoutDashboard },
  { href: '/admin/vehicles', label: 'Vehicle Management', icon: Car },
  { href: '/admin/pricing', label: 'Pricing & Packages', icon: Layers },
  { href: '/admin/delivery-charges', label: 'Delivery Charges', icon: Map },
  { href: '/admin/transfers', label: 'Taxi & Transfers', icon: MapPin },
  { href: '/admin/cities', label: 'City Management', icon: Globe },
  { href: '/admin/tours', label: 'Tour Coordinator', icon: Map },
  { href: '/admin/villas', label: 'Villa Stays ERP', icon: Building },
  { href: '/admin/blogs', label: 'Blog CMS Controls', icon: FileText },
  { href: '/admin/faqs', label: 'FAQ CMS Controls', icon: HelpCircle },
  { href: '/admin/about', label: 'About Page Editor', icon: Info },
  { href: '/admin/home-page', label: 'Home Page Editor', icon: Globe },
  { href: '/admin/bookings', label: 'Reservation Ledger', icon: ListOrdered },
  { href: '#', label: 'Search Optimization (SEO)', icon: Search },
  { href: '#', label: 'UTM & Analytics Logs', icon: Activity },
  { href: '/admin/coupons', label: 'Coupons & Alerts', icon: Percent },
];


export default function AdminSidebar({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <aside className="w-[300px] shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col m-4 rounded-3xl overflow-hidden shadow-2xl sticky top-4 h-[calc(100vh-2rem)] z-10">
      <div className="p-8 pb-4 h-full flex flex-col">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 mb-8 shrink-0">
          <div className="bg-green-600 text-white font-black text-xs w-8 h-8 rounded-lg flex items-center justify-center tracking-tighter shadow-[0_0_15px_rgba(196,240,0,0.3)]">
            GR
          </div>
          <div>
            <div className="text-sm font-black tracking-tight">
              <span className="text-gray-900">Go</span><span className="text-green-700">Ridez</span>
            </div>
            <div className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">Admin Panel</div>
          </div>
        </div>

        {/* Admin User Badge */}
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-6 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center shrink-0">
            <UserCircle size={16} className="text-green-700" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-gray-900 truncate">{adminName}</div>
            <div className="text-[9px] text-gray-500 font-mono truncate">{adminEmail}</div>
          </div>
          <div className="ml-auto shrink-0">
            <span className="bg-green-600/10 text-green-700 text-[7px] font-black tracking-widest uppercase px-2 py-1 rounded-md border border-green-600/20">
              ADMIN
            </span>
          </div>
        </div>

        <div className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mb-4 shrink-0">
          ERP Control Modules
        </div>
        
        <nav className="flex flex-col gap-2 overflow-y-auto pr-2 pb-4 flex-1 custom-scrollbar">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === '/admin' 
              ? pathname === '/admin' 
              : link.href !== '#' && pathname?.startsWith(link.href);

            if (isActive) {
              return (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  className="flex items-center gap-4 px-5 py-3.5 rounded-xl bg-green-600 text-white font-black uppercase text-[10px] tracking-widest shadow-md transition-all"
                >
                  <Icon size={16} strokeWidth={2.5} /> {link.label}
                </Link>
              );
            }

            return (
              <Link 
                key={link.label} 
                href={link.href} 
                className="flex items-center gap-4 px-5 py-3.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-transparent transition-colors font-bold uppercase text-[10px] tracking-widest"
              >
                <Icon size={16} /> {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="mt-auto pt-5 border-t border-gray-200 shrink-0">
          <button
            onClick={handleSignOut}
            id="admin-signout-btn"
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all font-bold uppercase text-[10px] tracking-widest group"
          >
            <LogOut size={16} className="group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
