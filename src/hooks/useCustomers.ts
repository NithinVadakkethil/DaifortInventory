import { useState, useEffect, useCallback } from 'react';
import { getDBConnection } from '../data/db';
import { CustomerType } from '../store/useCustomerStore';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDBConnection();
      const [results] = await db.executeSql('SELECT * FROM customers');
      const items: CustomerType[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        items.push(results.rows.item(i));
      }
      setCustomers(items);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, refetch: fetchCustomers };
};
