'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function createBooking(formData: FormData) {
  const user = await prisma.user.findFirst({ where: { role: 'USER' } })
  if (!user) throw new Error('User not found')

  const type = formData.get('type') as string;
  const itemId = formData.get('itemId') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  
  let totalAmount = 0;
  
  if (type === 'CAR') {
    totalAmount = 5000; // Dummy default for now
  } else if (type === 'TOUR') {
    const tour = await prisma.tour.findUnique({ where: { id: itemId }});
    totalAmount = tour?.adultPrice || 0;
  } else if (type === 'VILLA') {
    const villa = await prisma.villa.findUnique({ where: { id: itemId }});
    totalAmount = villa?.startingPrice || 0;
  }

  const advancePaid = totalAmount * 0.3;
  const remainingAmount = totalAmount - advancePaid;

  await prisma.booking.create({
    data: {
      userId: user.id,
      type,
      ...(type === 'CAR' ? { carId: itemId } : type === 'TOUR' ? { tourId: itemId } : { villaId: itemId }),
      startDate,
      endDate,
      totalAmount,
      advancePaid,
      remainingAmount,
      status: 'CONFIRMED',
      depositStatus: 'PAID'
    }
  })
  
  redirect('/dashboard')
}
