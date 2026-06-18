import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ServiceType = 'selfDrive' | 'withDriver' | 'oneWayTaxi' | 'tours' | 'villaCar';

export type CartItem = {
  id: string; // Unique cart line item id
  serviceType: ServiceType;
  referenceId: string; // ID of the car/tour/villa
  packageId?: string; // Optional package selected
  title: string;
  image: string;
  price: number; // Base price for this item based on selected package
  deposit: number; // Refundable deposit
  extraInfo?: string; // e.g. "120 KM Package" or "4 Seats"
  pickupStation?: string; // 'CITY_CENTER' | 'AIRPORT' | 'RAILWAY'
  dropStation?: string;   // 'CITY_CENTER' | 'AIRPORT' | 'RAILWAY'
  deliveryFee?: number;
};

type BookingStore = {
  // Cart State
  cartItems: CartItem[];
  isCartOpen: boolean;
  
  // Cart Actions
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Legacy Session (keeping for backward compatibility temporarily if needed)
  session: any;
  updateSession: (updates: any) => void;
  clearSession: () => void;
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      cartItems: [],
      isCartOpen: false,

      addToCart: (item) => set((state) => ({ 
        cartItems: [...state.cartItems, { ...item, id: Math.random().toString(36).substring(2, 9) }],
        isCartOpen: true 
      })),
      removeFromCart: (id) => set((state) => ({ 
        cartItems: state.cartItems.filter(i => i.id !== id) 
      })),
      clearCart: () => set({ cartItems: [] }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      // Legacy session
      session: { 
        serviceType: 'selfDrive', 
        driverOption: false,
        pickupDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 10, 0, 0).toISOString(),
        returnDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 10, 0, 0).toISOString(),
      },
      updateSession: (updates) => set((state) => ({ session: { ...state.session, ...updates } })),
      clearSession: () => set({ 
        session: { 
          serviceType: 'selfDrive', 
          driverOption: false,
          pickupDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 10, 0, 0).toISOString(),
          returnDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, 10, 0, 0).toISOString(),
        } 
      }),
    }),
    {
      name: 'goridez-cart-storage',
      partialize: (state) => ({ cartItems: state.cartItems, session: state.session }),
    }
  )
);
