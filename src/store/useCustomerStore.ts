import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomerType {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lastOrderDate?: string | null;
  lastOrderTotal?: number | null;
}

interface CustomerState {
  selectedCustomer: CustomerType | null;
  selectCustomer: (customer: CustomerType) => void;
  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      selectedCustomer: null,
      selectCustomer: (customer) => set({ selectedCustomer: customer }),
      clearCustomer: () => set({ selectedCustomer: null }),
    }),
    {
      name: 'daifort-customer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
