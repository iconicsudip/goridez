'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;

  if (!name || !email || !password) {
    return { error: 'Missing required fields' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // An account with this email already exists, but if it was only ever created by
      // guest checkout (no password set), let them claim it instead of dead-ending —
      // this preserves their existing booking history under the new real account.
      if (existing.isGuest && !existing.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: existing.id },
          data: { name, password: hashedPassword, phone: phone || existing.phone, isGuest: false },
        });
        return { success: true };
      }
      return { error: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Registration failed due to server error' };
  }
}
