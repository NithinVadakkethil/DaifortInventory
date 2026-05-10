import SQLite from 'react-native-sqlite-storage';

const INITIAL_PRODUCTS = [
  { name: 'Stainless Steel Skillet', price: 45.99, category: 'Cookware', image: 'https://images.unsplash.com/photo-1584990347449-a6e4ab9d7221?auto=format&fit=crop&w=600&q=80', stock: 150 },
  { name: 'Non-Stick Frying Pan', price: 34.50, category: 'Cookware', image: 'https://images.unsplash.com/photo-1601664152579-22a8ecdf11d9?auto=format&fit=crop&w=600&q=80', stock: 80 },
  { name: 'Professional Chef Knife', price: 89.99, category: 'Cutlery', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80', stock: 45 },
  { name: 'Heavy Duty Stock Pot 20Qt', price: 120.00, category: 'Cookware', image: 'https://images.unsplash.com/photo-1593006526979-4f8fb95dc163?auto=format&fit=crop&w=600&q=80', stock: 25 },
  { name: 'Cast Iron Dutch Oven 6Qt', price: 65.00, category: 'Cookware', image: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?auto=format&fit=crop&w=600&q=80', stock: 100 },
  { name: 'Wooden Cutting Board', price: 25.00, category: 'Prep', image: 'https://images.unsplash.com/photo-1596647900985-78e7debb7a47?auto=format&fit=crop&w=600&q=80', stock: 200 },
  { name: 'Digital Kitchen Scale', price: 30.00, category: 'Electronics', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80', stock: 60 },
  { name: 'Whisk Set (3-Piece)', price: 15.00, category: 'Utensils', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=600&q=80', stock: 120 },
  { name: 'Silicone Spatula Set', price: 18.50, category: 'Utensils', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80', stock: 150 },
  { name: 'Mixing Bowls (Stainless)', price: 40.00, category: 'Prep', image: 'https://images.unsplash.com/photo-1626202157833-28186716a4e3?auto=format&fit=crop&w=600&q=80', stock: 90 },
];

export const seedDatabase = async (db: SQLite.SQLiteDatabase) => {
  // Check if products already exist
  const [results] = await db.executeSql('SELECT count(*) as count FROM products');
  if (results.rows.item(0).count === 0) {
    for (const product of INITIAL_PRODUCTS) {
      await db.executeSql(
        'INSERT INTO products (name, price, category, image, stock) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.price, product.category, product.image, product.stock]
      );
    }
    console.log('Database seeded with initial products.');
  } else {
    // Update existing initial products with the new high-quality images
    for (const product of INITIAL_PRODUCTS) {
      await db.executeSql(
        'UPDATE products SET image = ? WHERE name = ?',
        [product.image, product.name]
      );
    }
  }

  // Seed default customer
  const [customerResults] = await db.executeSql('SELECT count(*) as count FROM customers');
  if (customerResults.rows.item(0).count === 0) {
    await db.executeSql(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      ['Default Walk-in', 'walkin@daifort.com', '000-000-0000', '123 Main St']
    );
  }
};
