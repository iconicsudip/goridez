'use server';

import { prisma } from '@/lib/prisma';

interface CaptureInput {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  specialRequests?: string;
  cartItems?: unknown;
  pickupDate?: string | null;
  returnDate?: string | null;
}

/**
 * Saves (or updates) a snapshot of the checkout form as the customer fills it in — called
 * on a debounce from CheckoutClient, well before "Pay Securely" is ever clicked. This is the
 * only way an abandoned or never-submitted checkout leaves any trace for the business to
 * follow up on. Requires at least an email or phone (nothing actionable to save otherwise),
 * and upserts by whichever of those match an existing still-open lead so repeated auto-saves
 * from one visitor update a single row instead of spamming new ones.
 */
export async function captureAbandonedCheckout(input: CaptureInput) {
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;

  if (!email && !phone) return { success: false, skipped: true };

  try {
    const orMatch: { email?: string; phone?: string }[] = [];
    if (email) orMatch.push({ email });
    if (phone) orMatch.push({ phone });

    const existing = await prisma.checkoutLead.findFirst({
      where: { status: 'ABANDONED', OR: orMatch },
      orderBy: { updatedAt: 'desc' },
    });

    const data = {
      name: input.name?.trim() || null,
      email,
      phone,
      dob: input.dob || null,
      specialRequests: input.specialRequests?.trim() || null,
      cartSnapshot: input.cartItems ? JSON.stringify(input.cartItems) : null,
      pickupDate: input.pickupDate ? new Date(input.pickupDate) : null,
      returnDate: input.returnDate ? new Date(input.returnDate) : null,
    };

    const lead = existing
      ? await prisma.checkoutLead.update({ where: { id: existing.id }, data })
      : await prisma.checkoutLead.create({ data });

    return { success: true, leadId: lead.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Marks a captured lead as converted once its checkout actually completes, so it stops
 * showing up as an open abandoned lead for follow-up. */
export async function markCheckoutLeadConverted(leadId: string, bookingIds: string[]) {
  try {
    await prisma.checkoutLead.update({
      where: { id: leadId },
      data: { status: 'CONVERTED', convertedBookingIds: bookingIds.join(',') },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
