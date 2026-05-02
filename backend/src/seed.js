require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create tables if not exist
    const fs = require('fs');
    const schema = fs.readFileSync(__dirname + '/database/schema.sql', 'utf8');
    await client.query(schema);

    // Seed admin
    const adminPass = await bcrypt.hash('admin123', 10);
    const adminRes = await client.query(
      `INSERT INTO users (email, password, name, role, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      ['admin@zynta.com', adminPass, 'Admin', 'admin', 'active']
    );
    const adminId = adminRes.rows[0].id;

    // Seed seller
    const sellerPass = await bcrypt.hash('seller123', 10);
    const sellerRes = await client.query(
      `INSERT INTO users (email, password, name, role, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      ['seller@zynta.com', sellerPass, 'Zynta Store', 'seller', 'approved']
    );
    const sellerId = sellerRes.rows[0].id;

    // Seed seller profile
    await client.query(
      `INSERT INTO seller_profiles (user_id, business_name, business_address, phone, approval_status)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id) DO NOTHING`,
      [sellerId, 'Zynta Store', '123 Market St', '+91-9876543210', 'approved']
    );

    // Seed customer
    const custPass = await bcrypt.hash('customer123', 10);
    await client.query(
      `INSERT INTO users (email, password, name, role, status) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO NOTHING`,
      ['customer@zynta.com', custPass, 'Atul Kumar', 'customer', 'active']
    );

    // Seed categories
    const cats = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Food', 'Toys'];
    const catIds = {};
    for (const c of cats) {
      const r = await client.query(
        `INSERT INTO categories (name, description) VALUES ($1,$2) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        [c, `${c} products`]
      );
      catIds[c] = r.rows[0].id;
    }

    // Seed another seller
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

    // Clear existing products for clean re-seed
    await client.query('DELETE FROM cart_items');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM products');

    // Seed 50 products
    const products = [
      // ─── Electronics (10) ───
      { title:'Sony WH-1000XM5',desc:'Premium noise-cancelling wireless headphones with 30hr battery life and multipoint connection',price:24990,stock:50,cat:'Electronics',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',seller:sellerId },
      { title:'iPhone 15 Pro Max',desc:'A17 Pro chip, 48MP main camera, titanium design, USB-C',price:159900,stock:20,cat:'Electronics',img:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80',seller:sellerId },
      { title:'MacBook Air M3',desc:'13.6" Liquid Retina display, 18hr battery, fanless silent design',price:114900,stock:15,cat:'Electronics',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',seller:sellerId },
      { title:'Samsung Galaxy Watch 6',desc:'Advanced health monitoring with BioActive sensor and sleep coaching',price:28999,stock:35,cat:'Electronics',img:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',seller:sellerId },
      { title:'JBL Flip 6',desc:'Portable IP67 waterproof Bluetooth speaker with bold JBL Original Pro Sound',price:9999,stock:80,cat:'Electronics',img:'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',seller:sellerId },
      { title:'AirPods Pro 2',desc:'Active Noise Cancellation, Adaptive Transparency, personalized Spatial Audio',price:24900,stock:45,cat:'Electronics',img:'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',seller:sellerId },
      { title:'iPad Air M2',desc:'11" Liquid Retina, M2 chip, Apple Pencil Pro support',price:69900,stock:25,cat:'Electronics',img:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',seller:seller2Id },
      { title:'Sony Alpha A7 IV',desc:'33MP full-frame mirrorless camera with real-time Eye AF',price:189990,stock:8,cat:'Electronics',img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',seller:seller2Id },
      { title:'Bose QuietComfort Ultra',desc:'Immersive spatial audio headphones with CustomTune technology',price:32900,stock:30,cat:'Electronics',img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',seller:seller2Id },
      { title:'DJI Mini 4 Pro',desc:'Sub-249g drone with 4K HDR video and omnidirectional obstacle sensing',price:79990,stock:10,cat:'Electronics',img:'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80',seller:seller2Id },

      // ─── Clothing (8) ───
      { title:'Nike Air Max 270',desc:'Lifestyle sneaker with the tallest Max Air unit for all-day comfort',price:12995,stock:60,cat:'Clothing',img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',seller:sellerId },
      { title:'Levi\'s 501 Original',desc:'The iconic straight-fit jeans in premium selvedge denim',price:4999,stock:100,cat:'Clothing',img:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',seller:sellerId },
      { title:'Uniqlo Ultra Light Down',desc:'Ultra-lightweight packable down jacket — weighs just 230g',price:3990,stock:45,cat:'Clothing',img:'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',seller:sellerId },
      { title:'Ray-Ban Aviator Classic',desc:'Iconic aviator sunglasses with polarized G-15 green lenses',price:8490,stock:70,cat:'Clothing',img:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',seller:sellerId },
      { title:'Adidas Ultraboost 23',desc:'Responsive Boost cushioning with Primeknit+ upper',price:16999,stock:40,cat:'Clothing',img:'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',seller:seller2Id },
      { title:'North Face Puffer Jacket',desc:'700-fill goose down insulation with DWR finish',price:18999,stock:20,cat:'Clothing',img:'https://images.unsplash.com/photo-1544923246-77307dd270cb?w=600&q=80',seller:seller2Id },
      { title:'Carhartt WIP Beanie',desc:'Rib-knit acrylic watch hat in classic Carhartt style',price:1999,stock:120,cat:'Clothing',img:'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&q=80',seller:seller2Id },
      { title:'Herschel Classic Backpack',desc:'Signature striped fabric liner with 24L capacity',price:4499,stock:55,cat:'Clothing',img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',seller:seller2Id },

      // ─── Books (6) ───
      { title:'Atomic Habits',desc:'James Clear — Tiny changes, remarkable results. #1 NYT bestseller',price:499,stock:200,cat:'Books',img:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',seller:sellerId },
      { title:'The Psychology of Money',desc:'Morgan Housel — Timeless lessons on wealth, greed, and happiness',price:399,stock:150,cat:'Books',img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',seller:sellerId },
      { title:'Deep Work',desc:'Cal Newport — Rules for focused success in a distracted world',price:449,stock:120,cat:'Books',img:'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=600&q=80',seller:sellerId },
      { title:'Sapiens',desc:'Yuval Noah Harari — A brief history of humankind',price:599,stock:180,cat:'Books',img:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80',seller:seller2Id },
      { title:'Thinking, Fast and Slow',desc:'Daniel Kahneman — Nobel laureate\'s exploration of two thinking systems',price:549,stock:90,cat:'Books',img:'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',seller:seller2Id },
      { title:'The Alchemist',desc:'Paulo Coelho — A fable about following your dream. 150M+ copies sold',price:299,stock:250,cat:'Books',img:'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80',seller:seller2Id },

      // ─── Home (6) ───
      { title:'Dyson V15 Detect',desc:'Laser-guided cordless vacuum with LCD particle-count display',price:52900,stock:12,cat:'Home',img:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',seller:sellerId },
      { title:'Philips Air Purifier 3000i',desc:'HEPA filter removes 99.97% particles, smart app control',price:14999,stock:25,cat:'Home',img:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',seller:sellerId },
      { title:'Nespresso Vertuo Next',desc:'One-touch coffee machine with centrifusion brewing technology',price:15990,stock:30,cat:'Home',img:'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',seller:sellerId },
      { title:'IKEA MALM Desk',desc:'Clean minimalist desk with cable management and drawer',price:8999,stock:18,cat:'Home',img:'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80',seller:seller2Id },
      { title:'Himalayan Salt Lamp',desc:'Hand-carved pink salt crystal lamp with dimmer switch',price:1499,stock:75,cat:'Home',img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',seller:seller2Id },
      { title:'Ceramic Planter Set',desc:'Set of 3 minimalist matte white planters with bamboo trays',price:1999,stock:60,cat:'Home',img:'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80',seller:seller2Id },

      // ─── Sports (6) ───
      { title:'Yoga Mat Pro 6mm',desc:'Non-slip TPE mat with alignment lines and carrying strap',price:1999,stock:90,cat:'Sports',img:'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',seller:sellerId },
      { title:'Fitbit Charge 6',desc:'Advanced fitness tracker with built-in GPS and stress management',price:14999,stock:40,cat:'Sports',img:'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80',seller:sellerId },
      { title:'Wilson Pro Staff 97',desc:'Roger Federer signature tennis racket — precision and control',price:18999,stock:15,cat:'Sports',img:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80',seller:sellerId },
      { title:'TRX Suspension Trainer',desc:'Full-body workout system — gym-quality training anywhere',price:12999,stock:35,cat:'Sports',img:'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',seller:seller2Id },
      { title:'Hydro Flask 32oz',desc:'Vacuum insulated stainless steel water bottle — 24hr cold',price:2999,stock:100,cat:'Sports',img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',seller:seller2Id },
      { title:'Garmin Forerunner 265',desc:'AMOLED GPS running watch with training readiness score',price:39999,stock:12,cat:'Sports',img:'https://images.unsplash.com/photo-1510017803434-a899b57e6188?w=600&q=80',seller:seller2Id },

      // ─── Beauty (5) ───
      { title:'Charlotte Tilbury Pillow Talk Set',desc:'Luxury makeup set with iconic Pillow Talk matte lipstick',price:5999,stock:55,cat:'Beauty',img:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',seller:sellerId },
      { title:'Dyson Airwrap Complete',desc:'Multi-styler with Coanda airflow — curl, wave, smooth, dry',price:44900,stock:10,cat:'Beauty',img:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',seller:sellerId },
      { title:'The Ordinary Skincare Set',desc:'AHA 30% + BHA 2% peeling solution, niacinamide, hyaluronic acid',price:1999,stock:85,cat:'Beauty',img:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',seller:seller2Id },
      { title:'Jo Malone Cologne Collection',desc:'Mini luxury fragrance set — 5 x 9ml bestselling scents',price:8999,stock:25,cat:'Beauty',img:'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',seller:seller2Id },
      { title:'Foreo Luna 4',desc:'Smart facial cleansing device with T-Sonic™ pulsations',price:14990,stock:20,cat:'Beauty',img:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',seller:seller2Id },

      // ─── Food (5) ───
      { title:'Organic Honey Collection',desc:'Raw forest honey gift set — 3 single-origin varieties',price:1299,stock:100,cat:'Food',img:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',seller:sellerId },
      { title:'Artisan Belgian Chocolates',desc:'Handcrafted dark chocolate truffles — luxury box of 24',price:2499,stock:65,cat:'Food',img:'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80',seller:sellerId },
      { title:'Premium Matcha Set',desc:'Ceremonial grade matcha with bamboo whisk and bowl',price:2999,stock:40,cat:'Food',img:'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&q=80',seller:seller2Id },
      { title:'Italian Olive Oil Trio',desc:'Extra virgin olive oil collection — Tuscan, Sicilian, Ligurian',price:3499,stock:35,cat:'Food',img:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',seller:seller2Id },
      { title:'Gourmet Coffee Beans',desc:'Single-origin Ethiopian Yirgacheffe — medium roast, 500g',price:899,stock:120,cat:'Food',img:'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',seller:seller2Id },

      // ─── Toys (4) ───
      { title:'LEGO Technic Ferrari SP3',desc:'1:8 scale Ferrari Daytona SP3 — 3778 pieces, collector edition',price:39999,stock:8,cat:'Toys',img:'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600&q=80',seller:sellerId },
      { title:'Nintendo Switch OLED',desc:'7" OLED screen, enhanced audio, 64GB storage, white Joy-Cons',price:34999,stock:22,cat:'Toys',img:'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80',seller:sellerId },
      { title:'Rubik\'s Cube Speed Edition',desc:'Magnetic GAN 356 RS — competition-grade speed cube',price:2499,stock:50,cat:'Toys',img:'https://images.unsplash.com/photo-1577401239170-897c0ddfb30d?w=600&q=80',seller:seller2Id },
      { title:'DJI Osmo Action 4',desc:'Waterproof action camera with 4K/120fps and 1/1.3" sensor',price:27999,stock:15,cat:'Toys',img:'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',seller:seller2Id },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (seller_id, category_id, title, description, price, stock_quantity, image_url, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [p.seller, catIds[p.cat], p.title, p.desc, p.price, p.stock, p.img, 'active']
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seeded: 1 admin, 2 sellers, 1 customer, 8 categories, 50 products');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

seed();
