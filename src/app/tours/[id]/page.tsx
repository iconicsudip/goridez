import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from '@/lib/prisma';
import { createBooking } from "@/actions/booking";

export default async function TourDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tour = await prisma.tour.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!tour) notFound();

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <div className="grid md:grid-cols-2">
        <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
          <Image 
            src={tour.image} 
            alt={tour.title}
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{tour.title}</h1>
          <p style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', marginBottom: '1rem', fontWeight: 'bold' }}>
            ${tour.adultPrice}
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            {tour.description}
          </p>
          <div style={{ marginBottom: '2rem', fontWeight: 500 }}>
            Duration: {tour.duration} {tour.duration === 1 ? 'day' : 'days'}
          </div>

          <form action={createBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="hidden" name="type" value="TOUR" />
            <input type="hidden" name="itemId" value={tour.id} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="startDate" style={{ fontWeight: 500 }}>Select Date</label>
              <input type="date" id="startDate" name="startDate" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            
            {/* For a tour, end date might be derived, but we'll collect it or just pass same date for now */}
            <input type="hidden" name="endDate" value="" id="endDateHidden" />

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} onClick={(e) => {
              const start = (document.getElementById('startDate') as HTMLInputElement).value;
              const endInput = document.getElementById('endDateHidden') as HTMLInputElement;
              if (start) {
                const endDate = new Date(start);
                endDate.setDate(endDate.getDate() + tour.duration);
                endInput.value = endDate.toISOString().split('T')[0];
              }
            }}>
              Book Tour
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
