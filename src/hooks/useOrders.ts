import { useCallback, useEffect, useState } from 'react';
import { getOrdersWithinLast24Hours, OrderRecord } from '../data/db';

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getOrdersWithinLast24Hours();
      setOrders(items);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
};
