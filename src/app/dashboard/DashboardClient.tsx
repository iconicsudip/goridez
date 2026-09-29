'use client';

import { useState } from 'react';
import { 
  ShieldCheck, Mail, Phone, ChevronRight, Clock, User, 
  FileText, CreditCard, Banknote, Bell, Heart, Sparkles, X, Lock, LogOut
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

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
  razorpayKeyId?: string;
}

export default function DashboardClient({ user, bookings, aggregates, wishlist = [], notifications = [], razorpayKeyId }: DashboardClientProps) {
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
          key: razorpayKeyId || 'rzp_test_mockkey123',
          amount: order.amount,
          currency: order.currency,
          name: 'GoRidez',
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
          theme: { color: '#294B32' }
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
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] pt-28 pb-20 font-sans relative">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* === TOP HEADER === */}
        <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-10 shadow-2xl border-classic-frame">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-[#551A0C] rounded-2xl flex items-center justify-center border-2 border-[#C89D5C] relative shadow-lg">
              <div className="absolute inset-0 bg-[#FEFBF8] m-1 rounded-xl flex items-center justify-center">
                <span className="text-[#551A0C] font-serif font-black text-2xl tracking-tight">{getUserInitials(user.name)}</span>
              </div>
              <div className="absolute -bottom-2 bg-[#250903] text-[#DFB574] text-[8px] font-bold font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border border-[#C89D5C]/40 shadow">
                ROYAL VIP
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-2xl md:text-3xl font-black font-serif uppercase tracking-tight text-[#551A0C]">{user.name}</h1>
                <ShieldCheck size={20} className="text-[#C89D5C]" />
              </div>
              <div className="flex flex-wrap gap-4 text-[10px] font-mono text-[#6A5749] mb-2">
                <div className="flex items-center gap-1.5"><Mail size={12} className="text-[#C89D5C]" /> {user.email}</div>
                {user.phone && <div className="flex items-center gap-1.5 text-[#551A0C]"><Phone size={12} className="text-[#C89D5C]" /> {user.phone}</div>}
              </div>
              <div className="flex gap-4 text-[9px] font-mono uppercase tracking-widest text-[#8C6D53]">
                <div className="bg-[#FAF6F0] px-2.5 py-1 rounded border border-[#E7DFD5]">Registry Status: VERIFIED</div>
                <div className="flex items-center gap-1"><span className="text-[#C89D5C]">✦</span> Sovereign Tier Privileges Active</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto items-center">
            {/* Notifications Bell */}
            <div className="relative z-50">
              <button 
                onClick={handleNotificationsOpen}
                className="bg-[#FAF6F0] border border-[#E7DFD5] hover:border-[#C89D5C] p-4 rounded-2xl relative transition-all shadow-sm cursor-pointer"
                title="Notifications"
              >
                <Bell size={22} className={unreadCount > 0 ? "text-[#551A0C]" : "text-[#8C6D53]"} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#551A0C] text-[#DFB574] text-[9px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-80 bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl shadow-2xl overflow-hidden z-50 border-classic-frame">
                  <div className="p-4 border-b border-[#E7DFD5] text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[#8C6D53]">
                    ✦ RECENT TRANSMISSIONS
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {localNotifications.length === 0 ? (
                      <div className="p-8 text-center text-[#8C6D53] text-xs font-mono">No new transmissions.</div>
                    ) : (
                      localNotifications.map((notif: any) => (
                        <div key={notif.id} className={`p-4 border-b border-[#E7DFD5] ${notif.isRead ? 'opacity-60' : 'bg-[#FAF6F0]'}`}>
                          <div className="font-bold text-xs font-serif text-[#551A0C] mb-1">{notif.title}</div>
                          <div className="text-xs text-[#6A5749] font-mono mb-2">{notif.message}</div>
                          <div className="text-[9px] text-[#8C6D53] font-mono uppercase tracking-widest">{formatDate(notif.createdAt)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-2xl p-4 min-w-[110px] text-center shadow-sm">
              <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-mono font-bold mb-1">Bookings</div>
              <div className="text-2xl font-black font-serif text-[#551A0C]">{aggregates.totalBookings}</div>
            </div>
            <div className="bg-[#FAF6F0] border border-[#C89D5C]/30 rounded-2xl p-4 min-w-[140px] text-center shadow-sm">
              <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-mono font-bold mb-1">Active Deposit</div>
              <div className="text-2xl font-black font-serif text-[#551A0C]">₹{aggregates.activeDeposits.toLocaleString()}</div>
            </div>
            <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-2xl p-4 min-w-[110px] text-center shadow-sm">
              <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-mono font-bold mb-1">Tier</div>
              <div className="text-xl font-black font-serif text-[#C89D5C]">SOVEREIGN</div>
            </div>
          </div>
        </div>

        {/* === MAIN GRID === */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-4 shadow-xl border-classic-frame">
              <div className="text-[10px] text-[#8C6D53] uppercase font-bold font-mono tracking-[0.2em] mb-4 px-4 pt-2">
                ✦ CONCIERGE MENU
              </div>
              <nav className="space-y-1.5">
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
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-[0.14em] transition-all cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40 shadow-lg' 
                        : 'text-[#6A5749] hover:text-[#551A0C] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    <item.icon size={16} className={activeTab === item.id ? 'text-[#DFB574]' : 'text-[#8C6D53]'} /> {item.label}
                  </button>
                ))}
                
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-[0.14em] transition-colors text-[#8C6D53] hover:text-red-700 hover:bg-red-50 mt-2 border border-transparent hover:border-red-200 cursor-pointer"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </nav>
            </div>

            <div className="bg-[#250903] text-white border border-[#C89D5C]/30 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-[#DFB574] font-serif font-bold text-xs uppercase tracking-widest mb-3">
                <Sparkles size={14} className="text-[#C89D5C]" /> Royal Privilege Desk
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed font-normal">
                As a Sovereign Member, you get 24/7 dedicated dispatch priority over lakefront lines. Toll exemptions on highway packages applied automatically.
              </p>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 space-y-6">
            
            {/* TAB: MY BOOKINGS */}
            {activeTab === 'bookings' && (
              <>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-1">LIVE TRAVEL LOG</h2>
                    <p className="text-[10px] text-[#8C6D53] font-mono">Coordinated scheduled excursions & premium reservations</p>
                  </div>
                  <Link href="/self-drive">
                    <button className="btn-luxury btn-luxury-shine font-serif font-bold uppercase tracking-[0.16em] px-6 py-3 rounded-xl text-[10px] transition-all flex items-center gap-2 shadow-lg cursor-pointer">
                      Reserve Fleet Marque <ChevronRight size={14} strokeWidth={2} />
                    </button>
                  </Link>
                </div>

                {bookings.length === 0 ? (
                  <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-14 text-center text-[#8C6D53] font-mono text-xs uppercase tracking-widest border-classic-frame">
                    No active reservations found on your sovereign ledger.
                  </div>
                ) : (
                  bookings.map((booking) => {
                    const isActive = booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
                    return (
                      <div key={booking.id} className={`card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-7 hover:border-[#C89D5C] transition-all shadow-lg border-classic-frame ${!isActive && 'opacity-75 grayscale-[0.2]'}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-3 font-mono text-[10px] mb-2">
                              <span className="text-[#C89D5C] font-bold font-mono">✦ {booking.id.slice(-8).toUpperCase()}</span>
                              <span className="text-[#8C6D53]">•</span>
                              <span className="text-[#6A5749]">{formatDate(booking.startDate)}</span>
                              <span className={`${isActive ? 'bg-[#551A0C] text-[#DFB574] border-[#C89D5C]/40' : 'bg-[#250903] text-white/70 border-white/20'} border px-2.5 py-0.5 rounded font-bold uppercase tracking-widest text-[8px] font-mono`}>{booking.status}</span>
                            </div>
                            <h3 className={`text-xl font-bold font-serif uppercase tracking-tight mb-1 text-[#551A0C] ${!isActive && 'text-[#551A0C]/70'}`}>{booking.title}</h3>
                            <p className="text-[#6A5749] text-xs font-mono">{booking.desc}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-mono font-bold mb-0.5">OUTSTANDING DUE</div>
                            <div className={`text-2xl font-black font-serif text-[#551A0C] ${!isActive && 'text-[#8C6D53]'}`}>₹{booking.remainingAmount.toLocaleString()}</div>
                          </div>
                        </div>

                        {booking.status === 'REJECTED' && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <div className="text-red-700 font-bold uppercase text-[10px] tracking-widest mb-1 font-mono">Booking Rejected by Concierge</div>
                            <div className="text-[#250903] font-mono text-xs">{booking.rejectionReason}</div>
                            {booking.refundStatus !== 'NONE' && (
                              <div className="mt-2 text-xs font-bold font-mono">
                                Refund Status: <span className={booking.refundStatus === 'PROCESSED' ? 'text-green-700' : 'text-orange-600'}>{booking.refundStatus}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                          <div className="bg-[#FAF6F0] border border-[#E7DFD5] p-4 rounded-xl flex-1 border-classic-frame">
                            <div className="text-[9px] text-[#8C6D53] uppercase font-mono mb-1">Total Locked: <span className="font-bold font-serif text-sm text-[#250903]">₹{booking.totalAmount.toLocaleString()}</span></div>
                          </div>
                          {booking.depositAmount > 0 && (
                            <div className="bg-[#FAF6F0] border border-[#C89D5C]/30 p-4 rounded-xl flex-1 border-classic-frame">
                              <div className="text-[9px] text-[#8C6D53] uppercase font-mono mb-1">Security Hold: <span className="font-bold font-serif text-sm text-[#551A0C]">₹{booking.depositAmount.toLocaleString()}</span></div>
                            </div>
                          )}
                          <div className="bg-[#FAF6F0] border border-[#E7DFD5] p-4 rounded-xl flex-1 border-classic-frame">
                            <div className="text-[9px] text-[#8C6D53] uppercase font-mono mb-1">Advance Paid: <span className="font-bold font-serif text-sm text-[#C89D5C]">₹{booking.advancePaid.toLocaleString()}</span></div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-[#E7DFD5] pt-5">
                          {isActive && (
                            <button onClick={() => handleCancelBooking(booking.id)} className="text-[10px] font-bold font-mono uppercase tracking-wider text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg transition-colors border border-red-200 cursor-pointer">
                              Cancel Reservation
                            </button>
                          )}
                          <button onClick={() => { setActiveTab('invoices'); setShowReceiptModal(booking.id); }} className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#551A0C] hover:text-[#250903] border border-[#E7DFD5] bg-[#FAF6F0] hover:bg-[#FEFBF8] hover:border-[#C89D5C] px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
                            Show Sovereign Invoice
                          </button>
                          {isActive && booking.remainingAmount > 0 && (
                            <button onClick={() => handleRazorpayPayment(booking.id, booking.remainingAmount, `Settle outstanding for ${booking.id}`)} className="btn-luxury btn-luxury-shine text-[10px] font-serif font-bold uppercase tracking-[0.16em] px-6 py-2.5 rounded-lg shadow-md cursor-pointer">
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
              <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-8 md:p-10 shadow-xl border-classic-frame">
                <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-2">CLIENT REGISTRY CREDENTIALS</h2>
                <p className="text-[10px] text-[#8C6D53] font-mono mb-8">Maintain your verified security and travel authorization metadata</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-[10px] text-[#8C6D53] font-mono uppercase tracking-widest mb-2 block font-bold">FULL LEGAL NAME</label>
                    <input type="text" defaultValue={user.name} className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl px-4 py-3 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C6D53] font-mono uppercase tracking-widest mb-2 block font-bold">REGISTERED EMAIL</label>
                    <input type="email" defaultValue={user.email} className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl px-4 py-3 text-xs font-mono text-[#6A5749] outline-none opacity-80" disabled />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-[10px] text-[#8C6D53] font-mono uppercase tracking-widest mb-2 block font-bold">CONTACT COORDINATES</label>
                    <input type="text" defaultValue={user.phone || ''} className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl px-4 py-3 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8C6D53] font-mono uppercase tracking-widest mb-2 block font-bold">IDENTITY CLEARANCE</label>
                    <input type="text" defaultValue="DL-VERIFIED" className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl px-4 py-3 text-xs font-mono text-[#6A5749] outline-none opacity-80" disabled />
                  </div>
                </div>

                <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-classic-frame">
                  <div>
                    <div className="text-[10px] text-[#8C6D53] font-mono uppercase tracking-widest mb-1 font-bold">KYC STATUS AUDIT</div>
                    <div className="text-sm font-serif font-bold text-[#551A0C]">Identity verified & securely synced with sovereign databases.</div>
                  </div>
                  <div className="bg-[#551A0C] text-[#DFB574] text-[9px] font-bold font-mono uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-[#C89D5C]/40 shadow-sm">
                    ✦ KYC VERIFIED
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-[#E7DFD5]">
                  <button className="btn-luxury btn-luxury-shine font-serif font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.16em] shadow-lg cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* TAB: DIGITAL INVOICES */}
            {activeTab === 'invoices' && (
              <div>
                <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-2">SOVEREIGN INVOICES</h2>
                <p className="text-[10px] text-[#8C6D53] font-mono mb-8">Download structural GST breakdowns and official transaction receipts</p>
                
                <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl overflow-hidden shadow-xl border-classic-frame">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAF6F0] text-[9px] text-[#8C6D53] uppercase tracking-[0.18em] font-mono border-b border-[#E7DFD5]">
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
                         <tr><td colSpan={5} className="p-8 text-center text-[#8C6D53]">No invoices available on ledger.</td></tr>
                      ) : bookings.map((inv) => (
                        <tr key={inv.id} className="border-b border-[#E7DFD5] hover:bg-[#FAF6F0]/60 transition-colors">
                          <td className="p-6 font-bold font-mono text-[#C89D5C]">✦ {inv.id.slice(-8).toUpperCase()}</td>
                          <td className="p-6">
                            <div className="font-bold text-[#551A0C] text-xs mb-1 font-serif">{inv.title}</div>
                            <div className="text-[#6A5749]">{inv.desc}</div>
                          </td>
                          <td className="p-6 font-serif font-bold text-[#250903]">₹{inv.advancePaid.toLocaleString()}</td>
                          <td className="p-6 font-serif font-bold text-[#551A0C]">₹{inv.remainingAmount.toLocaleString()}</td>
                          <td className="p-6">
                            <button onClick={() => setShowReceiptModal(inv.id)} className="bg-[#FAF6F0] hover:bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] text-[#551A0C] px-4 py-2 rounded-lg font-serif font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm">
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
                <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-2">TRANSACTION LEDGER</h2>
                <p className="text-[10px] text-[#8C6D53] font-mono mb-8">Audit logs of all down-payments, deposits, and outstanding settlements</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl p-6 border-classic-frame shadow-sm">
                    <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-mono font-bold mb-2">CONSOLIDATED SPENT</div>
                    <div className="text-3xl font-black font-serif text-[#250903]">₹{aggregates.totalSpent.toLocaleString()}</div>
                  </div>
                  <div className="card-luxury bg-[#FEFBF8] border border-[#C89D5C]/40 rounded-2xl p-6 border-classic-frame shadow-sm">
                    <div className="text-[9px] text-[#C89D5C] uppercase tracking-widest font-mono font-bold mb-2">ADVANCE SETTLED</div>
                    <div className="text-3xl font-black font-serif text-[#551A0C]">₹{aggregates.advancedSettled.toLocaleString()}</div>
                  </div>
                  <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl p-6 border-classic-frame shadow-sm">
                    <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-mono font-bold mb-2">PENDING LATER (70%)</div>
                    <div className="text-3xl font-black font-serif text-[#250903]">₹{aggregates.pendingLater.toLocaleString()}</div>
                  </div>
                </div>

                <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-8 shadow-xl border-classic-frame">
                  <div className="text-[10px] text-[#8C6D53] uppercase tracking-[0.2em] font-mono font-bold mb-6 flex items-center gap-2">
                    <span className="text-[#C89D5C]">✦</span> AUTHORIZED GATEWAY LOGS
                  </div>
                  <div className="space-y-4">
                    {bookings.map(log => (
                      <div key={log.id} className="flex justify-between items-center bg-[#FAF6F0] border border-[#E7DFD5] p-5 rounded-2xl border-classic-frame">
                        <div>
                          <div className="font-bold text-xs mb-1 font-mono text-[#551A0C]">UPI Razorpay Transfer: {log.id.slice(-8).toUpperCase()}</div>
                          <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-mono">Gateway Status: VERIFIED SUCCESS</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#C89D5C] font-black font-serif text-base">+₹{log.advancePaid.toLocaleString()}</div>
                          <div className="text-[9px] text-[#8C6D53] font-mono mt-0.5">{formatDate(log.startDate)}</div>
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
                <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-2">SECURITY DEPOSIT ESCROW</h2>
                <p className="text-[10px] text-[#8C6D53] font-mono mb-8">Manage holds placed for self-drive safety covenants and automated returns</p>
                
                <div className="bg-[#250903] text-white border border-[#C89D5C]/30 rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 shadow-xl">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40 flex items-center justify-center shrink-0">
                      <Banknote size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-serif uppercase tracking-tight mb-1 text-white">Consolidated Deposits Held</h3>
                      <p className="text-xs text-white/70 max-w-md leading-relaxed font-normal">Deposits protect against excess KM or exterior scratches. Released immediately upon vehicle clearance check.</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-4xl font-black font-serif text-[#DFB574] tracking-tight mb-1">₹{aggregates.activeDeposits.toLocaleString()}</div>
                    <div className="text-[9px] text-[#C89D5C] uppercase tracking-widest font-mono font-bold">100% ESCROW PROTECTED</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {bookings.filter(b => b.depositAmount > 0).map(booking => (
                    <div key={booking.id} className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] p-6 rounded-3xl flex justify-between items-center border-classic-frame shadow-sm">
                      <div>
                        <div className="text-[9px] text-[#8C6D53] uppercase font-mono tracking-widest mb-2 bg-[#FAF6F0] inline-block px-2.5 py-1 rounded border border-[#E7DFD5]">ESCROW REF #{booking.id.slice(-8).toUpperCase()}</div>
                        <div className="font-bold font-serif text-lg uppercase tracking-tight text-[#551A0C] mb-1">{booking.title}</div>
                        <div className="text-xs font-mono text-[#6A5749]">Held: <span className="text-[#551A0C] font-bold">₹{booking.depositAmount.toLocaleString()}</span> &bull; Returned automatically to source account</div>
                      </div>
                      <div className="flex items-center gap-2 text-[#C89D5C] font-mono text-xs font-bold">
                        <span className="animate-pulse">✦</span> Active Hold
                      </div>
                    </div>
                  ))}
                  {bookings.filter(b => b.depositAmount > 0).length === 0 && (
                    <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] text-center py-14 text-[#8C6D53] text-xs font-mono uppercase tracking-widest rounded-3xl border-classic-frame">
                      No active security deposits under hold.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: WISHLIST (DYNAMIC) */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-2">SAVED ROYAL WISHLIST</h2>
                <p className="text-[10px] text-[#8C6D53] font-mono mb-8">Curated configurations of premium grand tourers, private expeditions, and heritage palaces</p>
                
                {localWishlist.length === 0 ? (
                  <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-14 text-center text-[#8C6D53] font-mono text-xs uppercase tracking-widest border-classic-frame">
                    Your sovereign wishlist is currently empty.
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
                        <div key={item.id} className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] p-5 rounded-2xl flex gap-4 relative group hover:border-[#C89D5C] transition-all border-classic-frame shadow-md">
                          <button 
                            onClick={() => handleRemoveWishlist(itemId, item.type, item.id)}
                            className="absolute top-3 right-3 text-[#8C6D53] hover:text-red-700 transition-colors z-10 cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <X size={15}/>
                          </button>
                          <div className="w-32 h-24 relative rounded-xl overflow-hidden bg-[#FAF6F0] flex-shrink-0 border border-[#E7DFD5]">
                            <Image src={imageSrc} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized/>
                          </div>
                          <div className="py-1">
                            <div className="text-[9px] text-[#C89D5C] uppercase font-bold font-mono tracking-widest mb-1">{badge}</div>
                            <div className="font-bold font-serif text-sm uppercase tracking-tight text-[#551A0C] mb-1 truncate max-w-[150px]">{title}</div>
                            <div className="text-[10px] font-mono text-[#8C6D53] mb-3">{desc} {priceStr && `• ${priceStr}`}</div>
                            <Link href={item.type === 'CAR' ? '/self-drive' : item.type === 'VILLA' ? '/villas' : '/tours'}>
                              <button className="text-[10px] font-bold font-serif text-[#551A0C] hover:text-[#C89D5C] flex items-center gap-1 uppercase tracking-widest transition-colors cursor-pointer">
                                Reserve Now <ChevronRight size={11}/>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div id="printable-receipt-modal" className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border-classic-frame">
            <div className="p-8 border-b border-[#E7DFD5] relative bg-[#FAF6F0]">
              <button onClick={() => setShowReceiptModal(null)} className="absolute top-8 right-8 border border-[#E7DFD5] hover:border-[#C89D5C] hover:bg-[#FEFBF8] px-3 py-1.5 rounded-lg text-xs font-mono text-[#551A0C] flex items-center gap-2 transition-colors cursor-pointer">
                Close <X size={14}/>
              </button>
              
              <div className="bg-[#551A0C] text-[#DFB574] text-[9px] font-bold font-mono uppercase tracking-[0.2em] inline-block px-3 py-1 rounded-full mb-3 border border-[#C89D5C]/40">
                ✦ OFFICIAL ROYAL RECEIPT
              </div>
              <h2 className="text-3xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-1">GORIDEZ</h2>
              <p className="text-[10px] text-[#8C6D53] font-mono tracking-[0.25em] uppercase">RAJASTHAN CONCIERGE &bull; FLEET AUDIT</p>
            </div>
            
            <div className="p-8 space-y-6 font-mono">
              <div className="flex justify-between text-xs border-b border-[#E7DFD5] pb-6">
                <div>
                  <div className="text-[#8C6D53] text-[10px] mb-1 uppercase tracking-wider">CLIENT DETAILS:</div>
                  <div className="font-bold font-serif text-[#551A0C] text-base">{activeInvoice.driverName || user.name}</div>
                  <div className="text-[#6A5749]">{activeInvoice.driverPhone || user.phone || user.email}</div>
                  {activeInvoice.driverEmail && <div className="text-[#6A5749]">{activeInvoice.driverEmail}</div>}
                </div>
                <div className="text-right">
                  <div className="text-[#8C6D53] text-[10px] mb-1 uppercase tracking-wider">LEDGER REFERENCE:</div>
                  <div className="font-bold font-mono text-[#C89D5C] text-base">✦ {activeInvoice.id.slice(-8).toUpperCase()}</div>
                  <div className="text-[#6A5749]">{formatDate(activeInvoice.startDate)}</div>
                </div>
              </div>

              <div>
                <div className="text-[#8C6D53] text-[10px] mb-2 uppercase tracking-wider">RESERVATION BREAKDOWN:</div>
                <div className="bg-[#FAF6F0] rounded-xl p-5 border border-[#E7DFD5]">
                  <div className="flex justify-between font-bold text-sm mb-2 font-serif text-[#551A0C]">
                    <div>{activeInvoice.title}</div>
                    <div>₹{Math.round(activeInvoice.totalAmount / 1.18).toLocaleString()}</div>
                  </div>
                  <div className="text-[#6A5749] text-xs font-mono">{activeInvoice.desc}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-b border-[#E7DFD5] pb-6">
                <div className="flex justify-between text-[#6A5749]">
                  <div>BASE FARE COMPONENT</div>
                  <div className="font-bold text-[#250903]">₹{Math.round(activeInvoice.totalAmount / 1.18).toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-[#6A5749]">
                  <div>TAXES (18% GST APPLICABLE)</div>
                  <div className="font-bold text-[#250903]">₹{Math.round(activeInvoice.totalAmount - (activeInvoice.totalAmount / 1.18)).toLocaleString()}</div>
                </div>
                {activeInvoice.depositAmount > 0 && (
                  <div className="flex justify-between font-bold text-[#551A0C] pt-2">
                    <div>100% REFUNDABLE SECURITY DEPOSIT</div>
                    <div className="text-[#C89D5C]">₹{activeInvoice.depositAmount.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-xl font-bold font-serif text-[#551A0C] border-b border-[#E7DFD5] pb-6">
                <div>Total Package Locked</div>
                <div>₹{(activeInvoice.totalAmount + activeInvoice.depositAmount).toLocaleString()}</div>
              </div>

              <div className="bg-[#250903] text-white rounded-xl p-5 text-xs space-y-2 border border-[#C89D5C]/30">
                <div className="flex justify-between text-white/80">
                  <div>Advance Hold Settled</div>
                  <div className="font-bold text-[#DFB574]">₹{activeInvoice.advancePaid.toLocaleString()}</div>
                </div>
                <div className="flex justify-between text-white/80">
                  <div>Outstanding Balances (At Delivery)</div>
                  <div className="font-bold text-white">₹{activeInvoice.remainingAmount.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="text-center text-[9px] text-[#8C6D53] tracking-widest flex justify-center items-center gap-2">
                <Lock size={10} className="text-[#C89D5C]"/> 256-BIT ENCRYPTED RAZORPAY / CASH ON CONVENIENCE TRANSACTION.
              </div>
            </div>

            <div className="p-8 pt-0 print:hidden">
              <button 
                onClick={() => window.print()}
                className="btn-luxury btn-luxury-shine w-full font-serif font-bold text-xs uppercase tracking-[0.18em] py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg cursor-pointer"
              >
                 Print / Save Official Invoice PDF
              </button>
            </div>
            
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-receipt-modal, #printable-receipt-modal * {
                  visibility: visible;
                }
                #printable-receipt-modal {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  background: white !important;
                  border: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
