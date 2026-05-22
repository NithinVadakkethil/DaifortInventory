import SQLite from 'react-native-sqlite-storage';

const INITIAL_CATEGORIES = [
  { name: 'Dinner Ware', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cutlery', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Flask', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' },
  { name: 'Knife', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pots & Pans', image: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?auto=format&fit=crop&w=600&q=80' },
];

const INITIAL_PRODUCTS = [
  // Dinner Ware
  { name: 'Classic Porcelain Dinner Set', price: 59.99, category: 'Dinner Ware', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80', stock: 100 },
  { name: 'Ceramic Dinner Plates (Set of 4)', price: 29.99, category: 'Dinner Ware', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&q=80', stock: 80 },
  { name: 'Stoneware Pasta Bowls', price: 24.50, category: 'Dinner Ware', image: 'https://images.unsplash.com/photo-1535401991746-da3d9055713e?auto=format&fit=crop&w=600&q=80', stock: 120 },
  { name: 'Glass Salad Bowls', price: 18.99, category: 'Dinner Ware', image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80', stock: 90 },
  { name: 'Golden Rimmed Tea Cups', price: 34.00, category: 'Dinner Ware', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', stock: 60 },

  // Cutlery
  { name: '24-Piece Stainless Steel Cutlery Set', price: 49.99, category: 'Cutlery', image: 'https://images.unsplash.com/photo-1543510473-ac2c353ee9e4?auto=format&fit=crop&w=600&q=80', stock: 150 },
  { name: 'Matte Black Flatware Set', price: 65.00, category: 'Cutlery', image: 'https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?auto=format&fit=crop&w=600&q=80', stock: 75 },
  { name: 'Golden Dessert Spoons (Set of 6)', price: 15.50, category: 'Cutlery', image: 'https://images.unsplash.com/photo-1594756297426-ff264c8d5c8a?auto=format&fit=crop&w=600&q=80', stock: 110 },
  { name: 'Silver Steak Knives (Set of 4)', price: 28.00, category: 'Cutlery', image: 'https://images.unsplash.com/photo-1619860860774-1e2e17ae4c89?auto=format&fit=crop&w=600&q=80', stock: 85 },
  { name: 'Wooden Handle Salad Servers', price: 12.99, category: 'Cutlery', image: 'https://images.unsplash.com/photo-1609167921178-e283738466e3?auto=format&fit=crop&w=600&q=80', stock: 130 },

  // Flask
  { name: 'Vacuum Insulated Water Bottle', price: 19.99, category: 'Flask', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80', stock: 200 },
  { name: 'Stainless Steel Thermos Flask 1L', price: 25.50, category: 'Flask', image: 'https://images.unsplash.com/photo-1592892111425-15e04305f961?auto=format&fit=crop&w=600&q=80', stock: 95 },
  { name: 'Travel Coffee Mug', price: 14.99, category: 'Flask', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', stock: 140 },
  { name: 'Matte Finished Sports Flask', price: 18.00, category: 'Flask', image: 'https://images.unsplash.com/photo-1575138136361-9c86a117b3c2?auto=format&fit=crop&w=600&q=80', stock: 120 },
  { name: 'Double-Walled Tumbler', price: 22.00, category: 'Flask', image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80', stock: 160 },

  // Knife
  { name: 'Professional Chef Knife 8"', price: 79.99, category: 'Knife', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80', stock: 50 },
  { name: 'Damascus Steel Santoku Knife', price: 120.00, category: 'Knife', image: 'https://images.unsplash.com/photo-1614030424754-24d0e906b3e7?auto=format&fit=crop&w=600&q=80', stock: 30 },
  { name: 'Paring Knife 3.5"', price: 19.50, category: 'Knife', image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80', stock: 150 },
  { name: 'Bread Knife Serrated', price: 24.99, category: 'Knife', image: 'https://images.unsplash.com/photo-1580983231362-dc30790e0c03?auto=format&fit=crop&w=600&q=80', stock: 80 },
  { name: 'Magnetic Knife Wooden Block', price: 35.00, category: 'Knife', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80', stock: 45 },

  // Pots & Pans
  { name: 'Non-Stick Frying Pan 10"', price: 32.99, category: 'Pots & Pans', image: 'https://images.unsplash.com/photo-1584990347449-a6e4ab9d7221?auto=format&fit=crop&w=600&q=80', stock: 110 },
  { name: 'Cast Iron Skillet 12"', price: 45.00, category: 'Pots & Pans', image: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?auto=format&fit=crop&w=600&q=80', stock: 90 },
  { name: 'Stainless Steel Stockpot 6Qt', price: 55.00, category: 'Pots & Pans', image: 'https://images.unsplash.com/photo-1593006526979-4f8fb95dc163?auto=format&fit=crop&w=600&q=80', stock: 65 },
  { name: 'Ceramic Saucepan with Lid', price: 28.50, category: 'Pots & Pans', image: 'https://images.unsplash.com/photo-1601664152579-22a8ecdf11d9?auto=format&fit=crop&w=600&q=80', stock: 85 },
  { name: 'Copper Chef\'s Wok', price: 69.99, category: 'Pots & Pans', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80', stock: 40 },
];

export const seedDatabase = async (db: SQLite.SQLiteDatabase) => {
  // Check if categories already exist
  const [catResults] = await db.executeSql('SELECT count(*) as count FROM categories');
  if (catResults.rows.item(0).count === 0) {
    // Fresh seed: delete existing products to avoid mismatched categories
    await db.executeSql('DELETE FROM products');
    await db.executeSql('DELETE FROM product_images');
    await db.executeSql('DELETE FROM categories');

    for (const cat of INITIAL_CATEGORIES) {
      await db.executeSql(
        'INSERT INTO categories (name, image) VALUES (?, ?)',
        [cat.name, cat.image]
      );
    }

    for (const product of INITIAL_PRODUCTS) {
      const [result] = await db.executeSql(
        'INSERT INTO products (name, price, category, image, stock) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.price, product.category, product.image, product.stock]
      );
      const productId = result.insertId;
      // Add the primary image to gallery too
      await db.executeSql(
        'INSERT INTO product_images (productId, url, sortOrder) VALUES (?, ?, ?)',
        [productId, product.image, 0]
      );
    }
    console.log('Database seeded with categories and products.');
  } else {
    // If they already exist, we update their primary images just in case
    for (const cat of INITIAL_CATEGORIES) {
      await db.executeSql(
        'UPDATE categories SET image = ? WHERE name = ?',
        [cat.image, cat.name]
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
