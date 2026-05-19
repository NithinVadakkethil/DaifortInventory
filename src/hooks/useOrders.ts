import { useCallback, useEffect, useState } from 'react';
import { getAllOrders, OrderRecord } from '../data/db';

export const useOrders = (searchQuery: string = '') => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getAllOrders(searchQuery);
      setOrders(items);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
};
