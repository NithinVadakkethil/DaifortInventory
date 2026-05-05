import SQLite from 'react-native-sqlite-storage';

const INITIAL_PRODUCTS = [
  { name: 'Stainless Steel Skillet', price: 45.99, category: 'Cookware', image: 'https://www.hometown.in/cdn/shop/files/1_807bcd15-c754-4efa-9b90-c6111d24a01e.jpg?v=1764794999', stock: 150 },
  { name: 'Non-Stick Frying Pan', price: 34.50, category: 'Cookware', image: 'https://via.placeholder.com/150', stock: 80 },
  { name: 'Professional Chef Knife', price: 89.99, category: 'Cutlery', image: 'https://shop.khamir.org/cdn/shop/files/Cleaver-2.jpg?v=1697882847', stock: 45 },
  { name: 'Heavy Duty Stock Pot 20Qt', price: 120.00, category: 'Cookware', image: 'https://via.placeholder.com/150', stock: 25 },
  { name: 'Cast Iron Dutch Oven 6Qt', price: 65.00, category: 'Cookware', image: 'https://via.placeholder.com/150', stock: 100 },
  { name: 'Wooden Cutting Board', price: 25.00, category: 'Prep', image: 'https://via.placeholder.com/150', stock: 200 },
  { name: 'Digital Kitchen Scale', price: 30.00, category: 'Electronics', image: 'https://m.media-amazon.com/images/I/71yd9uEY0uL._SX522_.jpg', stock: 60 },
  { name: 'Whisk Set (3-Piece)', price: 15.00, category: 'Utensils', image: 'https://via.placeholder.com/150', stock: 120 },
  { name: 'Silicone Spatula Set', price: 18.50, category: 'Utensils', image: 'https://via.placeholder.com/150', stock: 150 },
  { name: 'Mixing Bowls (Stainless)', price: 40.00, category: 'Prep', image: 'https://via.placeholder.com/150', stock: 90 },
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
