import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export interface OrderRecord {
  id: number;
  customerId: number | null;
  customerName: string | null;
  total: number;
  date: string;
  status: string | null;
}

export const getDBConnection = async () => {
  return SQLite.openDatabase({ name: 'daifort-inventory.db', location: 'default' });
};

export const createTables = async (db: SQLite.SQLiteDatabase) => {
  const queryProducts = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      stock INTEGER NOT NULL
    );
  `;

  const queryCustomers = `
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT
    );
  `;

  const queryOrders = `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER,
      total REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT,
      FOREIGN KEY (customerId) REFERENCES customers (id)
    );
  `;

  const queryOrderItems = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      productId INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders (id),
      FOREIGN KEY (productId) REFERENCES products (id)
    );
  `;

  // Gallery images table — safe to run on existing DBs
  const queryProductImages = `
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      url TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (productId) REFERENCES products (id)
    );
  `;

  const queryCategories = `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      image TEXT
    );
  `;

  try {
    await db.executeSql(queryProducts);
    await db.executeSql(queryCustomers);
    await db.executeSql(queryOrders);
    await db.executeSql(queryOrderItems);
    await db.executeSql(queryProductImages);
    await db.executeSql(queryCategories);
  } catch (error) {
    console.error('Error creating tables', error);
  }
};

export const insertProduct = async (
  name: string,
  price: number,
  category: string,
  image: string,
  stock: number = 0,
  additionalImages: string[] = []
) => {
  const db = await getDBConnection();
  const query = 'INSERT INTO products (name, price, category, image, stock) VALUES (?, ?, ?, ?, ?)';
  const [result] = await db.executeSql(query, [name, price, category, image, stock]);
  const productId = result.insertId;

  // Insert all gallery images (first image is the primary, rest are extras)
  const allImages = [image, ...additionalImages.filter(url => url.trim() !== '' && url !== image)];
  await insertProductImages(db, productId, allImages);

  return productId;
};

export const insertProductImages = async (
  db: SQLite.SQLiteDatabase,
  productId: number,
  urls: string[]
) => {
  // Clear existing gallery images for this product first
  await db.executeSql('DELETE FROM product_images WHERE productId = ?', [productId]);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].trim();
    if (url) {
      await db.executeSql(
        'INSERT INTO product_images (productId, url, sortOrder) VALUES (?, ?, ?)',
        [productId, url, i]
      );
    }
  }
};

export const getProductImages = async (
  db: SQLite.SQLiteDatabase,
  productId: number
): Promise<string[]> => {
  const [results] = await db.executeSql(
    'SELECT url FROM product_images WHERE productId = ? ORDER BY sortOrder ASC',
    [productId]
  );
  const urls: string[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    urls.push(results.rows.item(i).url);
  }
  return urls;
};

export const insertCustomer = async (
  name: string,
  email: string,
  phone: string,
  address: string
) => {
  const db = await getDBConnection();
  const query = 'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)';
  await db.executeSql(query, [name, email, phone, address]);
};

export const updateCustomer = async (
  id: number,
  name: string,
  email: string,
  phone: string,
  address: string
) => {
  const db = await getDBConnection();
  const query = 'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';
  await db.executeSql(query, [name, email, phone, address, id]);
};

export const deleteCustomer = async (id: number) => {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM order_items WHERE orderId IN (SELECT id FROM orders WHERE customerId = ?)', [id]);
  await db.executeSql('DELETE FROM orders WHERE customerId = ?', [id]);
  await db.executeSql('DELETE FROM customers WHERE id = ?', [id]);
};

export const insertOrder = async (
  customerId: number | null,
  total: number,
  date: string,
  status: string,
  items: { productId: number; quantity: number; price: number }[]
) => {
  const db = await getDBConnection();
  const [result] = await db.executeSql(
    'INSERT INTO orders (customerId, total, date, status) VALUES (?, ?, ?, ?)',
    [customerId, total, date, status]
  );
  
  const orderId = result.insertId;
  
  for (const item of items) {
    await db.executeSql(
      'INSERT INTO order_items (orderId, productId, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, item.productId, item.quantity, item.price]
    );
  }
  
  return orderId;
};

export const deleteOldOrders = async () => {
  // No-op: user requested not to automatically remove orders
};

export const getLastOrderForCustomer = async (customerId: number) => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(
    'SELECT * FROM orders WHERE customerId = ? ORDER BY date DESC LIMIT 1',
    [customerId]
  );
  
  if (results.rows.length > 0) {
    return results.rows.item(0);
  }
  return null;
};

export const getOrdersWithinLast24Hours = async () => {
  const db = await getDBConnection();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [results] = await db.executeSql(
    `SELECT o.id, o.customerId, o.total, o.date, o.status, c.name as customerName
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customerId
     WHERE o.date >= ?
     ORDER BY o.date DESC`,
    [twentyFourHoursAgo]
  );

  const items: OrderRecord[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    items.push(results.rows.item(i) as OrderRecord);
  }
  return items;
};

export const deleteOrder = async (orderId: number) => {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM order_items WHERE orderId = ?', [orderId]);
  await db.executeSql('DELETE FROM orders WHERE id = ?', [orderId]);
};

export const getAllOrders = async (searchQuery?: string) => {
  const db = await getDBConnection();
  
  let query = `
    SELECT o.id, o.customerId, o.total, o.date, o.status, c.name as customerName
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customerId
  `;
  const params: any[] = [];
  
  if (searchQuery && searchQuery.trim() !== '') {
    query += ` WHERE (CAST(o.id AS TEXT) LIKE ? OR c.name LIKE ?) `;
    params.push(`%${searchQuery}%`, `%${searchQuery}%`);
  }
  
  query += ` ORDER BY o.date DESC`;
  
  const [results] = await db.executeSql(query, params);
  
  const items: OrderRecord[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    items.push(results.rows.item(i) as OrderRecord);
  }
  return items;
};

export interface CategoryRecord {
  id: number;
  name: string;
  image: string;
}

export const insertCategory = async (name: string, image: string) => {
  const db = await getDBConnection();
  const query = 'INSERT OR REPLACE INTO categories (name, image) VALUES (?, ?)';
  await db.executeSql(query, [name, image]);
};

export const getAllCategories = async (searchQuery?: string): Promise<CategoryRecord[]> => {
  const db = await getDBConnection();
  let query = 'SELECT * FROM categories';
  const params: any[] = [];
  if (searchQuery && searchQuery.trim() !== '') {
    query += ' WHERE name LIKE ?';
    params.push(`%${searchQuery}%`);
  }
  query += ' ORDER BY name ASC';
  const [results] = await db.executeSql(query, params);
  const items: CategoryRecord[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    items.push(results.rows.item(i) as CategoryRecord);
  }
  return items;
};

export const deleteCategory = async (id: number) => {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM categories WHERE id = ?', [id]);
};

export const updateProduct = async (
  id: number,
  name: string,
  price: number,
  category: string,
  image: string,
  stock: number = 0,
  additionalImages: string[] = []
) => {
  const db = await getDBConnection();
  const query = 'UPDATE products SET name = ?, price = ?, category = ?, image = ?, stock = ? WHERE id = ?';
  await db.executeSql(query, [name, price, category, image, stock, id]);

  // Update gallery images
  const allImages = [image, ...additionalImages.filter(url => url.trim() !== '' && url !== image)];
  await insertProductImages(db, id, allImages);
};

export const deleteProduct = async (id: number) => {
  const db = await getDBConnection();
  await db.executeSql('DELETE FROM product_images WHERE productId = ?', [id]);
  await db.executeSql('DELETE FROM order_items WHERE productId = ?', [id]);
  await db.executeSql('DELETE FROM products WHERE id = ?', [id]);
};


