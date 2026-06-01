'use client';

import { useState } from 'react';
import { 
  ShieldCheck, Mail, Phone, ChevronRight, Clock, User, 
  FileText, CreditCard, Banknote, Bell, Heart, Sparkles, X, Lock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Always pass explicit locale so server & client produce identical output (fixes hydration mismatch)
const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

type Tab = 'bookings' | 'profile' | 'invoices' | 'payments' | 'refunds' | 'wishlist';

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  bookings: any[];
  aggregates: {
    totalBookings: number;
    activeDeposits: number;
    totalSpent: number;
    advancedSettled: number;
    pendingLater: number;
  };
  wishlist?: any[];
  notifications?: any[];
}

export default function DashboardClient({ user, bookings, aggregates, wishlist = [], notifications = [] }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);
  const [localWishlist, setLocalWishlist] = useState(wishlist);
  
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = localNotifications.filter(n => !n.isRead).length;

  const handleNotificationsOpen = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      // Mark as read in UI optimistically
      setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // Call API
      fetch('/api/notifications', { method: 'POST' }).catch(console.error);
    }
  };

  const activeInvoice = bookings.find(b => b.id === showReceiptModal);

  const handleRemoveWishlist = async (itemId: string, type: string, wishId: string) => {
    try {
      // Optimistic update
      setLocalWishlist(prev => prev.filter(w => w.id !== wishId));
      
      await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, type })
      });
    } catch (err) {
      console.error(err);
      // Revert if failed (simplified for now)
    }
  };

  // --- Razorpay Payment Handler ---
  const handleRazorpayPayment = async (bookingId: string, amount: number, description: string) => {
    try {
      const res = await fetch('/api/razorpay/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const order = await res.json();
      if (!order.id) throw new Error(order.error || 'Order creation failed');

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
          amount: order.amount,
          currency: order.currency,
          name: 'Go Ridezz United',
          description: description,
          order_id: order.id,
          handler: async function (response: any) {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                settleBookingId: bookingId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert('Payment successful and verified!');
              window.location.reload();
            } else {
              alert('Payment verification failed.');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || ''
          },
          theme: { color: '#C4F000' }
        };
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }
      alert('Booking cancelled successfully.');
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0][0] || 'U').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-body relative">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* === TOP HEADER === */}
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-brand-neon rounded-xl flex items-center justify-center border-2 border-brand-neon relative">
              <div className="absolute inset-0 bg-black/90 m-1 rounded-lg flex items-center justify-center">
                <span className="text-brand-neon font-black text-2xl tracking-tighter">{getUserInitials(user.name)}</span>
              </div>
              <div className="absolute -bottom-2 bg-brand-neon text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 border-[#111111]">
                ELITE VIP
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-black uppercase tracking-tight">{user.name}</h1>
                <ShieldCheck size={20} className="text-brand-neon" />
              </div>
              <div className="flex flex-wrap gap-4 text-[10px] font-mono text-white/60 mb-2">
                <div className="flex items-center gap-1.5"><Mail size={12} /> {user.email}</div>
                {user.phone && <div className="flex items-center gap-1.5 text-brand-neon"><Phone size={12} /> {user.phone}</div>}
              </div>
              <div className="flex gap-4 text-[9px] font-mono uppercase tracking-widest text-white/40">
                <div className="bg-[#1A1A1A] px-2 py-1 rounded">ID Verified: YES</div>
                <div className="flex items-center gap-1"><span className="text-brand-neon">●</span> 2,400 Loyalty points active</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto items-center">
            {/* Notifications Bell */}
            <div className="relative z-50">
              <button 
                onClick={handleNotificationsOpen}
                className="bg-[#1A1A1A] border border-white/5 hover:border-white/20 p-5 rounded-2xl relative transition-all"
              >
                <Bell size={24} className={unreadCount > 0 ? "text-brand-neon" : "text-white/40"} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-neon text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#111111]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/50">
                    Recent Notifications
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {localNotifications.length === 0 ? (
                      <div className="p-8 text-center text-white/30 text-xs font-mono">No notifications.</div>
                    ) : (
                      localNotifications.map((notif: any) => (
                        <div key={notif.id} className={`p-4 border-b border-white/5 ${notif.isRead ? 'opacity-60' : 'bg-brand-neon/5'}`}>
                          <div className="font-bold text-sm mb-1">{notif.title}</div>
                          <div className="text-xs text-white/70 font-mono mb-2">{notif.message}</div>
                          <div className="text-[9px] text-white/30 uppercase tracking-widest">{formatDate(notif.createdAt)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 min-w-[120px] text-center">
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Bookings</div>
              <div className="text-2xl font-black">{aggregates.totalBookings}</div>
            </div>
            <div className="bg-[#1A1A1A] border border-brand-neon/20 rounded-2xl p-5 min-w-[160px] text-center">
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Active Deposit</div>
              <div className="text-2xl font-black text-brand-neon">₹{aggregates.activeDeposits.toLocaleString()}</div>
            </div>
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 min-w-[120px] text-center">
              <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Level</div>
              <div className="text-2xl font-black">Tier 3</div>
            </div>
          </div>
        </div>

        {/* === MAIN GRID === */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-4">
              <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-4 px-4 pt-2">Concierge Menu</div>
              <nav className="space-y-1">
                {[
                  { id: 'bookings', label: 'My Bookings', icon: Clock },
                  { id: 'profile', label: 'Personal Profile', icon: User },
                  { id: 'invoices', label: 'Digital Invoices', icon: FileText },
                  { id: 'payments', label: 'Payments history', icon: CreditCard },
                  { id: 'refunds', label: 'Refund escrow deposits', icon: Banknote },
                  { id: 'wishlist', label: 'Saved Wishlist', icon: Heart },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-colors ${
                      activeTab === item.id 
                        ? 'bg-brand-neon text-black shadow-[0_0_15px_rgba(196,240,0,0.15)]' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={16} /> {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-[#161616] border border-white/5 rounded-3xl p-6">
              <div className="flex items-center gap-2 text-brand-neon font-black text-xs uppercase tracking-widest mb-3">
                <Sparkles size={14} /> Elite Privilege Desk
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                As an Elite Member, you get 24/7 dedicated dispatch priority over lakefront lines. Toll exemptions on highway packages applied automatically.
              </p>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 space-y-6">
            
            {/* TAB: MY BOOKINGS */}
            {activeTab === 'bookings' && (
              <>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-1">LIVE TRAVEL LOG</h2>
                    <p className="text-[10px] text-white/50 font-mono">Coordinated scheduled excursions & premium rentals</p>
                  </div>
                  <Link href="/self-drive">
                    <button className="bg-brand-neon hover:bg-brand-hover text-black font-black uppercase tracking-widest px-6 py-3 rounded-xl text-[10px] transition-all flex items-center gap-2">
                      Book New Service <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </Link>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-[#111111] border border-white/5 rounded-3xl p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
                    No active bookings found on your ledger.
                  </div>
                ) : (
                  bookings.map((booking) => {
                    const isActive = booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
                    return (
                      <div key={booking.id} className={`bg-[#111111] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors ${!isActive && 'opacity-75 grayscale-[0.2]'}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-3 font-mono text-[10px] mb-2">
                              <span className="text-brand-neon font-bold">{booking.id.slice(-8).toUpperCase()}</span>
                              <span className="text-white/30">•</span>
                              <span className="text-white/60">{formatDate(booking.startDate)}</span>
                              <span className={`${isActive ? 'bg-[#004d33] text-[#00ffaa] border-[#00ffaa]/20' : 'bg-[#1a334d] text-[#66b3ff] border-[#66b3ff]/20'} border px-2 py-0.5 rounded font-bold uppercase tracking-widest text-[8px]`}>{booking.status}</span>
                            </div>
                            <h3 className={`text-xl font-black uppercase tracking-tight mb-1 ${!isActive && 'text-white/80'}`}>{booking.title}</h3>
                            <p className="text-white/50 text-[11px]">{booking.desc}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">OUTSTANDING DUES</div>
                            <div className={`text-2xl font-black tracking-tight ${!isActive && 'text-white/50'}`}>₹{booking.remainingAmount.toLocaleString()}</div>
                          </div>
                        </div>

                        {booking.status === 'REJECTED' && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                            <div className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-1">Booking Rejected by Admin</div>
                            <div className="text-white/80 font-mono text-sm">{booking.rejectionReason}</div>
                            {booking.refundStatus !== 'NONE' && (
                              <div className="mt-2 text-xs font-bold font-mono">
                                Refund Status: <span className={booking.refundStatus === 'PROCESSED' ? 'text-[#00ffaa]' : 'text-orange-400'}>{booking.refundStatus}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                          <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl flex-1">
                            <div className="text-[9px] text-white/40 uppercase font-mono mb-1">Price: <span className="font-bold text-white">₹{booking.totalAmount.toLocaleString()}</span></div>
                          </div>
                          {booking.depositAmount > 0 && (
                            <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl flex-1">
                              <div className="text-[9px] text-white/40 uppercase font-mono mb-1">Security Deposit: <span className="font-bold text-brand-neon">₹{booking.depositAmount.toLocaleString()}</span></div>
                            </div>
                          )}
                          <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl flex-1">
                            <div className="text-[9px] text-white/40 uppercase font-mono mb-1">Advance Paid: <span className="font-bold text-white">₹{booking.advancePaid.toLocaleString()}</span></div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
                          {isActive && (
                            <button onClick={() => handleCancelBooking(booking.id)} className="text-[10px] font-bold text-white/40 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 px-4 py-2.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                              Cancel Booking
                            </button>
                          )}
                          <button onClick={() => { setActiveTab('invoices'); setShowReceiptModal(booking.id); }} className="text-[10px] font-bold text-white/60 hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2.5 rounded-lg transition-colors">
                            Show Invoice
                          </button>
                          {isActive && booking.remainingAmount > 0 && (
                            <button onClick={() => handleRazorpayPayment(booking.id, booking.remainingAmount, `Settle outstanding for ${booking.id}`)} className="text-[10px] font-black text-black bg-brand-neon hover:bg-brand-hover px-6 py-2.5 rounded-lg transition-colors shadow-[0_0_15px_rgba(196,240,0,0.15)]">
                              SETTLE OUTSTANDING (70%)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* TAB: PERSONAL PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">CLIENT LEDGER DETAILS</h2>
                <p className="text-[10px] text-white/50 font-mono mb-8">Maintain your verified security and travel authorization metadata</p>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest mb-2 block">FULL NAME</label>
                    <input type="text" defaultValue={user.name} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest mb-2 block">EMAIL ADDRESS</label>
                    <input type="email" defaultValue={user.email} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none" disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest mb-2 block">CONTACT COORDINATES</label>
                    <input type="text" defaultValue={user.phone || ''} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest mb-2 block">DRIVING LICENSE / AADHAAR (ID NUM)</label>
                    <input type="text" defaultValue="DL-VERIFIED" className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/50 outline-none" disabled />
                  </div>
                </div>

                <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-6 flex justify-between items-center mb-8">
                  <div>
                    <div className="text-[9px] text-white/40 font-mono uppercase tracking-widest mb-1">KYC STATUS CHECKLIST</div>
                    <div className="text-sm font-bold text-white">Document uploaded verified with central databases.</div>
                  </div>
                  <div className="bg-[#00ffaa] text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded">KYC APPROVED</div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/5">
                  <button className="bg-brand-neon hover:bg-brand-hover text-black font-black px-8 py-3 rounded-xl text-[11px] uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(196,240,0,0.15)]">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* TAB: DIGITAL INVOICES */}
            {activeTab === 'invoices' && (
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">FIDELITY INVOICES</h2>
                <p className="text-[10px] text-white/50 font-mono mb-8">Download structural GST breakdowns and premium transaction papers</p>
                
                <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#0A0A0A] text-[9px] text-white/40 uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="p-6 font-bold">INVOICE ID</th>
                        <th className="p-6 font-bold">EXCURSION DETAILS</th>
                        <th className="p-6 font-bold">PAID (ADVANCE)</th>
                        <th className="p-6 font-bold">OUTSTANDING</th>
                        <th className="p-6 font-bold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-mono">
                      {bookings.length === 0 ? (
                         <tr><td colSpan={5} className="p-6 text-center text-white/40">No invoices available.</td></tr>
                      ) : bookings.map((inv) => (
                        <tr key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-6 font-bold text-brand-neon">{inv.id.slice(-8).toUpperCase()}</td>
                          <td className="p-6">
                            <div className="font-bold text-white text-xs mb-1 font-body">{inv.title}</div>
                            <div className="text-white/50">{inv.desc}</div>
                          </td>
                          <td className="p-6 text-white">₹{inv.advancePaid.toLocaleString()}</td>
                          <td className="p-6 text-white">₹{inv.remainingAmount.toLocaleString()}</td>
                          <td className="p-6">
                            <button onClick={() => setShowReceiptModal(inv.id)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: PAYMENTS HISTORY */}
            {activeTab === 'payments' && (
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">TRANSACTION LEDGER</h2>
                <p className="text-[10px] text-white/50 font-mono mb-8">Audit logs of all down-payments, deposits, and outstanding settlements</p>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-2">CONSOLIDATED SPENT</div>
                    <div className="text-3xl font-black">₹{aggregates.totalSpent.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-2">ADVANCED SETTLED</div>
                    <div className="text-3xl font-black text-brand-neon">₹{aggregates.advancedSettled.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-2">PENDING LATER (70%)</div>
                    <div className="text-3xl font-black">₹{aggregates.pendingLater.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-6">AUTHORIZED GATEWAY LOGS</div>
                  <div className="space-y-4">
                    {bookings.map(log => (
                      <div key={log.id} className="flex justify-between items-center bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl">
                        <div>
                          <div className="font-bold text-sm mb-1 font-mono">UPI Razorpay Transfer: {log.id.slice(-8).toUpperCase()}</div>
                          <div className="text-[9px] text-white/50 uppercase tracking-widest font-mono">Merchant Status Indicator: SUCCESS</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#00ffaa] font-bold font-mono">+₹{log.advancePaid.toLocaleString()}</div>
                          <div className="text-[9px] text-white/40 font-mono mt-1">{formatDate(log.startDate)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REFUNDS */}
            {activeTab === 'refunds' && (
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">SECURITY DEPOSIT ESCROW</h2>
                <p className="text-[10px] text-white/50 font-mono mb-8">Manage and request return flow on holds placed for self-drive safety covenants</p>
                
                <div className="bg-[#1a1a0a] border border-brand-neon/20 rounded-3xl p-8 flex items-center justify-between mb-8">
                  <div className="flex gap-4">
                    <Banknote className="text-brand-neon mt-1" size={24} />
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight mb-1">CONSOLIDATED DEPOSITS HELD</h3>
                      <p className="text-xs text-white/60 max-w-md">Deposits protect against excess KM or structural dents. Released immediately upon vehicle clearance check.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-brand-neon tracking-tight mb-1">₹{aggregates.activeDeposits.toLocaleString()}</div>
                    <div className="text-[8px] text-white/40 uppercase tracking-widest font-mono">PROCESSING REFUND (100% GUARANTEED)</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {bookings.filter(b => b.depositAmount > 0).map(booking => (
                    <div key={booking.id} className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex justify-between items-center">
                      <div>
                        <div className="text-[9px] text-white/30 uppercase font-mono tracking-widest mb-2 bg-[#1A1A1A] inline-block px-2 py-1 rounded">ESCROW ITEM {booking.id.slice(-8).toUpperCase()}</div>
                        <div className="font-black text-lg uppercase tracking-tight mb-1">{booking.title}</div>
                        <div className="text-xs font-mono text-white/60">Held: <span className="text-brand-neon font-bold">₹{booking.depositAmount.toLocaleString()}</span> • Returned to source</div>
                      </div>
                      <div className="flex items-center gap-2 text-brand-neon font-mono text-xs font-bold">
                        <span className="animate-pulse">●</span> Hold Active (Ongoing Ride)
                      </div>
                    </div>
                  ))}
                  {bookings.filter(b => b.depositAmount > 0).length === 0 && (
                    <div className="text-center py-12 text-white/40 text-xs font-mono uppercase tracking-widest">
                      No active security deposits.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: WISHLIST (DYNAMIC) */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">MY TRAVEL WISHLIST</h2>
                <p className="text-[10px] text-white/50 font-mono mb-8">Unlocked dream configurations of premium SUVs, super tour setups, and luxury palaces</p>
                
                {localWishlist.length === 0 ? (
                  <div className="bg-[#111111] border border-white/5 rounded-3xl p-12 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
                    Your wishlist is currently empty.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {localWishlist.map((item) => {
                      let title = '';
                      let desc = '';
                      let priceStr = '';
                      let badge = '';
                      let imageSrc = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=500&q=80';
                      let itemId = '';

                      if (item.type === 'CAR' && item.car) {
                        title = `${item.car.make} ${item.car.model}`;
                        desc = 'Self Drive Car';
                        badge = item.car.category;
                        imageSrc = item.car.image;
                        itemId = item.car.id;
                      } else if (item.type === 'TOUR' && item.tour) {
                        title = item.tour.title;
                        desc = `${item.tour.duration} Days Tour`;
                        priceStr = `From ₹${item.tour.adultPrice}`;
                        badge = 'Guided Tour';
                        imageSrc = item.tour.image;
                        itemId = item.tour.id;
                      } else if (item.type === 'VILLA' && item.villa) {
                        title = item.villa.name;
                        desc = item.villa.location;
                        priceStr = `From ₹${item.villa.startingPrice} / Night`;
                        badge = 'Luxury Villa';
                        imageSrc = item.villa.image;
                        itemId = item.villa.id;
                      }

                      return (
                        <div key={item.id} className="bg-[#111111] border border-white/5 p-4 rounded-2xl flex gap-4 relative group hover:border-brand-neon/50 transition-colors">
                          <button 
                            onClick={() => handleRemoveWishlist(itemId, item.type, item.id)}
                            className="absolute top-3 right-3 text-white/20 hover:text-red-400 transition-colors z-10"
                          >
                            <X size={14}/>
                          </button>
                          <div className="w-32 h-24 relative rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                            <Image src={imageSrc} alt={title} fill className="object-cover" unoptimized/>
                          </div>
                          <div className="py-1">
                            <div className="text-[9px] text-brand-neon uppercase font-bold tracking-widest mb-1">{badge}</div>
                            <div className="font-black text-sm uppercase tracking-tight mb-1 truncate max-w-[150px]">{title}</div>
                            <div className="text-[9px] font-mono text-white/40 mb-3">{desc} {priceStr && `• ${priceStr}`}</div>
                            <Link href={item.type === 'CAR' ? '/self-drive' : item.type === 'VILLA' ? '/villas' : '/tours'}>
                              <button className="text-[9px] font-bold text-brand-neon flex items-center gap-1 uppercase tracking-widest">
                                Book Now <ChevronRight size={10}/>
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === RECEIPT MODAL === */}
      {showReceiptModal && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-white/5 relative">
              <button onClick={() => setShowReceiptModal(null)} className="absolute top-8 right-8 border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg text-xs font-mono text-white/60 hover:text-white flex items-center gap-2 transition-colors">
                Close <X size={14}/>
              </button>
              
              <div className="bg-[#1a1a0a] border border-brand-neon/20 text-brand-neon text-[9px] font-black uppercase tracking-widest inline-block px-3 py-1.5 rounded mb-4">PREMIUM TRIP RECEIPT</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">GO RIDEZZ UNITED</h2>
              <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">UDAIPUR STATION FLEET HQ</p>
            </div>
            
            <div className="p-8 space-y-8 font-mono">
              <div className="flex justify-between text-xs">
                <div>
                  <div className="text-white/40 mb-1">INVOICE TO:</div>
                  <div className="font-bold text-white text-base">{activeInvoice.driverName || user.name}</div>
                  <div className="text-white/60">{activeInvoice.driverPhone || user.phone || user.email}</div>
                  {activeInvoice.driverEmail && <div className="text-white/60">{activeInvoice.driverEmail}</div>}
                </div>
                <div className="text-right">
                  <div className="text-white/40 mb-1">REFERENCE:</div>
                  <div className="font-bold text-brand-neon text-base">{activeInvoice.id.slice(-8).toUpperCase()}</div>
                  <div className="text-white/60">{formatDate(activeInvoice.startDate)}</div>
                </div>
              </div>

              <div>
                <div className="text-white/40 text-[10px] mb-2 uppercase">EXCURSION BREAKDOWN:</div>
                <div className="bg-[#050505] rounded-xl p-5 border border-white/5">
                  <div className="flex justify-between font-bold text-sm mb-4 font-body">
                    <div>{activeInvoice.title}</div>
                    <div>₹{Math.round(activeInvoice.totalAmount * 0.82).toLocaleString()}</div>
                  </div>
                  <div className="text-white/50 text-xs">{activeInvoice.desc}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-b border-white/5 pb-6">
                <div className="flex justify-between text-white/60">
                  <div>BASE FARE COMPONENT</div>
                  <div>₹{Math.round(activeInvoice.totalAmount * 0.82).toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-white/60">
                  <div>CGST (9%) & SGST (9%) INCLUDED</div>
                  <div>₹{Math.round(activeInvoice.totalAmount * 0.18).toLocaleString()}</div>
                </div>
                {activeInvoice.depositAmount > 0 && (
                  <div className="flex justify-between font-bold text-brand-neon pt-2">
                    <div>100% REFUNDABLE SECURITY DEPOSIT</div>
                    <div>₹{activeInvoice.depositAmount.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xl font-bold font-body border-b border-white/5 pb-6">
                <div>Gross Total Invoice</div>
                <div>₹{(activeInvoice.totalAmount + activeInvoice.depositAmount).toLocaleString()}</div>
              </div>

              <div className="bg-[#1a1a0a] border border-brand-neon/20 rounded-xl p-5 text-xs space-y-2">
                <div className="flex justify-between text-white/80">
                  <div>Down Payment Settled</div>
                  <div className="font-bold text-white">₹{activeInvoice.advancePaid.toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-white/80">
                  <div>Outstanding Balances</div>
                  <div className="font-bold text-white">₹{activeInvoice.remainingAmount.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="text-center text-[9px] text-white/30 tracking-widest flex justify-center items-center gap-2">
                <Lock size={10}/> PAYMENTS PROCESSED THROUGH UPI/RAZORPAY 256B END-TO-END ENCRYPTION.
              </div>
            </div>

            <div className="p-8 pt-0">
              <button className="w-full bg-brand-neon hover:bg-brand-hover text-black font-black text-sm uppercase tracking-widest py-4 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-[0_0_20px_rgba(196,240,0,0.15)]">
                 SAVE DIGITAL PDF COPY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
