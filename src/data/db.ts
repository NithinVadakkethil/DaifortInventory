import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

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
