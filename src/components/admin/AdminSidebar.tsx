'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Car, Layers, Globe, Map, MapPin, Building, FileText,
  Search, Activity, Users, Percent, LogOut, UserCircle, ListOrdered, HelpCircle, Info, Settings, ShieldCheck, Camera, MapPinned, Navigation, Heart, Plug, Bot
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Consolidated Overview', icon: LayoutDashboard },
  { href: '/admin/vehicles', label: 'Vehicle Management', icon: Car },
  { href: '/admin/pricing', label: 'Pricing & Packages', icon: Layers },
  { href: '/admin/delivery-charges', label: 'Delivery Charges', icon: Map },
  { href: '/admin/transfers', label: 'Chauffeur Rates & Settings', icon: MapPin },
  { href: '/admin/airport-zones', label: 'Airport Transfer Zones', icon: MapPinned },
  { href: '/admin/self-drive-locations', label: 'Self Drive Locations', icon: Navigation },
  { href: '/admin/cities', label: 'City Management', icon: Globe },
  { href: '/admin/blogs', label: 'Blog CMS Controls', icon: FileText },
  { href: '/admin/faqs', label: 'FAQ CMS Controls', icon: HelpCircle },
  { href: '/admin/about', label: 'About Page Editor', icon: Info },
  { href: '/admin/happy-family', label: 'Happy Family Photos', icon: Heart },
  { href: '/admin/home-page', label: 'Home Page Editor', icon: Globe },
  { href: '/admin/legal', label: 'Legal Pages & Contact', icon: ShieldCheck },
  { href: '/admin/reels', label: 'Instagram Reels', icon: Camera },
  { href: '/admin/settings', label: 'Branding Settings', icon: Settings },
  { 
    href: '/admin/integrations', 
    label: 'Google Integrations', 
    icon: Plug,
    subItems: [
      { href: '/admin/integrations?tab=dashboard', label: 'Dashboard' },
      { href: '/admin/integrations?tab=configuration', label: 'Configuration' }
    ]
  },
  { href: '/admin/bookings', label: 'Reservation Ledger', icon: ListOrdered },
  { 
    href: '/admin/seo', 
    label: 'Search Optimization (SEO)', 
    icon: Search,
    subItems: [
      { href: '/admin/seo', label: 'Overview' },
      { href: '/admin/sitemap', label: 'Sitemap' },
      { href: '/admin/robots', label: 'Robots.txt' },
      { href: '/admin/llms', label: 'LLMs.txt' },
    ]
  },
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
          <div className="relative h-9 w-28">
            <Image
              src="/logo-ridez.png"
              alt="GoRidez Logo"
              fill
              className="object-cover object-left"
              unoptimized
            />
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
            
            // For sub-items, we check if the current pathname+search matches
            // However, usePathname doesn't include search params.
            // We just check if it starts with the base path.
            // A parent is also active when the current path matches one of its subItems —
            // needed for sections like SEO whose sub-pages (/admin/sitemap, /admin/robots,
            // /admin/llms) don't share the parent's own URL prefix.
            const matchesPath = (href: string) => href !== '#' && pathname?.startsWith(href.split('?')[0]);
            const isActive = link.href === '/admin'
              ? pathname === '/admin'
              : matchesPath(link.href) || !!link.subItems?.some((sub) => matchesPath(sub.href));

            return (
              <div key={link.label} className="flex flex-col gap-1">
                <Link
                  href={link.href}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                    isActive
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-transparent'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} /> {link.label}
                </Link>
                {link.subItems && (
                  <div className={`flex flex-col gap-1 pl-11 pr-2 pt-1 pb-2 ${isActive ? 'block' : 'hidden'}`}>
                    {link.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-green-700 py-2 transition-colors uppercase tracking-widest"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
