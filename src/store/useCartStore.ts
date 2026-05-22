import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItemType {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  quantity: number;
  negotiatedPrice?: number;
}

interface CartState {
  items: CartItemType[];
  addItem: (product: CartItemType['product'], quantity?: number, negotiatedPrice?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, negotiatedPrice) => {
        const { items } = get();
        const existingItemIndex = items.findIndex((item) => item.product.id === product.id);
        if (existingItemIndex > -1) {
          set({
            items: items.map((item, idx) =>
              idx === existingItemIndex
                ? {
                    ...item,
                    quantity: quantity,
                    negotiatedPrice: negotiatedPrice !== undefined ? negotiatedPrice : item.negotiatedPrice,
                  }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                quantity,
                negotiatedPrice: negotiatedPrice !== undefined ? negotiatedPrice : product.price,
              },
            ],
          });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.negotiatedPrice ?? item.product.price) * item.quantity, 0);
      },
    }),
    {
      name: 'daifort-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
