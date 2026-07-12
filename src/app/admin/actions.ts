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

    const extraHourCharge = formData.get('extraHourCharge') ? parseFloat(formData.get('extraHourCharge') as string) : null;
    const nightCharge = formData.get('nightCharge') ? parseFloat(formData.get('nightCharge') as string) : null;
    const nightChargeStart = formData.get('nightChargeStart') as string || null;
    const nightChargeEnd = formData.get('nightChargeEnd') as string || null;
    const driverAllowanceDay = formData.get('driverAllowanceDay') ? parseFloat(formData.get('driverAllowanceDay') as string) : null;
    const driverAllowanceOut = formData.get('driverAllowanceOut') ? parseFloat(formData.get('driverAllowanceOut') as string) : null;

    const cityIdsRaw = formData.get('cityIds') as string;
    const cityIds: string[] = cityIdsRaw ? JSON.parse(cityIdsRaw) : [];
    const primaryCityId = cityIds.length > 0 ? cityIds[0] : null;

    const serviceTypesRaw = formData.get('serviceTypes') as string;
    const serviceTypes: string[] = serviceTypesRaw ? JSON.parse(serviceTypesRaw) : ['SELF_DRIVE'];

    const featuresRaw = formData.get('features') as string;
    const features: string[] = featuresRaw ? JSON.parse(featuresRaw) : [];

    const packagesRaw = formData.get('packages') as string;
    const packagesData: Array<{
      name: string; type: string; basePrice: string;
      limitValue: string; extraChargePerUnit: string; deposit: string;
    }> = packagesRaw ? JSON.parse(packagesRaw) : [];

    const parts = fullName.split(' ');
    const make = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || 'Model';

    const galleryRaw = formData.get('gallery') as string;
    const gallery = galleryRaw ? galleryRaw : '[]';

    await prisma.car.update({
      where: { id },
      data: {
        make, model, category, image, gallery, fuelType, transmission,
        seatingCapacity, cityId: primaryCityId, availability, content,
        serviceTypes, features,
        extraHourCharge, nightCharge, nightChargeStart, nightChargeEnd, driverAllowanceDay, driverAllowanceOut,
        packages: {
          deleteMany: {},
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

// --- VEHICLES ---
export async function duplicateVehicle(id: string) {
  try {
    const originalCar = await prisma.car.findUnique({
      where: { id },
      include: { packages: true }
    });

    if (!originalCar) {
      return { success: false, error: 'Original vehicle not found' };
    }

    const { id: _, createdAt, updatedAt, packages, ...carData } = originalCar;

    await prisma.car.create({
      data: {
        ...carData,
        make: `${carData.make} (Copy)`,
        availability: false, // Set to false by default for copies so they don't accidentally go live
        packages: {
          create: packages.map(p => {
            const { id: __, carId, createdAt, updatedAt, ...pkgData } = p;
            return pkgData;
          })
        }
      }
    });

    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to duplicate vehicle:', error);
    return { success: false, error: error.message };
  }
}

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
    const seatingCapacity = parseInt(formData.get('seatingCapacity') as string) || 4;
    const content = formData.get('content') as string || '';

    const extraHourCharge = formData.get('extraHourCharge') ? parseFloat(formData.get('extraHourCharge') as string) : null;
    const nightCharge = formData.get('nightCharge') ? parseFloat(formData.get('nightCharge') as string) : null;
    const nightChargeStart = formData.get('nightChargeStart') as string || null;
    const nightChargeEnd = formData.get('nightChargeEnd') as string || null;
    const driverAllowanceDay = formData.get('driverAllowanceDay') ? parseFloat(formData.get('driverAllowanceDay') as string) : null;
    const driverAllowanceOut = formData.get('driverAllowanceOut') ? parseFloat(formData.get('driverAllowanceOut') as string) : null;

    const cityIdsRaw = formData.get('cityIds') as string;
    const cityIds: string[] = cityIdsRaw ? JSON.parse(cityIdsRaw) : [];
    const primaryCityId = cityIds.length > 0 ? cityIds[0] : null;

    const serviceTypesRaw = formData.get('serviceTypes') as string;
    const serviceTypes: string[] = serviceTypesRaw ? JSON.parse(serviceTypesRaw) : ['SELF_DRIVE'];

    const featuresRaw = formData.get('features') as string;
    const features: string[] = featuresRaw ? JSON.parse(featuresRaw) : [];

    // Dynamic packages: read JSON array from form
    const packagesRaw = formData.get('packages') as string;
    const packagesData: Array<{
      name: string; type: string; basePrice: string;
      limitValue: string; extraChargePerUnit: string; deposit: string;
    }> = packagesRaw ? JSON.parse(packagesRaw) : [];

    const parts = fullName.split(' ');
    const make = parts[0] || 'Unknown';
    const model = parts.slice(1).join(' ') || 'Model';

    const galleryRaw = formData.get('gallery') as string;
    const gallery = galleryRaw ? galleryRaw : '[]';

    await prisma.car.create({
      data: {
        make,
        model,
        category,
        image,
        gallery,
        fuelType,
        transmission,
        seatingCapacity,
        cityId: primaryCityId,
        content,
        serviceTypes,
        features,
        extraHourCharge,
        nightCharge,
        nightChargeStart,
        nightChargeEnd,
        driverAllowanceDay,
        driverAllowanceOut,
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

// --- HOME PAGE ---
export async function updateHomePage(formData: FormData) {
  try {
    const data = {
      heroBadge: formData.get('heroBadge') as string,
      heroTitleLine1: formData.get('heroTitleLine1') as string,
      heroTitleLine2: formData.get('heroTitleLine2') as string,
      heroDescription: formData.get('heroDescription') as string,
      heroBgImage: formData.get('heroBgImage') as string,
      heroVideoUrl: formData.get('heroVideoUrl') as string,
      seamlessBadge: formData.get('seamlessBadge') as string,
      seamlessTitle: formData.get('seamlessTitle') as string,
      seamlessTitleHighlight: formData.get('seamlessTitleHighlight') as string,
      seamlessDescription: formData.get('seamlessDescription') as string,
      vehiclesBadge: formData.get('vehiclesBadge') as string,
      vehiclesTitle: formData.get('vehiclesTitle') as string,
      vehiclesTitleHighlight: formData.get('vehiclesTitleHighlight') as string,
      vehiclesDescription: formData.get('vehiclesDescription') as string,
      villasBadge: formData.get('villasBadge') as string,
      villasTitle: formData.get('villasTitle') as string,
      villasTitleHighlight: formData.get('villasTitleHighlight') as string,
      villasDescription: formData.get('villasDescription') as string,
      toursTitle: formData.get('toursTitle') as string,
      toursTitleHighlight: formData.get('toursTitleHighlight') as string,
      toursDescription: formData.get('toursDescription') as string,
      blogsBadge: formData.get('blogsBadge') as string,
      blogsTitle: formData.get('blogsTitle') as string,
      blogsTitleHighlight: formData.get('blogsTitleHighlight') as string,
    };

    await prisma.homePage.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data }
    });
    revalidatePath('/');
    revalidatePath('/admin/home-page');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- DELIVERY CHARGES ---
export async function deleteDeliveryCharge(id: string) {
  try {
    await prisma.deliveryCharge.delete({ where: { id } });
    revalidatePath('/admin/pricing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertDeliveryCharge(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const cityId = formData.get('cityId') as string;
    const category = formData.get('category') as string;
    const airportPickup = parseFloat(formData.get('airportPickup') as string) || 0;
    const airportDrop = parseFloat(formData.get('airportDrop') as string) || 0;
    const railwayPickup = parseFloat(formData.get('railwayPickup') as string) || 0;
    const railwayDrop = parseFloat(formData.get('railwayDrop') as string) || 0;
    const lateNightStart = formData.get('lateNightStart') as string || '22:00';
    const lateNightEnd = formData.get('lateNightEnd') as string || '06:00';
    const notes = formData.get('notes') as string || '';

    if (!cityId || !category) return { success: false, error: 'City and Category are required' };

    if (id) {
      await prisma.deliveryCharge.update({
        where: { id },
        data: { cityId, category, airportPickup, airportDrop, railwayPickup, railwayDrop, lateNightStart, lateNightEnd, notes }
      });
    } else {
      await prisma.deliveryCharge.create({
        data: { cityId, category, airportPickup, airportDrop, railwayPickup, railwayDrop, lateNightStart, lateNightEnd, notes }
      });
    }

    revalidatePath('/admin/pricing');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- TAXI FARE SETTINGS ---
export async function saveTaxiFareSetting(data: any) {
  try {
    const { vehicleCategory, ...rest } = data;
    await prisma.taxiFareSetting.upsert({
      where: { vehicleCategory },
      update: {
        airportBaseFare: parseFloat(rest.airportBaseFare) || 0,
        airportRatePerKm: parseFloat(rest.airportRatePerKm) || 0,
        airportMinFare: parseFloat(rest.airportMinFare) || 0,
        roundTripRatePerKm: parseFloat(rest.roundTripRatePerKm) || 0,
        roundTripMinKmPerDay: parseInt(rest.roundTripMinKmPerDay) || 0,
        driverAllowancePerDay: parseFloat(rest.driverAllowancePerDay) || 0,
      },
      create: {
        vehicleCategory,
        airportBaseFare: parseFloat(rest.airportBaseFare) || 0,
        airportRatePerKm: parseFloat(rest.airportRatePerKm) || 0,
        airportMinFare: parseFloat(rest.airportMinFare) || 0,
        roundTripRatePerKm: parseFloat(rest.roundTripRatePerKm) || 0,
        roundTripMinKmPerDay: parseInt(rest.roundTripMinKmPerDay) || 0,
        driverAllowancePerDay: parseFloat(rest.driverAllowancePerDay) || 0,
      }
    });
    revalidatePath('/admin/transfers');
    revalidatePath('/taxi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTaxiFareSetting(id: string) {
  try {
    await prisma.taxiFareSetting.delete({ where: { id } });
    revalidatePath('/admin/transfers');
    revalidatePath('/taxi');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- SITE SETTINGS ---
export async function updateSiteSettings(formData: FormData) {
  try {
    const data = {
      logoRidez: formData.get('logoRidez') as string || "/logo-ridez.png",
      logoFull: formData.get('logoFull') as string || "/logo-full.png",
      favicon: formData.get('favicon') as string || "/favicon.ico",
      copyrightText: formData.get('copyrightText') as string || "© GoRidez. All rights reserved.",
      razorpayKeyId: formData.get('razorpayKeyId') as string || "rzp_test_mockkey123",
      razorpayKeySecret: formData.get('razorpayKeySecret') as string || "mocksecret123",
    };

    await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- LEGAL PAGES ---
const LEGAL_PAGE_ROUTES: Record<string, string> = {
  privacy: '/privacy',
  terms: '/terms',
  'cancellation-refund': '/cancellation-refund',
  'shipping-policy': '/shipping-policy',
  contact: '/contact',
};

export async function updateLegalPage(id: string, formData: FormData) {
  if (!LEGAL_PAGE_ROUTES[id]) {
    return { success: false, error: 'Unknown legal page' };
  }

  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageUrl = (formData.get('imageUrl') as string) || null;

    await prisma.legalPage.upsert({
      where: { id },
      update: { title, content, imageUrl },
      create: { id, title, content, imageUrl }
    });

    revalidatePath(LEGAL_PAGE_ROUTES[id]);
    revalidatePath('/admin/legal');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateContactSubmissionStatus(id: string, status: string) {
  try {
    await prisma.contactSubmission.update({ where: { id }, data: { status } });
    revalidatePath('/admin/legal');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteContactSubmission(id: string) {
  try {
    await prisma.contactSubmission.delete({ where: { id } });
    revalidatePath('/admin/legal');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- INSTAGRAM REELS ---
function normalizeInstagramUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (!url.hostname.includes('instagram.com')) return null;
    const match = url.pathname.match(/\/(reel|reels|p)\/([^/]+)/);
    if (!match) return null;
    return `https://www.instagram.com/${match[1]}/${match[2]}/`;
  } catch {
    return null;
  }
}

export async function createInstagramReel(formData: FormData) {
  try {
    const rawUrl = formData.get('url') as string;
    const caption = (formData.get('caption') as string) || null;
    const url = normalizeInstagramUrl(rawUrl);

    if (!url) {
      return { success: false, error: 'Enter a valid Instagram reel or post URL.' };
    }

    const maxOrder = await prisma.instagramReel.aggregate({ _max: { order: true } });

    await prisma.instagramReel.create({
      data: { url, caption, order: (maxOrder._max.order ?? -1) + 1 }
    });

    revalidatePath('/admin/reels');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateInstagramReel(id: string, data: { caption?: string; isActive?: boolean }) {
  try {
    await prisma.instagramReel.update({ where: { id }, data });
    revalidatePath('/admin/reels');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reorderInstagramReel(id: string, direction: 'up' | 'down') {
  try {
    const reels = await prisma.instagramReel.findMany({ orderBy: { order: 'asc' } });
    const idx = reels.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, error: 'Reel not found' };
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= reels.length) return { success: true };

    const a = reels[idx];
    const b = reels[swapIdx];
    await prisma.$transaction([
      prisma.instagramReel.update({ where: { id: a.id }, data: { order: b.order } }),
      prisma.instagramReel.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);

    revalidatePath('/admin/reels');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteInstagramReel(id: string) {
  try {
    await prisma.instagramReel.delete({ where: { id } });
    revalidatePath('/admin/reels');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
