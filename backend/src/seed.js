require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Fixed Unsplash images that work
const images = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae51?w=400&q=80',
  'https://images.unsplash.com/photo-1463100099587-383f3432a5ae?w=400&q=80',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
  'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
  'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
  'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&q=80',
  'https://images.unsplash.com/photo-1610945415299-d9be085916e94?w=400&q=80',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
  'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=400&q=80',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
  'https://images.unsplash.com/photo-1606144042614-2412458bfc6e?w=400&q=80',
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&q=80',
];

const getImg = (i) => images[i % images.length];

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fs = require('fs');
    const schema = fs.readFileSync(__dirname + '/database/schema.sql', 'utf8');
    await client.query(schema);

    const adminPass = await bcrypt.hash('admin123', 10);
    const adminRes = await client.query(
      `INSERT INTO users (email, password, name, role, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      ['admin@zynta.com', adminPass, 'Admin', 'admin', 'active']
    );
    const adminId = adminRes.rows[0].id;

    const sellerPass = await bcrypt.hash('seller123', 10);
    const sellerRes = await client.query(
      `INSERT INTO users (email, password, name, role, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      ['seller@zynta.com', sellerPass, 'Zynta Store', 'seller', 'approved']
    );
    const sellerId = sellerRes.rows[0].id;

    await client.query(
      `INSERT INTO seller_profiles (user_id, business_name, business_address, phone, approval_status)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id) DO NOTHING`,
      [sellerId, 'Zynta Store', '123 Market St', '+91-9876543210', 'approved']
    );

    const custPass = await bcrypt.hash('customer123', 10);
    await client.query(
      `INSERT INTO users (email, password, name, role, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO NOTHING`,
      ['customer@zynta.com', custPass, 'Atul Kumar', 'customer', 'active']
    );

    const cats = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Food', 'Toys'];
    const catIds = {};
    for (const c of cats) {
      const r = await client.query(
        `INSERT INTO categories (name, description) VALUES ($1,$2) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        [c, `${c} products`]
      );
      catIds[c] = r.rows[0].id;
    }

    const seller2Pass = await bcrypt.hash('seller123', 10);
    const seller2Res = await client.query(
      `INSERT INTO users (email, password, name, role, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      ['urban@zynta.com', seller2Pass, 'Urban Bazaar', 'seller', 'approved']
    );
    const seller2Id = seller2Res.rows[0].id;
    await client.query(
      `INSERT INTO seller_profiles (user_id, business_name, business_address, phone, approval_status)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id) DO NOTHING`,
      [seller2Id, 'Urban Bazaar', '45 MG Road, Bengaluru', '+91-9988776655', 'approved']
    );

    await client.query('DELETE FROM cart_items');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM products');

    const products = [
      { title:'Sony WH-1000XM5',desc:'Premium noise-cancelling headphones, 30hr battery',price:24990,stock:50,cat:'Electronics' },
      { title:'iPhone 15 Pro Max',desc:'A17 Pro chip, 48MP camera, titanium',price:159900,stock:20,cat:'Electronics' },
      { title:'MacBook Air M3',desc:'13.6" Liquid Retina, 18hr battery',price:114900,stock:15,cat:'Electronics' },
      { title:'Samsung Galaxy Watch 6',desc:'Advanced health monitoring',price:28999,stock:35,cat:'Electronics' },
      { title:'JBL Flip 6',desc:'IP67 waterproof speaker',price:9999,stock:80,cat:'Electronics' },
      { title:'AirPods Pro 2',desc:'Active Noise Cancellation',price:24900,stock:45,cat:'Electronics' },
      { title:'iPad Air M2',desc:'11" Liquid Retina, M2 chip',price:69900,stock:25,cat:'Electronics' },
      { title:'Sony Alpha A7 IV',desc:'33MP full-frame camera',price:189990,stock:8,cat:'Electronics' },
      { title:'Bose QuietComfort Ultra',desc:'Spatial audio headphones',price:32900,stock:30,cat:'Electronics' },
      { title:'DJI Mini 4 Pro',desc:'4K HDR drone, sub-249g',price:79990,stock:10,cat:'Electronics' },
      { title:'Nike Air Max 270',desc:'Lifestyle sneaker, Max Air unit',price:12995,stock:60,cat:'Clothing' },
      { title:'Levis 501 Original',desc:'Straight-fit jeans',price:4999,stock:100,cat:'Clothing' },
      { title:'Uniqlo Ultra Light Down',desc:'Ultra-lightweight down jacket',price:3990,stock:45,cat:'Clothing' },
      { title:'Ray-Ban Aviator',desc:'Iconic sunglasses',price:8490,stock:70,cat:'Clothing' },
      { title:'Adidas Ultraboost 23',desc:'Boost cushioning',price:16999,stock:40,cat:'Clothing' },
      { title:'North Face Puffer',desc:'700-fill goose down',price:18999,stock:20,cat:'Clothing' },
      { title:'Carhartt Beanie',desc:'Rib-knit watch hat',price:1999,stock:120,cat:'Clothing' },
      { title:'Herschel Backpack',desc:'24L capacity',price:4499,stock:55,cat:'Clothing' },
      { title:'Atomic Habits',desc:'James Clear bestseller',price:499,stock:200,cat:'Books' },
      { title:'The Psychology of Money',desc:'Morgan Housel classic',price:399,stock:150,cat:'Books' },
      { title:'Deep Work',desc:'Cal Newport',price:449,stock:120,cat:'Books' },
      { title:'Sapiens',desc:'Yuval Noah Harari',price:599,stock:180,cat:'Books' },
      { title:'Thinking Fast Slow',desc:'Daniel Kahneman',price:549,stock:90,cat:'Books' },
      { title:'The Alchemist',desc:'Paulo Coelho',price:299,stock:250,cat:'Books' },
      { title:'Dyson V15 Detect',desc:'Cordless vacuum',price:52900,stock:12,cat:'Home' },
      { title:'Philips Air Purifier',desc:'HEPA filter',price:14999,stock:25,cat:'Home' },
      { title:'Nespresso Vertuo',desc:'Coffee machine',price:15990,stock:30,cat:'Home' },
      { title:'IKEA MALM Desk',desc:'Minimalist desk',price:8999,stock:18,cat:'Home' },
      { title:'Himalayan Salt Lamp',desc:'Crystal lamp',price:1499,stock:75,cat:'Home' },
      { title:'Yoga Mat Pro',desc:'Non-slip TPE',price:1999,stock:90,cat:'Sports' },
      { title:'Fitbit Charge 6',desc:'Fitness tracker',price:14999,stock:40,cat:'Sports' },
      { title:'Wilson Pro Staff',desc:'Tennis racket',price:18999,stock:15,cat:'Sports' },
      { title:'TRX Suspension',desc:'Full-body trainer',price:12999,stock:35,cat:'Sports' },
      { title:'Hydro Flask 32oz',desc:'Vacuum insulated',price:2999,stock:100,cat:'Sports' },
      { title:'Garmin Forerunner',desc:'GPS running watch',price:39999,stock:12,cat:'Sports' },
      { title:'Charlotte Tilbury',desc:'Luxury lipstick set',price:5999,stock:55,cat:'Beauty' },
      { title:'Dyson Airwrap',desc:'Multi-styler',price:44900,stock:10,cat:'Beauty' },
      { title:'The Ordinary Set',desc:'Skincare set',price:1999,stock:85,cat:'Beauty' },
      { title:'Jo Malone Cologne',desc:'Luxury fragrances',price:8999,stock:25,cat:'Beauty' },
      { title:'Organic Honey',desc:'Raw forest honey',price:1299,stock:100,cat:'Food' },
      { title:'Belgian Chocolates',desc:'Truffles box',price:2499,stock:65,cat:'Food' },
      { title:'Premium Matcha',desc:'Ceremonial grade',price:2999,stock:40,cat:'Food' },
      { title:'LEGO Technic Ferrari',desc:'3778 pieces',price:39999,stock:8,cat:'Toys' },
      { title:'Nintendo Switch',desc:'OLED screen',price:34999,stock:22,cat:'Toys' },
      { title:'Rubiks Cube',desc:'Speed edition',price:2499,stock:50,cat:'Toys' },
      { title:'DJI Osmo Action 4',desc:'4K action camera',price:27999,stock:15,cat:'Toys' },
    ];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const sid = i % 2 === 0 ? sellerId : seller2Id;
      await client.query(
        `INSERT INTO products (seller_id, category_id, title, description, price, stock_quantity, image_url, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [sid, catIds[p.cat], p.title, p.desc, p.price, p.stock, getImg(i), 'active']
      );
    }

    await client.query('COMMIT');
    console.log('Seeded: 1 admin, 2 sellers, 1 customer, 8 categories, 48 products');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

module.exports = seed;