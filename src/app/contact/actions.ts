'use server';

import { prisma } from '@/lib/prisma';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    return { error: 'Please fill in your name, email, and message.' };
  }

  try {
    await prisma.contactSubmission.create({
      data: { name, email, phone: phone || null, subject: subject || null, message }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to send your message. Please try again.' };
  }
}
