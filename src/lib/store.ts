'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, quantity: number, size?: string, color?: string, variant?: ProductVariant) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      addItem: (product, quantity, size, color, variant) => {
        set((state) => {
          const key = `${product.id}-${size || ''}-${color || ''}`;
          const existing = state.items.find(
            (i) => `${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                `${i.product.id}-${i.selectedSize || ''}-${i.selectedColor || ''}` === key
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { product, variant, quantity, selectedSize: size, selectedColor: color }],
          };
        });
      },
      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && (i.selectedSize || '') === (size || ''))
          ),
        }));
      },
      updateQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && (i.selectedSize || '') === (size || '')
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),
      getTotal: () => get().items.reduce((t, i) => t + i.product.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((t, i) => t + i.quantity, 0),
    }),
    { name: 'noori-cart' }
  )
);

interface AuthStore {
  user: { id: string; email: string; role: string } | null;
  setUser: (user: AuthStore['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

interface UIStore {
  isSearchOpen: boolean;
  isMenuOpen: boolean;
  quickViewProduct: Product | null;
  toggleSearch: () => void;
  toggleMenu: () => void;
  setQuickView: (product: Product | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSearchOpen: false,
  isMenuOpen: false,
  quickViewProduct: null,
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  setQuickView: (product) => set({ quickViewProduct: product }),
}));
