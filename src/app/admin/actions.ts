'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- CITIES ---
export async function deleteCity(id: string) {
  await prisma.city.delete({ where: { id } });
  revalidatePath('/admin/cities');
}

export async function createCity(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const faqQuestion = formData.get('faqQuestion') as string;
    const faqAnswer = formData.get('faqAnswer') as string;
    if (!name) return { success: false, error: 'Name required' };
    await prisma.city.create({ data: { name, slug, faqQuestion, faqAnswer } });
    revalidatePath('/admin/cities');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCity(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const faqQuestion = formData.get('faqQuestion') as string;
    const faqAnswer = formData.get('faqAnswer') as string;
    if (!name) return { success: false, error: 'Name required' };
    await prisma.city.update({ where: { id }, data: { name, slug, faqQuestion, faqAnswer } });
    revalidatePath('/admin/cities');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- VEHICLES ---
export async function deleteCar(id: string) {
  await prisma.carPackage.deleteMany({ where: { carId: id } });
  await prisma.car.delete({ where: { id } });
  revalidatePath('/admin/vehicles');
}

export async function updateVehicle(id: string, formData: FormData) {
  try {
    const fullName = formData.get('vehicleName') as string;
    const category = formData.get('segmentType') as string;
    const image = formData.get('imageUrl') as string;
    const fuelType = formData.get('fuelType') as string;
    const transmission = formData.get('transmission') as string;
    const seatingCapacity = parseInt(formData.get('seatingCapacity') as string) || 4;
    const availability = formData.get('availability') === 'true';
    const content = formData.get('content') as string || '';

    const cityIdsRaw = formData.get('cityIds') as string;
    const cityIds: string[] = cityIdsRaw ? JSON.parse(cityIdsRaw) : [];
    const primaryCityId = cityIds.length > 0 ? cityIds[0] : null;

    const serviceTypesRaw = formData.get('serviceTypes') as string;
    const serviceTypes: string[] = serviceTypesRaw ? JSON.parse(serviceTypesRaw) : ['SELF_DRIVE'];

    const packagesRaw = formData.get('packages') as string;
    const packagesData: Array<{
      name: string; type: string; basePrice: string;
      limitValue: string; extraChargePerUnit: string; deposit: string;
    }> = packagesRaw ? JSON.parse(packagesRaw) : [];

    const parts = fullName.split(' ');
    const make = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || 'Model';

    // Replace all packages (delete old, create new)
    await prisma.carPackage.deleteMany({ where: { carId: id } });

    await prisma.car.update({
      where: { id },
      data: {
        make, model, category, image, fuelType, transmission,
        seatingCapacity, cityId: primaryCityId, availability, content,
        serviceTypes,
        packages: {
          create: packagesData.map(p => ({
            name: p.name,
            type: p.type,
            basePrice: parseFloat(p.basePrice) || 0,
            deposit: parseFloat(p.deposit) || 0,
            limitValue: p.limitValue ? parseInt(p.limitValue) : null,
            extraChargePerUnit: p.extraChargePerUnit ? parseFloat(p.extraChargePerUnit) : null,
          }))
        }
      }
    });

    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update vehicle:', error);
    return { success: false, error: error.message };
  }
}

// --- TOURS ---
export async function deleteTour(id: string) {
  await prisma.tour.delete({ where: { id } });
  revalidatePath('/admin/tours');
}

export async function addTour(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const adultPrice = parseFloat(formData.get('adultPrice') as string) || 0;
    const childPrice = parseFloat(formData.get('childPrice') as string) || 0;
    const duration = parseInt(formData.get('duration') as string) || 1;
    const image = formData.get('image') as string;
    const cityId = formData.get('cityId') as string;

    // For now, initializing JSON fields with empty arrays/objects
    const gallery = '[]';
    const itinerary = '[]';
    const included = '[]';
    const excluded = '[]';

    await prisma.tour.create({
      data: {
        title,
        description,
        adultPrice,
        childPrice,
        duration,
        image,
        cityId: cityId || null,
        gallery,
        itinerary,
        included,
        excluded
      }
    });

    revalidatePath('/admin/tours');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add tour:", error);
    return { success: false, error: error.message };
  }
}

// --- VILLAS ---
export async function deleteVilla(id: string) {
  await prisma.villa.delete({ where: { id } });
  revalidatePath('/admin/villas');
}

export async function addVilla(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const startingPrice = parseFloat(formData.get('startingPrice') as string) || 0;
    const occupancy = parseInt(formData.get('occupancy') as string) || 2;
    const image = formData.get('image') as string;
    const cityId = formData.get('cityId') as string;
    const amenitiesRaw = formData.get('amenities') as string;
    const amenities = JSON.stringify(amenitiesRaw ? amenitiesRaw.split(',').map((a: string) => a.trim()).filter(Boolean) : []);

    await prisma.villa.create({
      data: { name, description, location, startingPrice, occupancy, image, cityId: cityId || null, amenities, gallery: '[]', roomTypes: '[]' }
    });
    revalidatePath('/admin/villas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVilla(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const startingPrice = parseFloat(formData.get('startingPrice') as string) || 0;
    const occupancy = parseInt(formData.get('occupancy') as string) || 2;
    const image = formData.get('image') as string;
    const cityId = formData.get('cityId') as string;
    const amenitiesRaw = formData.get('amenities') as string;
    const amenities = JSON.stringify(amenitiesRaw ? amenitiesRaw.split(',').map((a: string) => a.trim()).filter(Boolean) : []);

    await prisma.villa.update({
      where: { id },
      data: { name, description, location, startingPrice, occupancy, image, cityId: cityId || null, amenities }
    });
    revalidatePath('/admin/villas');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTour(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const adultPrice = parseFloat(formData.get('adultPrice') as string) || 0;
    const childPrice = parseFloat(formData.get('childPrice') as string) || 0;
    const duration = parseInt(formData.get('duration') as string) || 1;
    const image = formData.get('image') as string;
    const cityId = formData.get('cityId') as string;

    await prisma.tour.update({
      where: { id },
      data: { title, description, adultPrice, childPrice, duration, image, cityId: cityId || null }
    });
    revalidatePath('/admin/tours');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- BOOKINGS ---
export async function updateBookingStatus(id: string, status: string) {
  await prisma.booking.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/bookings');
}

export async function addVehicle(formData: FormData) {
  try {
    const fullName = formData.get('vehicleName') as string;
    const category = formData.get('segmentType') as string;
    const image = formData.get('imageUrl') as string;
    const fuelType = formData.get('fuelType') as string;
    const transmission = formData.get('transmission') as string;
    const content = formData.get('content') as string || '';

    const cityIdsRaw = formData.get('cityIds') as string;
    const cityIds: string[] = cityIdsRaw ? JSON.parse(cityIdsRaw) : [];
    const primaryCityId = cityIds.length > 0 ? cityIds[0] : null;

    const serviceTypesRaw = formData.get('serviceTypes') as string;
    const serviceTypes: string[] = serviceTypesRaw ? JSON.parse(serviceTypesRaw) : ['SELF_DRIVE'];

    // Dynamic packages: read JSON array from form
    const packagesRaw = formData.get('packages') as string;
    const packagesData: Array<{
      name: string; type: string; basePrice: string;
      limitValue: string; extraChargePerUnit: string; deposit: string;
    }> = packagesRaw ? JSON.parse(packagesRaw) : [];

    const parts = fullName.split(' ');
    const make = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || 'Model';

    await prisma.car.create({
      data: {
        make,
        model,
        category,
        image,
        fuelType,
        transmission,
        seatingCapacity: 4,
        cityId: primaryCityId,
        content,
        serviceTypes,
        packages: {
          create: packagesData.map(p => ({
            name: p.name,
            type: p.type,
            basePrice: parseFloat(p.basePrice) || 0,
            deposit: parseFloat(p.deposit) || 0,
            limitValue: p.limitValue ? parseInt(p.limitValue) : null,
            extraChargePerUnit: p.extraChargePerUnit ? parseFloat(p.extraChargePerUnit) : null,
          }))
        }
      }
    });

    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add vehicle:", error);
    return { success: false, error: error.message };
  }
}

// --- PRICING RULES & TIERS ---

export async function updatePricingRule(id: string, data: { weekendMarkup?: number, festivalSurge?: number, dynamicSurgeActive?: boolean }) {
  try {
    await prisma.pricingRule.update({
      where: { id },
      data
    });
    revalidatePath('/admin/pricing');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update pricing rule:", error);
    return { success: false, error: error.message };
  }
}

export async function createGlobalPackageTier(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const basePricingInfo = formData.get('basePricingInfo') as string;
    const limitInfo = formData.get('limitInfo') as string;

    if (!name || !type) return { success: false, error: 'Name and Type are required' };

    await prisma.globalPackageTier.create({
      data: { name, type, basePricingInfo, limitInfo }
    });
    revalidatePath('/admin/pricing');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create package tier:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGlobalPackageTier(id: string) {
  try {
    await prisma.globalPackageTier.delete({ where: { id } });
    revalidatePath('/admin/pricing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateGlobalPackageTier(
  id: string,
  data: { name?: string; type?: string; basePricingInfo?: string; limitInfo?: string; isActive?: boolean }
) {
  try {
    await prisma.globalPackageTier.update({ where: { id }, data });
    revalidatePath('/admin/pricing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- COUPONS ---
export async function createCoupon(formData: FormData) {
  try {
    const code = formData.get('code') as string;
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const discountType = formData.get('discountType') as string;
    
    if (!code || isNaN(discountValue) || !discountType) {
      return { success: false, error: 'Invalid coupon data' };
    }
    
    await prisma.coupon.create({
      data: { code: code.toUpperCase(), discountValue, discountType, isActive: true }
    });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCoupon(id: string, isActive: boolean) {
  try {
    await prisma.coupon.update({ where: { id }, data: { isActive } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- BLOGS ---
export async function createBlog(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const content = formData.get('content') as string;
    const isDraft = formData.get('isDraft') === 'true';

    if (!title || !slug || !category) {
      return { success: false, error: 'Missing required fields' };
    }

    await prisma.blog.create({
      data: { title, slug, category, content: content || '', isDraft }
    });
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBlog(id: string, data: any) {
  try {
    await prisma.blog.update({ where: { id }, data });
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBlog(id: string) {
  try {
    await prisma.blog.delete({ where: { id } });
    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- FAQS ---
export async function createFaq(formData: FormData) {
  try {
    const question = formData.get('question') as string;
    const answer = formData.get('answer') as string;
    const isActive = formData.get('isActive') === 'true';

    if (!question || !answer) {
      return { success: false, error: 'Question and Answer are required' };
    }

    await prisma.fAQ.create({
      data: { question, answer, isActive }
    });
    revalidatePath('/admin/faqs');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFaq(id: string, data: any) {
  try {
    await prisma.fAQ.update({ where: { id }, data });
    revalidatePath('/admin/faqs');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteFaq(id: string) {
  try {
    await prisma.fAQ.delete({ where: { id } });
    revalidatePath('/admin/faqs');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- ABOUT PAGE ---
export async function updateAboutPage(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const content = formData.get('content') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await prisma.aboutPage.upsert({
      where: { id: 'singleton' },
      update: { title, subtitle, content, imageUrl },
      create: { id: 'singleton', title, subtitle, content, imageUrl }
    });
    revalidatePath('/about');
    revalidatePath('/admin/about');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


