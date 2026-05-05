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

    // Helper for placeholder images - uses product title encoded
    const getImg = (title, id) => {
      const seed = (title || 'P') + id;
      const hash = seed.split('').reduce((a,c) => ((a<<5)-a) + c.charCodeAt(0), 0);
      return `https://placehold.co/400x400/7c3aed/ffffff?text=${(title||'Product').split(' ')[0]}`;
    };

    // Clear existing products for clean re-seed
    await client.query('DELETE FROM products');

    // Seed 50 products
    const products = [
      // ─── Electronics (10) ───
      { title:'Sony WH-1000XM5',desc:'Premium noise-cancelling wireless headphones with 30hr battery life and multipoint connection',price:24990,stock:50,cat:'Electronics',img:getImg(p.title,1),seller:sellerId },
      { title:'iPhone 15 Pro Max',desc:'A17 Pro chip, 48MP main camera, titanium design, USB-C',price:159900,stock:20,cat:'Electronics',img:getImg(p.title,2),seller:sellerId },
      { title:'MacBook Air M3',desc:'13.6" Liquid Retina display, 18hr battery, fanless silent design',price:114900,stock:15,cat:'Electronics',img:getImg(p.title,3),seller:sellerId },
      { title:'Samsung Galaxy Watch 6',desc:'Advanced health monitoring with BioActive sensor and sleep coaching',price:28999,stock:35,cat:'Electronics',img:getImg(p.title,4),seller:sellerId },
      { title:'JBL Flip 6',desc:'Portable IP67 waterproof Bluetooth speaker with bold JBL Original Pro Sound',price:9999,stock:80,cat:'Electronics',img:getImg(p.title,5),seller:sellerId },
      { title:'AirPods Pro 2',desc:'Active Noise Cancellation, Adaptive Transparency, personalized Spatial Audio',price:24900,stock:45,cat:'Electronics',img:getImg(p.title,6),seller:sellerId },
      { title:'iPad Air M2',desc:'11" Liquid Retina, M2 chip, Apple Pencil Pro support',price:69900,stock:25,cat:'Electronics',img:getImg(p.title,7),seller:seller2Id },
      { title:'Sony Alpha A7 IV',desc:'33MP full-frame mirrorless camera with real-time Eye AF',price:189990,stock:8,cat:'Electronics',img:getImg(p.title,8),seller:seller2Id },
      { title:'Bose QuietComfort Ultra',desc:'Immersive spatial audio headphones with CustomTune technology',price:32900,stock:30,cat:'Electronics',img:getImg(p.title,9),seller:seller2Id },
      { title:'DJI Mini 4 Pro',desc:'Sub-249g drone with 4K HDR video and omnidirectional obstacle sensing',price:79990,stock:10,cat:'Electronics',img:getImg(p.title,10),seller:seller2Id },

      // ─── Clothing (8) ───
      { title:'Nike Air Max 270',desc:'Lifestyle sneaker with the tallest Max Air unit for all-day comfort',price:12995,stock:60,cat:'Clothing',img:getImg(p.title,11),seller:sellerId },
      { title:'Levi\'s 501 Original',desc:'The iconic straight-fit jeans in premium selvedge denim',price:4999,stock:100,cat:'Clothing',img:getImg(p.title,12),seller:sellerId },
      { title:'Uniqlo Ultra Light Down',desc:'Ultra-lightweight packable down jacket — weighs just 230g',price:3990,stock:45,cat:'Clothing',img:getImg(p.title,13),seller:sellerId },
      { title:'Ray-Ban Aviator Classic',desc:'Iconic aviator sunglasses with polarized G-15 green lenses',price:8490,stock:70,cat:'Clothing',img:getImg(p.title,14),seller:sellerId },
      { title:'Adidas Ultraboost 23',desc:'Responsive Boost cushioning with Primeknit+ upper',price:16999,stock:40,cat:'Clothing',img:getImg(p.title,15),seller:seller2Id },
      { title:'North Face Puffer Jacket',desc:'700-fill goose down insulation with DWR finish',price:18999,stock:20,cat:'Clothing',img:getImg(p.title,16),seller:seller2Id },
      { title:'Carhartt WIP Beanie',desc:'Rib-knit acrylic watch hat in classic Carhartt style',price:1999,stock:120,cat:'Clothing',img:getImg(p.title,17),seller:seller2Id },
      { title:'Herschel Classic Backpack',desc:'Signature striped fabric liner with 24L capacity',price:4499,stock:55,cat:'Clothing',img:getImg(p.title,18),seller:seller2Id },

      // ─── Books (6) ───
      { title:'Atomic Habits',desc:'James Clear — Tiny changes, remarkable results. #1 NYT bestseller',price:499,stock:200,cat:'Books',img:getImg(p.title,19),seller:sellerId },
      { title:'The Psychology of Money',desc:'Morgan Housel — Timeless lessons on wealth, greed, and happiness',price:399,stock:150,cat:'Books',img:getImg(p.title,20),seller:sellerId },
      { title:'Deep Work',desc:'Cal Newport — Rules for focused success in a distracted world',price:449,stock:120,cat:'Books',img:getImg(p.title,21),seller:sellerId },
      { title:'Sapiens',desc:'Yuval Noah Harari — A brief history of humankind',price:599,stock:180,cat:'Books',img:'getImg1495446815901-a7297e633e8d?w=600&q=80',seller:seller2Id },
      { title:'Thinking, Fast and Slow',desc:'Daniel Kahneman — Nobel laureate\'s exploration of two thinking systems',price:549,stock:90,cat:'Books',img:'getImg1497633762265-9d179a990aa6?w=600&q=80',seller:seller2Id },
      { title:'The Alchemist',desc:'Paulo Coelho — A fable about following your dream. 150M+ copies sold',price:299,stock:250,cat:'Books',img:'getImg1543002588-bfa74002ed7e?w=600&q=80',seller:seller2Id },

      // ─── Home (6) ───
      { title:'Dyson V15 Detect',desc:'Laser-guided cordless vacuum with LCD particle-count display',price:52900,stock:12,cat:'Home',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:sellerId },
      { title:'Philips Air Purifier 3000i',desc:'HEPA filter removes 99.97% particles, smart app control',price:14999,stock:25,cat:'Home',img:'getImg1585771724684-38269d6639fd?w=600&q=80',seller:sellerId },
      { title:'Nespresso Vertuo Next',desc:'One-touch coffee machine with centrifusion brewing technology',price:15990,stock:30,cat:'Home',img:'getImg1559056199-641a0ac8b55e?w=600&q=80',seller:sellerId },
      { title:'IKEA MALM Desk',desc:'Clean minimalist desk with cable management and drawer',price:8999,stock:18,cat:'Home',img:'getImg1518455027359-f3f8164ba6bd?w=600&q=80',seller:seller2Id },
      { title:'Himalayan Salt Lamp',desc:'Hand-carved pink salt crystal lamp with dimmer switch',price:1499,stock:75,cat:'Home',img:'getImg1507003211169-0a1dd7228f2d?w=600&q=80',seller:seller2Id },
      { title:'Ceramic Planter Set',desc:'Set of 3 minimalist matte white planters with bamboo trays',price:1999,stock:60,cat:'Home',img:'getImg1485955900006-10f4d324d411?w=600&q=80',seller:seller2Id },

      // ─── Sports (6) ───
      { title:'Yoga Mat Pro 6mm',desc:'Non-slip TPE mat with alignment lines and carrying strap',price:1999,stock:90,cat:'Sports',img:'getImg1601925260368-ae2f83cf8b7f?w=600&q=80',seller:sellerId },
      { title:'Fitbit Charge 6',desc:'Advanced fitness tracker with built-in GPS and stress management',price:14999,stock:40,cat:'Sports',img:'getImg1575311373937-040b8e1fd5b6?w=600&q=80',seller:sellerId },
      { title:'Wilson Pro Staff 97',desc:'Roger Federer signature tennis racket — precision and control',price:18999,stock:15,cat:'Sports',img:'getImg1622279457486-62dcc4a431d6?w=600&q=80',seller:sellerId },
      { title:'TRX Suspension Trainer',desc:'Full-body workout system — gym-quality training anywhere',price:12999,stock:35,cat:'Sports',img:'getImg1534438327276-14e5300c3a48?w=600&q=80',seller:seller2Id },
      { title:'Hydro Flask 32oz',desc:'Vacuum insulated stainless steel water bottle — 24hr cold',price:2999,stock:100,cat:'Sports',img:'getImg1602143407151-7111542de6e8?w=600&q=80',seller:seller2Id },
      { title:'Garmin Forerunner 265',desc:'AMOLED GPS running watch with training readiness score',price:39999,stock:12,cat:'Sports',img:'getImg1510017803434-a899b57e6188?w=600&q=80',seller:seller2Id },

      // ─── Beauty (5) ───
      { title:'Charlotte Tilbury Pillow Talk Set',desc:'Luxury makeup set with iconic Pillow Talk matte lipstick',price:5999,stock:55,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:sellerId },
      { title:'Dyson Airwrap Complete',desc:'Multi-styler with Coanda airflow — curl, wave, smooth, dry',price:44900,stock:10,cat:'Beauty',img:'getImg1522335789203-aabd1fc54bc9?w=600&q=80',seller:sellerId },
      { title:'The Ordinary Skincare Set',desc:'AHA 30% + BHA 2% peeling solution, niacinamide, hyaluronic acid',price:1999,stock:85,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:seller2Id },
      { title:'Jo Malone Cologne Collection',desc:'Mini luxury fragrance set — 5 x 9ml bestselling scents',price:8999,stock:25,cat:'Beauty',img:'getImg1541643600914-78b084683601?w=600&q=80',seller:seller2Id },
      { title:'Foreo Luna 4',desc:'Smart facial cleansing device with T-Sonic™ pulsations',price:14990,stock:20,cat:'Beauty',img:'getImg1570172619644-dfd03ed5d881?w=600&q=80',seller:seller2Id },

      // ─── Food (5) ───
      { title:'Organic Honey Collection',desc:'Raw forest honey gift set — 3 single-origin varieties',price:1299,stock:100,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:sellerId },
      { title:'Artisan Belgian Chocolates',desc:'Handcrafted dark chocolate truffles — luxury box of 24',price:2499,stock:65,cat:'Food',img:'getImg1549007994-cb92caebd54b?w=600&q=80',seller:sellerId },
      { title:'Premium Matcha Set',desc:'Ceremonial grade matcha with bamboo whisk and bowl',price:2999,stock:40,cat:'Food',img:'getImg1515823064-d6e0c04616a7?w=600&q=80',seller:seller2Id },
      { title:'Italian Olive Oil Trio',desc:'Extra virgin olive oil collection — Tuscan, Sicilian, Ligurian',price:3499,stock:35,cat:'Food',img:'getImg1474979266404-7eaacbcd87c5?w=600&q=80',seller:seller2Id },
      { title:'Gourmet Coffee Beans',desc:'Single-origin Ethiopian Yirgacheffe — medium roast, 500g',price:899,stock:120,cat:'Food',img:'getImg1559056199-641a0ac8b55e?w=600&q=80',seller:seller2Id },

      // ─── Toys (4) ───
      { title:'LEGO Technic Ferrari SP3',desc:'1:8 scale Ferrari Daytona SP3 — 3778 pieces, collector edition',price:39999,stock:8,cat:'Toys',img:'getImg1587654780291-39c9404d7dd0?w=600&q=80',seller:sellerId },
      { title:'Nintendo Switch OLED',desc:'7" OLED screen, enhanced audio, 64GB storage, white Joy-Cons',price:34999,stock:22,cat:'Toys',img:'getImg1578303512597-81e6cc155b3e?w=600&q=80',seller:sellerId },
      { title:'Rubik\'s Cube Speed Edition',desc:'Magnetic GAN 356 RS — competition-grade speed cube',price:2499,stock:50,cat:'Toys',img:'getImg1577401239170-897c0ddfb30d?w=600&q=80',seller:seller2Id },
      { title:'DJI Osmo Action 4',desc:'Waterproof action camera with 4K/120fps and 1/1.3" sensor',price:27999,stock:15,cat:'Toys',img:'getImg1526170375885-4d8ecf77b99f?w=600&q=80',seller:seller2Id },

      // ─── More Electronics (30) ───
      { title:'Apple Watch Series 9',desc:'45mm GPS + Cellular, S9 chip, Double Tap gesture',price:42900,stock:25,cat:'Electronics',img:'getImg1434493789847-2f02dc6ca35d?w=600&q=80',seller:sellerId },
      { title:'Google Pixel 8 Pro',desc:'Tensor G3, 50MP camera, 7-year updates, AI features',price:79900,stock:18,cat:'Electronics',img:'getImg1592750475338-74b7b21085ab?w=600&q=80',seller:sellerId },
      { title:'OnePlus 12',desc:'Snapdragon 8 Gen 3, 50MP Hasselblad camera, 100W charging',price:64900,stock:20,cat:'Electronics',img:'getImg1598327105666-847775e287b2b?w=600&q=80',seller:sellerId },
      { title:'Sony WF-1000XM5',desc:'Premium ANC earbuds with LDAC and DSEE Extreme',price:19990,stock:40,cat:'Electronics',img:'getImg1590658268037-6bf12165a8d0?w=600&q=80',seller:sellerId },
      { title:'Samsung Galaxy S24 Ultra',desc:'200MP camera, S Pen, titanium frame, AI features',price:129900,stock:15,cat:'Electronics',img:'getImg1610945415299-d9be085916e94?w=600&q=80',seller:sellerId },
      { title:'Nothing Phone 2',desc:'Glyph interface, transparent design, 50MP camera',price:44900,stock:22,cat:'Electronics',img:'getImg1592478411213-61535fba1d83?w=600&q=80',seller:sellerId },
      { title:'JBL Tune 770NC',desc:'Adaptive ANC wireless headphones with 70hr battery',price:5999,stock:65,cat:'Electronics',img:'getImg1505740420928-5e560c06d30e?w=600&q=80',seller:seller2Id },
      { title:'boAt Airdopes 441',desc:'TRUE wireless with Beast mode and IWP technology',price:2499,stock:150,cat:'Electronics',img:'getImg1590658268037-6bf12165a8d0?w=600&q=80',seller:seller2Id },
      { title:'Anker Soundcore Liberty 4',desc:'ACAA 3.0 drivers, 360° spatial audio',price:8990,stock:55,cat:'Electronics',img:'getImg1608043152269-423dbba4e7e1?w=600&q=80',seller:seller2Id },
      { title:'Marshall Stanmore III',desc:'Iconic speaker with 80W Class D amplifiers',price:34999,stock:10,cat:'Electronics',img:'getImg1608043152269-423dbba4e7e1?w=600&q=80',seller:seller2Id },
      { title:'Sonos Era 100',desc:'Room-filling smart speaker with Trueplay',price:14900,stock:18,cat:'Electronics',img:'getImg1608043152269-423dbba4e7e1?w=600&q=80',seller:seller2Id },
      { title:'LG C3 OLED 55"',desc:'Self-lit OLED, Dolby Vision, webOS 23, gaming features',price:109900,stock:8,cat:'Electronics',img:'getImg1595500381741-3309f8cb004a?w=600&q=80',seller:seller2Id },
      { title:'Fire TV Stick 4K Max',desc:'Wi-Fi 6, AV1, Alexa voice remote',price:3999,stock:80,cat:'Electronics',img:'getImg1595500381741-3309f8cb004a?w=600&q=80',seller:sellerId },
      { title:'Roku Streaming Stick 4K',desc:'HDR10+, Dolby Vision, voice remote',price:3499,stock:70,cat:'Electronics',img:'getImg1595500381741-3309f8cb004a?w=600&q=80',seller:sellerId },
      { title:'Logitech MX Master 3S',desc:'Quiet clicks, 8K DPI, MagSpeed scroll wheel',price:7999,stock:45,cat:'Electronics',img:'getImg1527864550417-629defd3cb8b?w=600&q=80',seller:sellerId },
      { title:'Apple Magic Keyboard',desc:'Touch ID, backlit keys, numeric keypad',price:14900,stock:30,cat:'Electronics',img:'getImg1527864550417-629defd3cb8b?w=600&q=80',seller:sellerId },
      { title:'Anker 737 Power Bank',desc:'24,000mAh, 140W, smart display',price:7999,stock:35,cat:'Electronics',img:'getImg1609091838617-d56a4b2622c2?w=600&q=80',seller:seller2Id },
      { title:'Belkin BoostCharge Pro',desc:'3-in-1 MFW, MagSafe, fast charging',price:5999,stock:40,cat:'Electronics',img:'getImg1609091838617-d56a4b2622c2?w=600&q=80',seller:seller2Id },
      { title:'Ring Video Doorbell 4',desc:'1080p, pre-roll, head-to-toe video',price:14999,stock:25,cat:'Electronics',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:sellerId },
      { title:'Philips Hue Starter',desc:'E27 bulbs, Bridge, Dimmer switch — smart lighting',price:5999,stock:50,cat:'Electronics',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:sellerId },
      { title:'Nest Learning Thermostat',desc:'4th gen, AI learning, energy savings',price:22999,stock:15,cat:'Electronics',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:seller2Id },
      { title:'Eufy Robovac X8',desc:'Dual-gyroscope, 2500Pa suction, mapping',price:24999,stock:20,cat:'Electronics',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:seller2Id },
      { title:'Canon EOS R50',desc:'24.2MP, 4K video, DIGIC 7 processor',price:52999,stock:12,cat:'Electronics',img:'getImg1516035069371-29a1b244cc32?w=600&q=80',seller:sellerId },
      { title:'GoPro Hero 12 Black',desc:'5.3K video, HyperSmooth 6.0, waterproof',price:34999,stock:18,cat:'Electronics',img:'getImg1526170375885-4d8ecf77b99f?w=600&q=80',seller:sellerId },
      { title:'Insta360 X4',desc:'8K 360° camera, removable battery, AI editing',price:44999,stock:10,cat:'Electronics',img:'getImg1526170375885-4d8ecf77b99f?w=600&q=80',seller:seller2Id },
      { title:'Oculus Quest 3',desc:'Mixed reality, 512GB, Quest Touch Plus controllers',price:54999,stock:8,cat:'Electronics',img:'getImg1622979135225-d2ba269cf1ac?w=600&q=80',seller:seller2Id },
      { title:'Valve Steam Deck',desc:'512GB, OLED display, PC gaming handheld',price:44999,stock:10,cat:'Electronics',img:'getImg1622979135225-d2ba269cf1ac?w=600&q=80',seller:sellerId },
      { title:'Razer Blade 16',desc:'Intel i9, RTX 4090, 240Hz OLED',price:299999,stock:5,cat:'Electronics',img:'getImg1593642702821-8fda2b48a8d0?w=600&q=80',seller:seller2Id },
      { title:'LG Gram Pro 17',desc:'17" Ultra-light, Intel Evo, 80Wh battery',price:149900,stock:8,cat:'Electronics',img:'getImg1593642702821-8fda2b48a8d0?w=600&q=80',seller:seller2Id },
      { title:'ASUS ROG Phone 8',desc:'Snapdragon 8 Gen 3, 165Hz, AeroActive Cooler',price:79999,stock:12,cat:'Electronics',img:'getImg1595500381741-3309f8cb004a?w=600&q=80',seller:sellerId },

      // ─── More Clothing (20) ───
      { title:'Nike Dunk Low',desc:'Classic basketball-inspired sneaker, padded collar',price:8995,stock:80,cat:'Clothing',img:'getImg1542291026-7eec264c27ff?w=600&q=80',seller:sellerId },
      { title:'Adidas Samba OG',desc:'Iconic indoor silhouette, leather upper',price:7999,stock:90,cat:'Clothing',img:'getImg1542291026-7eec264c27ff?w=600&q=80',seller:seller2Id },
      { title:'Converse Chuck 70',desc:'Premium canvas, vintage details, cushioning',price:4999,stock:110,cat:'Clothing',img:'getImg1463100099587-383f3432a5ae?w=600&q=80',seller:sellerId },
      { title:'Vans Old Skool',desc:'Classic skate shoe, suede/canvas, waffle outsole',price:4499,stock:120,cat:'Clothing',img:'getImg1525966222134-fcfa99b8ae51?w=600&q=80',seller:seller2Id },
      { title:'New Balance 574',desc:'ENCAP midsole, suede/mesh upper',price:6999,stock:85,cat:'Clothing',img:'getImg1539185441755-7694732a8b27?w=600&q=80',seller:sellerId },
      { title:'Puma Suede Classic',desc:'Legendary silhouette, formstrip detail',price:3999,stock:95,cat:'Clothing',img:'getImg1525966222134-fcfa99b8ae51?w=600&q=80',seller:seller2Id },
      { title:'Timberland 6" Premium',desc:'Waterproof leather, padded collar',price:12999,stock:50,cat:'Clothing',img:'getImg1551107696-a4bdf5dd93db?w=600&q=80',seller:sellerId },
      { title:'Dr. Martens 1460',desc:'8-eye boot, air-cushionedsole',price:9999,stock:65,cat:'Clothing',img:'getImg1608256246200-920c2d8ccc4d?w=600&q=80',seller:seller2Id },
      { title:'Everlane Trench Coat',desc:'Italian wool, minimalist design, below-knee length',price:24999,stock:30,cat:'Clothing',img:'getImg1544923246-77307dd270cb?w=600&q=80',seller:sellerId },
      { title:'All Saints Leather Jacket',desc:'Real lambskin, asymmetric zip',price:39999,stock:15,cat:'Clothing',img:'getImg1551028719-00167b16eac5?w=600&q=80',seller:seller2Id },
      { title:'Champion Reverse Weave',desc:'Fleece hoodie, side panels, C logo',price:3999,stock:100,cat:'Clothing',img:'getImg1578681987667-618d9dee8d49?w=600&q=80',seller:sellerId },
      { title:'Stussy Basic Hoodie',desc:'Heavyweight cotton, embroidered logo',price:5999,stock:75,cat:'Clothing',img:'getImg1578681987667-618d9dee8d49?w=600&q=80',seller:seller2Id },
      { title:'Patagonia Nano Puff',desc:'60g Primaloft Eco, recycled shell',price:9999,stock:40,cat:'Clothing',img:'getImg1544923246-77307dd270cb?w=600&q=80',seller:sellerId },
      { title:'Arc\'teryx Atom LT',desc:', Gore-Tex Infinium, Coreloft insulation',price:16999,stock:25,cat:'Clothing',img:'getImg1544923246-77307dd270cb?w=600&q=80',seller:seller2Id },
      { title:'Casio G-Shock',desc:'200m water resistance, shock resistant',price:9999,stock:90,cat:'Clothing',img:'getImg1585123334904-845d60e97b29?w=600&q=80',seller:sellerId },
      { title:'Seiko 5 Sports',desc:'Automatic, 100m water resistant, day-date',price:7999,stock:70,cat:'Clothing',img:'getImg1585123334904-845d60e97b29?w=600&q=80',seller:seller2Id },
      { title:'Tissot PRX',desc:'Quartz, 40mm, sapphire crystal',price:14999,stock:45,cat:'Clothing',img:'getImg1585123334904-845d60e97b29?w=600&q=80',seller:sellerId },
      { title:'MVMT Watch',desc:'Minimalist design, Italian leather strap',price:6999,stock:80,cat:'Clothing',img:'getImg1585123334904-845d60e97b29?w=600&q=80',seller:seller2Id },
      { title:'Casual Linen Shirt',desc:'100% linen, relaxed fit, mother-of-pearl buttons',price:2999,stock:110,cat:'Clothing',img:'getImg1596755094514-f87e34085c89?w=600&q=80',seller:sellerId },
      { title:'Bare Essentials Tee',desc:'Pima cotton, crew neck, slim fit',price:1999,stock:150,cat:'Clothing',img:'getImg1521572163474-6864f9cf17ab?w=600&q=80',seller:seller2Id },

      // ─── More Books (15) ───
      { title:'Project Hail Mary',desc:'Andy Weir — A lone astronaut must save humanity',price:599,stock:180,cat:'Books',img:'getImg1544947950-fa07a98d237f?w=600&q=80',seller:sellerId },
      { title:'The Midnight Library',desc:'Matt Haig — Between life and death there is a library',price:449,stock:200,cat:'Books',img:'getImg1544947950-fa07a98d237f?w=600&q=80',seller:seller2Id },
      { title:'Educated',desc:'Tara Westover — A memoir about seeking knowledge',price:399,stock:220,cat:'Books',img:'getImg1544947950-fa07a98d237f?w=600&q=80',seller:sellerId },
      { title:'Where the Crawdads Sing',desc:'Delia Owens — A coming-of-age story and mystery',price:499,stock:190,cat:'Books',img:'getImg1544947950-fa07a98d237f?w=600&q=80',seller:seller2Id },
      { title:'The Silent Patient',desc:'Alex Michaelides — A shocking psychological thriller',price:449,stock:170,cat:'Books',img:'getImg1544947950-fa07a98d237f?w=600&q=80',seller:sellerId },
      { title:'Kanban',desc:'David J. Anderson — Visualizing work to maximize flow',price:799,stock:100,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:seller2Id },
      { title:'The Lean Startup',desc:'Eric Ries — How today\'s entrepreneurs build continuous innovation',price:699,stock:140,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:sellerId },
      { title:'Zero to One',desc:'Peter Thiel — Notes on startups, or how to build the future',price:499,stock:160,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:sellerId },
      { title:'The Hard Thing About Hard Things',desc:'Ben Horowitz — Building a business when there are no easy answers',price:599,stock:130,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:seller2Id },
      { title:'Good to Great',desc:'Jim Collins — Why some companies make the leap',price:699,stock:150,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:sellerId },
      { title:'The Pragmatic Programmer',desc:'David Thomas — Your journey to mastery',price:899,stock:110,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:seller2Id },
      { title:'Clean Code',desc:'Robert C. Martin — A handbook of agile software craftsmanship',price:699,stock:125,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:sellerId },
      { title:'Design Patterns',desc:'Gang of Four — Elements of reusable object-oriented software',price:899,stock:95,cat:'Books',img:'getImg1512820790803-83ca734da794?w=600&q=80',seller:sellerId },
      { title:'The Phoenix Project',desc:'Gene Kim — A novel about IT, DevOps, and helping your business win',price:549,stock:145,cat:'Books',img:'getImg1544947950-fa07a98d237f?w=600&q=80',seller:seller2Id },
      { title:'Rework',desc:'Jason Fried — Business without the traditional MBA',price:399,stock:180,cat:'Books',img:'getImg1544947950-fa07a98d237f?w=600&q=80',seller:sellerId },

      // ─── More Home (15) ───
      { title:'Robot Vacuum S9+',desc:'Self-emptying, LiDAR navigation, Pet-friendly',price:79999,stock:8,cat:'Home',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:sellerId },
      { title:'Air Fryer XXL',desc:'8-quart, digital touchscreen, 8 cooking functions',price:12999,stock:25,cat:'Home',img:'getImg1585771724684-38269d6639fd?w=600&q=80',seller:seller2Id },
      { title:'Instant Pot Duo 7-in-1',desc:'7 functions, 6 quart, programmable',price:8999,stock:35,cat:'Home',img:'getImg1585771724684-38269d6639fd?w=600&q=80',seller:sellerId },
      { title:'Dyson Hot+Cool',desc:'Air Multiplier, HEPA filter, thermostat',price:34999,stock:12,cat:'Home',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:seller2Id },
      { title:'Coway Water Purifier',desc:'5-stage filtration, mineral filter, cold/hot water',price:19999,stock:20,cat:'Home',img:'getImg1585771724684-38269d6639fd?w=600&q=80',seller:sellerId },
      { title:'Xiaomi Smart Home Hub',desc:'Multi-protocol, local control, Matter support',price:4999,stock:50,cat:'Home',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:seller2Id },
      { title:'Eureka Forbes Vacuum',desc:'Bagless, HEPA filter, 1400W',price:6999,stock:30,cat:'Home',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:sellerId },
      { title:'Panasonic Microwave',desc:'Inverter technology, 27L, auto cook',price:8999,stock:28,cat:'Home',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:seller2Id },
      { title:'Mixer Grinder 750W',desc:'3 jars, stainless steel, overload protection',price:4999,stock:45,cat:'Home',img:'getImg1585771724684-38269d6639fd?w=600&q=80',seller:sellerId },
      { title:'pressure Cooker 5L',desc:'Stainless steel, preset cooking modes, safety valve',price:3499,stock:60,cat:'Home',img:'getImg1585771724684-38269d6639fd?w=600&q=80',seller:seller2Id },
      { title:'Cotton Bedsheet Set',desc:'400TC, king size, 6-piece set',price:4999,stock:55,cat:'Home',img:'getImg1522771739844-6a2b7dab4c1d?w=600&q=80',seller:sellerId },
      { title:'Memory Foam Pillow',desc:'Ergonomic, ventilated, washable cover',price:2499,stock:80,cat:'Home',img:'getImg1522771739844-6a2b7dab4c1d?w=600&q=80',seller:seller2Id },
      { title:'Smart LED Strip 5m',desc:'RGBIC, music sync, app control, 16M colors',price:2999,stock:95,cat:'Home',img:'getImg1558618666-fcd25c85f82e?w=600&q=80',seller:sellerId },
      { title:'Table Lamp Minimalist',desc:'LED, dimmable, wireless charging base',price:3999,stock:65,cat:'Home',img:'getImg1507003211169-0a1dd7228f2d?w=600&q=80',seller:seller2Id },
      { title:'Storage Ottoman',desc:'Faux leather, storage interior, set of 2',price:5999,stock:40,cat:'Home',img:'getImg1553062407-98eeb64c6a62?w=600&q=80',seller:sellerId },

      // ─── More Sports (15) ───
      { title:'Cricket Bat SG',desc:'Grade 1 willow, Kashmir, Kashmir willow',price:2999,stock:50,cat:'Sports',img:'getImg1622279457486-62dcc4a431d6?w=600&q=80',seller:sellerId },
      { title:'Badminton Set',desc:'Pro racket, shuttlecocks,grip, bag',price:2499,stock:70,cat:'Sports',img:'getImg1622279457486-62dcc4a431d6?w=600&q=80',seller:seller2Id },
      { title:'Tennis Balls Pack',desc:'Championship grade, ITF approved, 12-pack',price:999,stock:120,cat:'Sports',img:'getImg1622279457486-62dcc4a431d6?w=600&q=80',seller:sellerId },
      { title:'Basketball Indoor',desc:'Official size, competition grade, composite leather',price:1999,stock:80,cat:'Sports',img:'getImg1519861531473-9200262188bf?w=600&q=80',seller:seller2Id },
      { title:'Football Nike',desc:'Premier league ball, aerodynamic panels',price:2499,stock:65,cat:'Sports',img:'getImg1579952363873-27f3bade9f55?w=600&q=80',seller:sellerId },
      { title:'Cycling Helmet',desc:'MIPS, ventilation, adjustable fit',price:3999,stock:45,cat:'Sports',img:'getImg1534438327276-14e5300c3a48?w=600&q=80',seller:seller2Id },
      { title:'Resistance Bands Set',desc:'5 levels, door anchor, carrying bag',price:1499,stock:110,cat:'Sports',img:'getImg1534438327276-14e5300c3a48?w=600&q=80',seller:sellerId },
      { title:'Ab Roller',desc:'Stainless steel, non-slip wheel',price:999,stock:90,cat:'Sports',img:'getImg1534438327276-14e5300c3a48?w=600&q=80',seller:seller2Id },
      { title:'Pull-Up Bar',desc:'Doorway, no screws, foam grips',price:1999,stock:75,cat:'Sports',img:'getImg1534438327276-14e5300c3a48?w=600&q=80',seller:sellerId },
      { title:'Dumbbells Adjustable',desc:'5-25 lbs, quick-change, space-saving',price:7999,stock:35,cat:'Sports',img:'getImg1584735935682-2f2b69dff9d2?w=600&q=80',seller:sellerId },
      { title:'Kettlebell Cast Iron',desc:'16kg, powder-coated, wide handle',price:3499,stock:50,cat:'Sports',img:'getImg1584735935682-2f2b69dff9d2?w=600&q=80',seller:seller2Id },
      { title:'Gym Flooring Tiles',desc:'Interlocking, shock-absorbing, 12-pack',price:4999,stock:40,cat:'Sports',img:'getImg1534438327276-14e5300c3a48?w=600&q=80',seller:sellerId },
      { title:'Boxing Gloves',desc:'Leather, gel padding, wrist support',price:2999,stock:60,cat:'Sports',img:'getImg1549719386-74edc3548ca2?w=600&q=80',seller:sellerId },
      { title:'Skipping Rope Speed',desc:'Adjustable, ball bearings, carry bag',price:699,stock:130,cat:'Sports',img:'getImg1574600245297-b0c4f0c99b5e?w=600&q=80',seller:seller2Id },
      { title:'Sports Sunglasses',desc:'Polarized, UV400, anti-slip nose pad',price:2499,stock:85,cat:'Sports',img:'getImg1572635196237-14b3f281503f?w=600&q=80',seller:sellerId },

      // ─── More Beauty (15) ───
      { title:'Curology Serum',desc:'Custom formula, dermatologist-designed, 30-day supply',price:3999,stock:45,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:sellerId },
      { title:'Laneige Lip Mask',desc:'Overnight lip care, berry, 20g',price:999,stock:120,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:seller2Id },
      { title:'Clinique Drama Kit',desc:'Mascara, eyeliner, lipstick set',price:3999,stock:50,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:sellerId },
      { title:'Fenty Lipstick Set',desc:'Iconic shades, mini set of 6',price:4999,stock:40,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:seller2Id },
      { title:'Glossier Eyedrop',desc:'Foundation serum, buildable coverage',price:3499,stock:55,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:sellerId },
      { title:'Drunk Elephant Oil',desc:'Marula oil, antioxidant-rich, cold-pressed',price:4999,stock:35,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:seller2Id },
      { title:'Paula\'s Choice BHA',desc:'2% salicylic acid, exfoliating toner',price:2499,stock:65,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:sellerId },
      { title:'La Roche-Posay SPF',desc:' Anthelios, SPF 50+, invisible fluid',price:1999,stock:90,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:seller2Id },
      { title:'CeraVe Moisturizing',desc:'Ceramides, hyaluronic acid, 177ml',price:1299,stock:110,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:sellerId },
      { title:'The Inkey List',desc:'Retinol, hyaluronic acid, polyglutamic acid',price:1799,stock:75,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:seller2Id },
      { title:'Nivea Body Lotion',desc:'Deep care, shea butter, 400ml',price:599,stock:200,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:sellerId },
      { title:'Dove Deodorant',desc:'48hr protection, aluminium-free, pack of 3',price:399,stock:250,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:seller2Id },
      { title:'Olay Regenerist',desc:'Vitamin B3, peptide, anti-aging',price:2499,stock:60,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:sellerId },
      { title:'Cetaphil Cleanser',desc:'Gentle,soap-free, 250ml',price:899,stock:130,cat:'Beauty',img:'getImg1556228578-0d85b1a4d571?w=600&q=80',seller:seller2Id },
      { title:'Vaseline Body Oil',desc:'Pure petroleum jelly, micro-oil, 400ml',price:499,stock:180,cat:'Beauty',img:'getImg1596462502278-27bfdc403348?w=600&q=80',seller:sellerId },

      // ─── More Food (10) ───
      { title:'Protein Powder',desc:'Whey isolate, 2lb, chocolate',price:3499,stock:55,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:sellerId },
      { title:'Green Tea Collection',desc:'Matcha, sencha, hojicha sampler',price:999,stock:80,cat:'Food',img:'getImg1564890369478-c89ca6d9cde9?w=600&q=80',seller:seller2Id },
      { title:'Protein Bar Box',desc:'20g protein, pack of 12, assorted',price:1499,stock:90,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:sellerId },
      { title:'Dried Mango',desc:'Unsweetened, 200g, natural',price:699,stock:70,cat:'Food',img:'getImg1623065422902-30c8d2e08d06?w=600&q=80',seller:seller2Id },
      { title:'Granola Mix',desc:'Organic oats, nuts, honey, 500g',price:899,stock:85,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:sellerId },
      { title:'Trail Mix Pack',desc:'Nuts, dried fruits, dark chocolate, 6-pack',price:1299,stock:65,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:seller2Id },
      { title:'Almond Butter',desc:'Stone-ground, cream, 340g',price:1199,stock:50,cat:'Food',img:'getImg1623065422902-30c8d2e08d06?w=600&q=80',seller:sellerId },
      { title:'Chia Seeds',desc:'Organic, 500g, omega-3 rich',price:599,stock:100,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:seller2Id },
      { title:'Quinoa Pack',desc:'Tricolor, organic, 1kg',price:799,stock:75,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:sellerId },
      { title:'Honey Jar',desc:'Raw, organic, 500ml',price:699,stock:95,cat:'Food',img:'getImg1587049352846-4a222e784d38?w=600&q=80',seller:seller2Id },

      // ─── More Toys (10) ───
      { title:'PlayStation 5',desc:'Digital edition, 825GB SSD, DualSense',price:44999,stock:8,cat:'Toys',img:'getImg1606144042614-2412458bfc6e?w=600&q=80',seller:sellerId },
      { title:'Xbox Series X',desc:'1TB SSD, Quick Resume, Ray Tracing',price:49999,stock:6,cat:'Toys',img:'getImg1606144042614-2412458bfc6e?w=600&q=80',seller:seller2Id },
      { title:'PS5 Controller',desc:'DualSense, haptic feedback, adaptive triggers',price:5999,stock:40,cat:'Toys',img:'getImg1606144042614-2412458bfc6e?w=600&q=80',seller:sellerId },
      { title:'Gaming Headset',desc:'7.1 surround, noise-cancel mic, wired',price:4999,stock:45,cat:'Toys',img:'getImg1606144042614-2412458bfc6e?w=600&q=80',seller:seller2Id },
      { title:'Racing Wheel',desc:'Force feedback, pedals included',price:24999,stock:10,cat:'Toys',img:'getImg1622979135225-d2ba269cf1ac?w=600&q=80',seller:sellerId },
      { title:'Arcade Stick',desc:'Sanwa JLF lever, RGB lighting',price:7999,stock:20,cat:'Toys',img:'getImg1622979135225-d2ba269cf1ac?w=600&q=80',seller:seller2Id },
      { title:'Retro Handheld',desc:'3.5" screen, 64GB, 10K+ games',price:9999,stock:15,cat:'Toys',img:'getImg1622979135225-d2ba269cf1ac?w=600&q=80',seller:sellerId },
      { title:'Playing Cards',desc:'Bicycle, 2 decks, marked',price:399,stock:150,cat:'Toys',img:'getImg1577401239170-897c0ddfb30d?w=600&q=80',seller:seller2Id },
      { title:'Chess Set',desc:'Staunton pieces, folding board',price:2999,stock:55,cat:'Toys',img:'getImg1529699211952-2ade7e0f08d4?w=600&q=80',seller:sellerId },
      { title:'Board Game',desc:'Catan, strategy classic, 3-4 players',price:2499,stock:40,cat:'Toys',img:'getImg1610890716171-6f8a2e879c1a?w=600&q=80',seller:seller2Id },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (seller_id, category_id, title, description, price, stock_quantity, image_url, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [p.seller, catIds[p.cat], p.title, p.desc, p.price, p.stock, p.img, 'active']
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seeded: 1 admin, 2 sellers, 1 customer, 8 categories, 200 products');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

seed();
