'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShieldCheck, UploadCloud, CheckCircle2, Sparkles, Percent, Gift } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function CheckoutClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, clearCart, session: bookingSession } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    specialRequests: '',
    aadharFile: '',
    dlFile: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
      return;
    }
    if (!isSuccess && cartItems.length === 0 && status === 'authenticated') {
      router.push('/');
    }
  }, [cartItems.length, router, status, isSuccess]);

  // Prefill details from user session
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
      }));
    }
  }, [session]);

  if (!mounted || status === 'loading' || cartItems.length === 0) return null;

  // Invoice calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENTAGE'
      ? Math.round(subtotal * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gst = Math.round(discountedSubtotal * 0.12);
  const totalDeposit = cartItems.reduce((acc, item) => acc + item.deposit, 0);
  const totalAmount = discountedSubtotal + gst;
  const advanceHold = Math.round(totalAmount * 0.3); // 30% hold

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponError('');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePayment = async () => {
    // 1. Validation
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Legal Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.dob.trim()) newErrors.dob = 'Date of birth is required';
    if (!form.aadharFile) newErrors.aadharFile = 'Please upload Aadhar / Passport';
    if (!form.dlFile) newErrors.dlFile = 'Please upload Driving License';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsProcessing(true);

    try {
      // Prepare cart items with delivery data to be saved to booking
      const formattedCartItems = cartItems.map(item => ({
        ...item,
        pickupStation: item.pickupStation || null,
        dropStation: item.dropStation || null,
        deliveryFee: item.deliveryFee || 0
      }));

      // Create bookings & razorpay order on the backend
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: advanceHold,
          cartItems: formattedCartItems,
          driverDetails: form,
          couponCode: appliedCoupon?.code || null,
          discount,
          pickupDate: bookingSession?.pickupDate,
          returnDate: bookingSession?.returnDate,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.id) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Load Razorpay Script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'GoRidez',
          description: `Sovereign Advance Booking Hold`,
          order_id: orderData.id,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingIds: orderData.bookingIds,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setIsSuccess(true);
                clearCart();
                router.push(`/checkout/success?bookingIds=${orderData.bookingIds.join(',')}`);
              } else {
                alert('Payment verification failed: ' + verifyData.error);
                setIsProcessing(false);
              }
            } catch (err: any) {
              console.error(err);
              alert('Error during payment verification: ' + err.message);
              setIsProcessing(false);
            }
          },
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: '#C4F000' },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };

      script.onerror = () => {
        alert('Failed to load Razorpay SDK. Please check your network connection.');
        setIsProcessing(false);
      };

      document.body.appendChild(script);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred while setting up the payment.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
          SECURE <span className="text-outline-neon">CHECKOUT</span>
        </h1>
        <p className="text-white/50 text-sm">Finalize your Sovereign Travel-Tech Reservation</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Form & Identity */}
        <div className="flex-1 space-y-10">
          
          <section>
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">1. Primary Driver Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-2 block">Full Legal Name <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe" 
                  value={form.name}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full bg-[#111111] border rounded-xl px-4 py-4 outline-none focus:border-brand-neon text-sm ${errors.name ? 'border-red-500' : 'border-white/10'}`} 
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-2 block">Email Address <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="email" 
                  placeholder="e.g. john@example.com" 
                  value={form.email}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`w-full bg-[#111111] border rounded-xl px-4 py-4 outline-none focus:border-brand-neon text-sm ${errors.email ? 'border-red-500' : 'border-white/10'}`} 
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.email}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-2 block">Phone Number <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 9876543210" 
                  value={form.phone}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  className={`w-full bg-[#111111] border rounded-xl px-4 py-4 outline-none focus:border-brand-neon text-sm ${errors.phone ? 'border-red-500' : 'border-white/10'}`} 
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 tracking-widest uppercase mb-2 block">Date of Birth <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="date" 
                  placeholder="Date of Birth" 
                  value={form.dob}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, dob: e.target.value }));
                    if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
                  }}
                  className={`w-full bg-[#111111] border rounded-xl px-4 py-4 outline-none focus:border-brand-neon text-sm text-white/50 ${errors.dob ? 'border-red-500' : 'border-white/10'}`} 
                />
                {errors.dob && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.dob}</p>}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              2. Identity Verification
              <ShieldCheck className="text-brand-neon" size={20} />
            </h2>
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
              <p className="text-xs text-white/50 mb-6 font-mono">
                Mandatory government ID required for Self-Drive & Luxury rentals. Data is encrypted and automatically wiped post-trip under GDPR guidelines.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-neon/50 transition-colors bg-[#0A0A0A] ${errors.aadharFile ? 'border-red-500/50' : 'border-white/10'}`}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setForm(prev => ({ ...prev, aadharFile: file.name }));
                        setErrors(prev => ({ ...prev, aadharFile: '' }));
                      }
                    }}
                  />
                  {form.aadharFile ? (
                    <>
                      <CheckCircle2 className="text-brand-neon mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-brand-neon">Aadhar / Passport Selected</div>
                      <div className="text-[9px] text-white/60 truncate max-w-[200px]">{form.aadharFile}</div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-white/30 mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1">Aadhar / Passport <span className="text-red-500 font-bold">*</span></div>
                      <div className="text-[9px] text-white/40">Upload Front & Back (PDF, JPG)</div>
                    </>
                  )}
                </label>

                <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-neon/50 transition-colors bg-[#0A0A0A] ${errors.dlFile ? 'border-red-500/50' : 'border-white/10'}`}>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setForm(prev => ({ ...prev, dlFile: file.name }));
                        setErrors(prev => ({ ...prev, dlFile: '' }));
                      }
                    }}
                  />
                  {form.dlFile ? (
                    <>
                      <CheckCircle2 className="text-brand-neon mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-brand-neon">Driving License Selected</div>
                      <div className="text-[9px] text-white/60 truncate max-w-[200px]">{form.dlFile}</div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-white/30 mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1">Driving License <span className="text-red-500 font-bold">*</span></div>
                      <div className="text-[9px] text-white/40">Valid Indian or Int. License</div>
                    </>
                  )}
                </label>
              </div>
              
              {(errors.aadharFile || errors.dlFile) && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-mono">
                  {errors.aadharFile && <p>• {errors.aadharFile}</p>}
                  {errors.dlFile && <p>• {errors.dlFile}</p>}
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">3. Special Requests</h2>
            <textarea 
              rows={4}
              value={form.specialRequests}
              onChange={(e) => setForm(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Any specific delivery instructions, child seats, or preferences?"
              className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 outline-none focus:border-brand-neon text-sm resize-none"
            ></textarea>
          </section>

        </div>

        {/* Right Column: Voucher Live Receipt */}
        <aside className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-28 bg-[#0A0A0A] border-t-2 border-t-brand-neon border-x border-b border-white/10 rounded-b-3xl p-8 shadow-2xl">
            
            <div className="text-[10px] font-black text-brand-neon uppercase tracking-widest mb-2">Voucher Live Receipt</div>
            <h2 className="text-xl font-black uppercase tracking-widest mb-8">Regal Mobility Invoice</h2>

            {/* Items List */}
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="flex-1 pr-4">
                    <div className="text-[9px] text-white/50 uppercase tracking-widest font-mono mb-1">
                      {item.serviceType === 'selfDrive' ? 'Self Drive' : item.serviceType === 'withDriver' ? 'Chauffeur' : item.serviceType === 'villaCar' ? 'Villa Combo' : item.serviceType}
                    </div>
                    <div className="font-bold text-sm uppercase">{item.title}</div>
                    {item.extraInfo && <div className="text-[10px] text-brand-neon mt-1">{item.extraInfo}</div>}
                  </div>
                  <div className="text-sm font-bold text-right shrink-0">
                    ₹{item.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Selection */}
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Percent size={14} className="text-brand-neon" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Apply Coupon Code</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="COUPON CODE" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs uppercase tracking-wider outline-none focus:border-brand-neon text-white disabled:opacity-50 font-mono"
                />
                {appliedCoupon ? (
                  <button 
                    onClick={handleRemoveCoupon}
                    className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-500/20 transition-all"
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-brand-neon text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-brand-hover transition-all"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponError && <p className="text-[9px] text-red-500 mt-2 font-mono">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center gap-1.5 mt-3 text-brand-neon text-[10px] font-mono uppercase bg-brand-neon/10 border border-brand-neon/20 px-3 py-1.5 rounded-lg">
                  <Gift size={12} />
                  <span>Success: <b>{appliedCoupon.code}</b> applied! (
                    {appliedCoupon.discountType === 'PERCENTAGE' 
                      ? `${appliedCoupon.discountValue}% off` 
                      : `₹${appliedCoupon.discountValue} flat discount`}
                  )</span>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="bg-[#111111] rounded-xl p-5 mb-6 space-y-3 font-mono text-[11px] uppercase tracking-widest">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-brand-neon">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white/60">
                <span>Total Tax Invoice (12% GST)</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-white font-bold">
                <span>Total Package Fare</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#C4F000]/10 border border-[#C4F000]/30 rounded-xl p-5 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-brand-neon uppercase tracking-widest">Advance Hold Deposit:</span>
                <span className="text-xl font-black text-brand-neon">₹{advanceHold.toLocaleString()}</span>
              </div>
              <div className="text-[9px] text-brand-neon/60">Remaining balance of ₹{(totalAmount - advanceHold).toLocaleString()} + Security Deposit of ₹{totalDeposit.toLocaleString()} payable at delivery.</div>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-white/40 mb-6 font-mono">
              <ShieldCheck size={14} className="shrink-0 text-brand-neon" />
              <p>Identity records are heavily cryptographed under GDPR security guidelines.</p>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-brand-neon text-black font-black uppercase tracking-widest py-5 rounded-xl shadow-[0_0_20px_rgba(196,240,0,0.2)] hover:shadow-[0_0_30px_rgba(196,240,0,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>Pay Securely <span className="font-mono text-sm">₹{advanceHold.toLocaleString()}</span></>
              )}
            </button>

          </div>
        </aside>

      </div>
    </div>
  );
}
