import { useState, useEffect, useCallback } from 'react';
import { deleteOldOrders, getDBConnection } from '../data/db';
import { CustomerType } from '../store/useCustomerStore';

export const useCustomers = (searchTerm: string = '') => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      await deleteOldOrders();
      const db = await getDBConnection();
      const term = searchTerm.trim();
      const baseQuery = `
        SELECT
          c.*,
          (
            SELECT o.date
            FROM orders o
            WHERE o.customerId = c.id
            ORDER BY o.date DESC
            LIMIT 1
          ) AS lastOrderDate,
          (
            SELECT o.total
            FROM orders o
            WHERE o.customerId = c.id
            ORDER BY o.date DESC
            LIMIT 1
          ) AS lastOrderTotal
        FROM customers c
      `;

      const [results] =
        term.length > 0
          ? await db.executeSql(
              `${baseQuery}
               WHERE c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?
               ORDER BY c.name ASC`,
              [`%${term}%`, `%${term}%`, `%${term}%`]
            )
          : await db.executeSql(`${baseQuery} ORDER BY c.name ASC`);
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
  }, [searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, refetch: fetchCustomers };
};
