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

  try {
    await db.executeSql(queryProducts);
    await db.executeSql(queryCustomers);
    await db.executeSql(queryOrders);
    await db.executeSql(queryOrderItems);
  } catch (error) {
    console.error('Error creating tables', error);
  }
};

export const insertProduct = async (
  name: string,
  price: number,
  category: string,
  image: string,
  stock: number = 0
) => {
  const db = await getDBConnection();
  const query = 'INSERT INTO products (name, price, category, image, stock) VALUES (?, ?, ?, ?, ?)';
  await db.executeSql(query, [name, price, category, image, stock]);
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
  await deleteOldOrders();
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
  const db = await getDBConnection();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const [results] = await db.executeSql('SELECT id FROM orders WHERE date < ?', [twentyFourHoursAgo]);
  
  const orderIds: number[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    orderIds.push(results.rows.item(i).id);
  }
  
  if (orderIds.length > 0) {
    const placeholders = orderIds.map(() => '?').join(',');
    await db.executeSql(`DELETE FROM order_items WHERE orderId IN (${placeholders})`, orderIds);
    await db.executeSql(`DELETE FROM orders WHERE id IN (${placeholders})`, orderIds);
  }
};

export const getLastOrderForCustomer = async (customerId: number) => {
  await deleteOldOrders();
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
  await deleteOldOrders();
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
