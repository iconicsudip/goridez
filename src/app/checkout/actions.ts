'use server';

import { prisma } from '@/lib/prisma';

export interface CaptureInput {
  leadId?: string | null;
  visitorId?: string | null;
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  specialRequests?: string;
  cartItems?: unknown;
  totalAmount?: number | null;
  dropStage?: string;
  pickupDate?: string | null;
  returnDate?: string | null;
}

/**
 * Saves (or updates) a snapshot of the checkout visit and form as the customer fills it in —
 * called immediately on checkout view, on debounced keystrokes, on input blur, and before tab close.
 * Links visits by leadId, visitorId, email, or phone.
 */
export async function captureAbandonedCheckout(input: CaptureInput) {
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;
  const name = input.name?.trim() || null;
  const visitorId = input.visitorId?.trim() || null;
  const leadId = input.leadId || null;

  try {
    let existing = null;

    if (leadId) {
      existing = await prisma.checkoutLead.findUnique({ where: { id: leadId } });
    }

    if (!existing) {
      const orConditions: any[] = [];
      if (email) orConditions.push({ email });
      if (phone) orConditions.push({ phone });
      if (visitorId) orConditions.push({ visitorId });

      if (orConditions.length > 0) {
        existing = await prisma.checkoutLead.findFirst({
          where: {
            status: 'ABANDONED',
            OR: orConditions,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          orderBy: { updatedAt: 'desc' },
        });
      }
    }

    const data: any = {
      visitorId: visitorId || existing?.visitorId || null,
      name: name || existing?.name || null,
      email: email || existing?.email || null,
      phone: phone || existing?.phone || null,
      dob: input.dob?.trim() || existing?.dob || null,
      specialRequests: input.specialRequests?.trim() || existing?.specialRequests || null,
      cartSnapshot: input.cartItems ? JSON.stringify(input.cartItems) : existing?.cartSnapshot || null,
      totalAmount: typeof input.totalAmount === 'number' ? input.totalAmount : existing?.totalAmount || null,
      dropStage: input.dropStage || existing?.dropStage || 'VIEWED_CHECKOUT',
      pickupDate: input.pickupDate ? new Date(input.pickupDate) : existing?.pickupDate || null,
      returnDate: input.returnDate ? new Date(input.returnDate) : existing?.returnDate || null,
    };

    const lead = existing
      ? await prisma.checkoutLead.update({ where: { id: existing.id }, data })
      : await prisma.checkoutLead.create({ data: { ...data, status: 'ABANDONED' } });

    return { success: true, leadId: lead.id, dropStage: lead.dropStage };
  } catch (error: any) {
    console.error('Error capturing checkout lead:', error);
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
