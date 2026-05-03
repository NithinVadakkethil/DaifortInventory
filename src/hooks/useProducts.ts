import { useState, useEffect, useCallback } from 'react';
import { getDBConnection } from '../data/db';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export const useProducts = (searchQuery: string = '', category: string = '') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDBConnection();
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (searchQuery) {
        query += ' AND name LIKE ?';
        params.push(`%${searchQuery}%`);
      }

      if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
      }

      const [results] = await db.executeSql(query, params);
      const items: Product[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        items.push(results.rows.item(i));
      }
      setProducts(items);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, refetch: fetchProducts };
};
