'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, UploadCloud, CheckCircle2, Sparkles, Percent, Gift, UserCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { captureAbandonedCheckout, markCheckoutLeadConverted } from './actions';

export default function CheckoutClient({ razorpayKeyId, guestCheckoutEnabled = false }: { razorpayKeyId?: string; guestCheckoutEnabled?: boolean }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, clearCart, session: bookingSession } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const leadIdRef = useRef<string | null>(null);
  const isSuccessRef = useRef(false);
  const isProcessingRef = useRef(false);

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

  const formRef = useRef(form);
  formRef.current = form;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  isSuccessRef.current = isSuccess;
  isProcessingRef.current = isProcessing;

  // Invoice calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENTAGE'
      ? Math.round(subtotal * (appliedCoupon.discountValue / 100))
      : appliedCoupon.discountValue
    : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gst = Math.round(discountedSubtotal * 0.18);
  const totalDeposit = cartItems.reduce((acc, item) => acc + item.deposit, 0);
  const totalAmount = discountedSubtotal + gst;
  const totalAmountRef = useRef(totalAmount);
  totalAmountRef.current = totalAmount;

  const getVisitorId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('goridez_checkout_visitor_id');
    if (!id) {
      id = 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      try { localStorage.setItem('goridez_checkout_visitor_id', id); } catch {}
    }
    return id;
  }, []);

  const saveCheckoutSnapshot = useCallback((stage: string = 'FILLING_FORM', useBeacon: boolean = false) => {
    if (isSuccessRef.current || cartItems.length === 0) return;
    const visitorId = getVisitorId();
    const currentForm = formRef.current;
    const payload = {
      leadId: leadIdRef.current,
      visitorId,
      name: currentForm.name,
      email: currentForm.email,
      phone: currentForm.phone,
      dob: currentForm.dob,
      specialRequests: currentForm.specialRequests,
      cartItems,
      totalAmount: totalAmountRef.current,
      dropStage: stage,
      pickupDate: bookingSession?.pickupDate,
      returnDate: bookingSession?.returnDate,
    };

    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/checkout/capture', blob);
        return;
      } catch {}
    }

    fetch('/api/checkout/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res.leadId) {
          leadIdRef.current = res.leadId;
        }
      })
      .catch(() => {});
  }, [cartItems, bookingSession, getVisitorId]);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated' && !guestCheckoutEnabled) {
      router.push('/login?callbackUrl=/checkout');
      return;
    }
    if (!isSuccess && cartItems.length === 0 && status !== 'loading') {
      router.push('/');
    }
  }, [cartItems.length, router, status, isSuccess, guestCheckoutEnabled]);

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

  // 1. Detect customer coming to checkout with cart immediately
  useEffect(() => {
    if (mounted && cartItems.length > 0 && !isSuccess) {
      saveCheckoutSnapshot('VIEWED_CHECKOUT');
    }
  }, [mounted, cartItems.length, isSuccess, saveCheckoutSnapshot]);

  // 2. Debounced auto-save as customer types in any form field
  useEffect(() => {
    const hasStarted = form.name.trim() || form.email.trim() || form.phone.trim() || form.dob.trim() || form.specialRequests.trim();
    if (!hasStarted) return;
    const timer = setTimeout(() => {
      saveCheckoutSnapshot('FILLING_FORM');
    }, 600);
    return () => clearTimeout(timer);
  }, [form.name, form.email, form.phone, form.dob, form.specialRequests, saveCheckoutSnapshot]);

  // 3. Detect when customer leaves the page, closes browser tab, or switches away
  useEffect(() => {
    const handleDrop = () => {
      if (isSuccessRef.current) return;
      const hasStarted = formRef.current.name.trim() || formRef.current.email.trim() || formRef.current.phone.trim();
      const stage = isProcessingRef.current
        ? 'PAYMENT_DISMISSED'
        : hasStarted
          ? 'DROPPED_FORM'
          : 'VIEWED_CHECKOUT';
      saveCheckoutSnapshot(stage, true);
    };

    window.addEventListener('pagehide', handleDrop);
    window.addEventListener('beforeunload', handleDrop);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') handleDrop();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pagehide', handleDrop);
      window.removeEventListener('beforeunload', handleDrop);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [saveCheckoutSnapshot]);

  if (!mounted || status === 'loading' || cartItems.length === 0) return null;
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
          key: razorpayKeyId || 'rzp_test_mockkey123',
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
                isSuccessRef.current = true;
                setIsSuccess(true);
                if (leadIdRef.current) {
                  markCheckoutLeadConverted(leadIdRef.current, orderData.bookingIds);
                }
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
          theme: { color: '#294B32' },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              saveCheckoutSnapshot('PAYMENT_DISMISSED');
            }
          }
        };

        saveCheckoutSnapshot('PAYMENT_OPENED');
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
    <div className="container mx-auto">
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 text-[#C89D5C] text-[11px] font-bold tracking-[0.25em] uppercase mb-3">
          <span>✦ GUARANTEED SOVEREIGN RESERVATION ✦</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-black uppercase tracking-tight mb-2 text-[#551A0C]">
          SECURE <span className="font-editorial italic font-normal text-[#C89D5C] lowercase">checkout</span>
        </h1>
        <p className="text-[#6A5749] text-sm">Finalize your distinguished carriage and chauffeur arrangements</p>
      </div>

      {status === 'unauthenticated' && guestCheckoutEnabled && (
        <div className="mb-10 p-4 card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <UserCheck size={18} className="text-[#C89D5C] shrink-0" />
            <p className="text-xs text-[#6A5749]">
              You&apos;re checking out as a <b>guest</b>. We&apos;ll use the details below to confirm your reservation.
            </p>
          </div>
          <Link
            href="/login?callbackUrl=/checkout"
            className="text-xs font-bold text-[#551A0C] hover:text-[#C89D5C] underline underline-offset-2 shrink-0 transition-colors"
          >
            Log in instead
          </Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Form & Identity */}
        <div className="flex-1 space-y-8">
          
          <section className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-7 md:p-9 shadow-sm">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-6 text-[#551A0C] flex items-center gap-2">
              <span className="text-[#C89D5C]">✦</span> 1. Primary Guest / Driver Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#8C6D53] tracking-[0.2em] uppercase mb-2 block">Full Legal Name <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Lord John Doe" 
                  value={form.name}
                  onBlur={() => saveCheckoutSnapshot('FILLING_FORM')}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full bg-[#FAF6F0] border rounded-xl px-4 py-3.5 outline-none focus:border-[#C89D5C] text-sm text-[#250903] shadow-xs transition-colors ${errors.name ? 'border-red-500' : 'border-[#E7DFD5]'}`} 
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.name}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C6D53] tracking-[0.2em] uppercase mb-2 block">Email Address <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="email" 
                  placeholder="e.g. john@example.com" 
                  value={form.email}
                  onBlur={() => saveCheckoutSnapshot('FILLING_FORM')}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`w-full bg-[#FAF6F0] border rounded-xl px-4 py-3.5 outline-none focus:border-[#C89D5C] text-sm text-[#250903] shadow-xs transition-colors ${errors.email ? 'border-red-500' : 'border-[#E7DFD5]'}`} 
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.email}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C6D53] tracking-[0.2em] uppercase mb-2 block">Phone Number <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 9876543210" 
                  value={form.phone}
                  onBlur={() => saveCheckoutSnapshot('FILLING_FORM')}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  className={`w-full bg-[#FAF6F0] border rounded-xl px-4 py-3.5 outline-none focus:border-[#C89D5C] text-sm text-[#250903] shadow-xs transition-colors ${errors.phone ? 'border-red-500' : 'border-[#E7DFD5]'}`} 
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8C6D53] tracking-[0.2em] uppercase mb-2 block">Date of Birth <span className="text-red-500 font-bold">*</span></label>
                <input 
                  type="date" 
                  placeholder="Date of Birth" 
                  value={form.dob}
                  onBlur={() => saveCheckoutSnapshot('FILLING_FORM')}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, dob: e.target.value }));
                    if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
                  }}
                  className={`w-full bg-[#FAF6F0] border rounded-xl px-4 py-3.5 outline-none focus:border-[#C89D5C] text-sm text-[#250903] shadow-xs transition-colors ${errors.dob ? 'border-red-500' : 'border-[#E7DFD5]'}`} 
                />
                {errors.dob && <p className="text-[10px] text-red-500 mt-1 pl-1 font-mono">{errors.dob}</p>}
              </div>
            </div>
          </section>

          <section className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-7 md:p-9 shadow-sm">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-6 flex items-center gap-2 text-[#551A0C]">
              <span className="text-[#C89D5C]">✦</span> 2. Identity Verification
              <ShieldCheck className="text-[#C89D5C]" size={20} />
            </h2>
            <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-2xl p-6">
              <p className="text-xs text-[#8C6D53] mb-6 leading-relaxed">
                Mandatory government identification required for insurance validation. Data is encrypted and securely stored.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#C89D5C] transition-colors bg-[#FEFBF8] ${errors.aadharFile ? 'border-red-400' : 'border-[#E7DFD5]'}`}>
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
                      <CheckCircle2 className="text-[#C89D5C] mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[#551A0C]">Aadhar / Passport Selected</div>
                      <div className="text-[9px] text-[#6A5749] truncate max-w-[200px]">{form.aadharFile}</div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-[#8C6D53] mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[#551A0C]">Aadhar / Passport <span className="text-red-500 font-bold">*</span></div>
                      <div className="text-[9px] text-[#8C6D53]">Upload Front &amp; Back (PDF, JPG)</div>
                    </>
                  )}
                </label>

                <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#C89D5C] transition-colors bg-[#FEFBF8] ${errors.dlFile ? 'border-red-400' : 'border-[#E7DFD5]'}`}>
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
                      <CheckCircle2 className="text-[#C89D5C] mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[#551A0C]">Driving License Selected</div>
                      <div className="text-[9px] text-[#6A5749] truncate max-w-[200px]">{form.dlFile}</div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="text-[#8C6D53] mb-3" size={28} />
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[#551A0C]">Driving License <span className="text-red-500 font-bold">*</span></div>
                      <div className="text-[9px] text-[#8C6D53]">Valid Indian or Int. License</div>
                    </>
                  )}
                </label>
              </div>
              
              {(errors.aadharFile || errors.dlFile) && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[10px] font-serif">
                  {errors.aadharFile && <p>• {errors.aadharFile}</p>}
                  {errors.dlFile && <p>• {errors.dlFile}</p>}
                </div>
              )}
            </div>
          </section>

          <section className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-7 md:p-9 shadow-sm">
            <h2 className="text-lg font-bold uppercase tracking-wide mb-6 text-[#551A0C] flex items-center gap-2">
              <span className="text-[#C89D5C]">✦</span> 3. Special Requests
            </h2>
            <textarea 
              rows={4}
              value={form.specialRequests}
              onBlur={() => saveCheckoutSnapshot('FILLING_FORM')}
              onChange={(e) => setForm(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Any specific delivery instructions, child seats, luggage requirements, or preferences?"
              className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl p-4 outline-none focus:border-[#C89D5C] text-sm text-[#250903] resize-none shadow-xs transition-colors"
            ></textarea>
          </section>

        </div>

        {/* Right Column: Voucher Live Receipt */}
        <aside className="w-full lg:w-[420px] shrink-0 font-serif">
          <div className="lg:sticky lg:top-28 card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-7 md:p-8 shadow-xl">
            
            <div className="text-[10px] font-bold text-[#C89D5C] uppercase tracking-[0.25em] mb-2">✦ Voucher Live Receipt ✦</div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#551A0C] mb-6 pb-4 border-b border-[#E7DFD5]">Regal Mobility Invoice</h2>

            {/* Items List */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-[#E7DFD5] pb-4">
                  <div className="flex-1 pr-4">
                    <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest font-bold mb-1">
                      {item.serviceType === 'selfDrive' ? 'Self Drive' : item.serviceType === 'withDriver' ? 'Chauffeur' : item.serviceType === 'villaCar' ? 'Villa Combo' : item.serviceType === 'oneWayTaxi' ? 'One Way Taxi' : item.serviceType === 'roundTripTaxi' ? 'Round Trip Taxi' : item.serviceType === 'airportTransfer' ? 'Airport Transfer' : item.serviceType === 'tours' ? 'Tour' : item.serviceType}
                    </div>
                    <div className="font-bold text-sm uppercase text-[#250903]">{item.title}</div>
                    {item.extraInfo && <div className="text-[10px] text-[#C89D5C] mt-1 font-sans">{item.extraInfo}</div>}
                    
                    {(item.pickupStation || item.dropStation) && (
                      <div className="mt-2 space-y-1">
                        {item.pickupStation && (
                          <div className="flex gap-1.5 text-[10px] text-[#6A5749]">
                            <span className="font-bold uppercase tracking-wider text-[#8C6D53]">Pickup:</span>
                            <span className="truncate">{item.pickupStation}</span>
                          </div>
                        )}
                        {item.dropStation && (
                          <div className="flex gap-1.5 text-[10px] text-[#6A5749]">
                            <span className="font-bold uppercase tracking-wider text-[#8C6D53]">Drop:</span>
                            <span className="truncate">{item.dropStation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-base font-black text-[#551A0C] text-right shrink-0">
                    ₹{item.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Selection */}
            <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Percent size={14} className="text-[#C89D5C]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#551A0C]">Apply Coupon Code</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="COUPON CODE" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-[#FEFBF8] border border-[#E7DFD5] rounded-lg px-3 py-2 text-xs uppercase tracking-wider outline-none focus:border-[#C89D5C] text-[#250903] disabled:opacity-50 font-serif"
                />
                {appliedCoupon ? (
                  <button 
                    onClick={handleRemoveCoupon}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-red-100 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    onClick={handleApplyCoupon}
                    className="btn-luxury btn-luxury-shine bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] px-4 py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer border border-[#C89D5C]/60 shadow-xs"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponError && <p className="text-[9px] text-red-600 mt-2 font-mono">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center gap-1.5 mt-3 text-[#551A0C] text-[10px] uppercase bg-[#FEFBF8] border border-[#C89D5C]/40 px-3 py-1.5 rounded-lg">
                  <Gift size={12} className="text-[#C89D5C]" />
                  <span>Success: <b>{appliedCoupon.code}</b> applied! (
                    {appliedCoupon.discountType === 'PERCENTAGE' 
                      ? `${appliedCoupon.discountValue}% off` 
                      : `₹${appliedCoupon.discountValue} flat discount`}
                  )</span>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl p-5 mb-6 space-y-3 text-xs tracking-wider">
              <div className="flex justify-between text-[#6A5749]">
                <span>Subtotal</span>
                <span className="font-bold text-[#250903]">₹{subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[#551A0C]">
                  <span>Coupon Discount</span>
                  <span className="font-bold">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6A5749]">
                <span>Total Tax Invoice (18% GST)</span>
                <span className="font-bold text-[#250903]">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#E7DFD5] pt-3 text-[#551A0C] font-bold text-sm">
                <span>Total Package Fare</span>
                <span className="text-base font-black">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#FAF6F0] border border-[#C89D5C]/40 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[#551A0C] uppercase tracking-widest">Advance Hold Deposit:</span>
                <span className="text-xl font-black text-[#551A0C]">₹{advanceHold.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-[#8C6D53] leading-relaxed">Remaining balance of ₹{(totalAmount - advanceHold).toLocaleString()} + Security Deposit of ₹{totalDeposit.toLocaleString()} payable at delivery.</div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#8C6D53] mb-6">
              <ShieldCheck size={14} className="shrink-0 text-[#C89D5C]" />
              <p>Identity records are cryptographically secured under GDPR guidelines.</p>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="btn-luxury btn-luxury-shine w-full bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] font-serif font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs border border-[#C89D5C]/60 cursor-pointer"
            >
              {isProcessing ? (
                <span className="animate-pulse">Processing Payment...</span>
              ) : (
                <>Pay Securely <span>₹{advanceHold.toLocaleString()}</span></>
              )}
            </button>

          </div>
        </aside>

      </div>
    </div>
  );
}
