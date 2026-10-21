import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

const esc = (v: unknown) =>
  String(v ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

// Uses the server's local sendmail binary — no SMTP account/credentials needed.
function getTransporter() {
  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: process.env.SENDMAIL_PATH || '/usr/sbin/sendmail',
  });
}

/**
 * Marks bookings CONFIRMED and emails the admin about each booking that was
 * newly confirmed by this call. Safe to call from both the client verify route
 * and the Razorpay webhook: only the call that actually flips the status sends
 * the email, so the admin never gets duplicates.
 */
export async function confirmBookingsAndNotify(bookingIds: string[], paymentId?: string) {
  const newlyConfirmed: string[] = [];
  for (const id of bookingIds) {
    const res = await prisma.booking.updateMany({
      where: { id, status: { not: 'CONFIRMED' } },
      data: { status: 'CONFIRMED', ...(paymentId ? { razorpayPaymentId: paymentId } : {}) },
    });
    if (res.count > 0) newlyConfirmed.push(id);
  }
  if (newlyConfirmed.length === 0) return;

  try {
    await sendAdminBookingEmail(newlyConfirmed);
  } catch (err) {
    // Never fail payment confirmation because an email couldn't be sent.
    console.error('Admin booking email failed:', err);
  }
}

async function sendAdminBookingEmail(bookingIds: string[]) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const transporter = getTransporter();
  if (!adminEmail) {
    console.warn('Admin booking email skipped: set ADMIN_EMAIL.');
    return;
  }

  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
    include: { user: true, car: true, tour: true, villa: true },
  });
  if (bookings.length === 0) return;

  const blocks = bookings.map((b) => {
    const item = b.car ? `${b.car.make} ${b.car.model}` : b.tour?.title || b.villa?.name || '—';
    const rows: [string, string][] = [
      ['Booking ID', b.id.slice(-8).toUpperCase()],
      ['Type', `${b.type}${b.serviceSubtype ? ` (${b.serviceSubtype})` : ''}`],
      ['Item', item],
      ['Dates', `${fmtDate(b.startDate)} → ${fmtDate(b.endDate)}`],
      ['Pickup', b.pickupStation || '—'],
      ['Drop', b.dropStation || '—'],
      ['Customer', b.driverName || b.user.name],
      ['Phone', b.driverPhone || b.user.phone || '—'],
      ['Email', b.driverEmail || b.user.email],
      ['Total', inr(b.totalAmount)],
      ['Advance paid', inr(b.advancePaid)],
      ['Remaining', inr(b.remainingAmount)],
      ['Security deposit', inr(b.depositAmount)],
      ['Delivery fee', inr(b.deliveryFee || 0)],
      ['Special requests', b.specialRequests || '—'],
      ['Payment ID', b.razorpayPaymentId || '—'],
    ];
    return `<table style="border-collapse:collapse;margin:0 0 24px;font-size:14px">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`
      )
      .join('')}</table>`;
  });

  const first = bookings[0];
  const subject = `New booking${bookings.length > 1 ? 's' : ''} — ${first.driverName || first.user.name} (${bookings
    .map((b) => b.id.slice(-8).toUpperCase())
    .join(', ')})`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'GoRidez <no-reply@goridez.com>',
    to: adminEmail,
    subject,
    html: `<div style="font-family:Arial,sans-serif"><h2>New booking received</h2>${blocks.join('')}</div>`,
  });
}
