import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, type } = await req.json();

    if (!itemId || !type) {
      return NextResponse.json({ error: 'Missing itemId or type' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if it already exists in wishlist
    const existingWishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: dbUser.id,
        type,
        ...(type === 'CAR' && { carId: itemId }),
        ...(type === 'TOUR' && { tourId: itemId }),
        ...(type === 'VILLA' && { villaId: itemId }),
      }
    });

    if (existingWishlistItems.length > 0) {
      // Remove it
      await prisma.wishlistItem.delete({
        where: { id: existingWishlistItems[0].id }
      });
      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add it
      await prisma.wishlistItem.create({
        data: {
          userId: dbUser.id,
          type,
          ...(type === 'CAR' && { carId: itemId }),
          ...(type === 'TOUR' && { tourId: itemId }),
          ...(type === 'VILLA' && { villaId: itemId }),
        }
      });
      return NextResponse.json({ success: true, action: 'added' });
    }

  } catch (error: any) {
    console.error('Wishlist Toggle Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
