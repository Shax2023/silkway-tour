const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data', 'travel_agency.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS agency_settings (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      whatsapp TEXT,
      telegram TEXT,
      email TEXT,
      address TEXT,
      license_no TEXT,
      about_text TEXT,
      currency TEXT DEFAULT 'USD',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      stars INTEGER NOT NULL DEFAULT 4,
      address TEXT,
      phone TEXT,
      email TEXT,
      description TEXT,
      image_url TEXT,
      contract_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hotel_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_id INTEGER NOT NULL,
      room_name TEXT NOT NULL,
      capacity INTEGER DEFAULT 2,
      price_per_night_usd REAL NOT NULL,
      description TEXT,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS train_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_name TEXT NOT NULL,
      train_number TEXT,
      train_type TEXT NOT NULL,
      from_city TEXT NOT NULL,
      to_city TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      duration TEXT NOT NULL,
      economy_price_usd REAL NOT NULL,
      business_price_usd REAL NOT NULL,
      vip_price_usd REAL NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tour_proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_code TEXT UNIQUE NOT NULL,
      package_title TEXT NOT NULL,
      customer_origin TEXT,
      cities TEXT,
      budget_usd REAL,
      duration_days INTEGER,
      total_estimated_usd REAL,
      itinerary_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tour_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_code TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_country TEXT,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_whatsapp TEXT,
      start_date TEXT,
      number_of_travelers INTEGER DEFAULT 1,
      special_requests TEXT,
      selected_package_title TEXT,
      total_price_usd REAL,
      full_itinerary_json TEXT,
      status TEXT DEFAULT 'new', -- new, contacted, in_progress, confirmed, cancelled
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      languages TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'All Uzbekistan',
      license_number TEXT,
      daily_rate_usd REAL NOT NULL DEFAULT 50.0,
      phone TEXT,
      bio TEXT,
      image_url TEXT,
      rating REAL DEFAULT 4.9,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS flight_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      airline TEXT NOT NULL,
      flight_number TEXT NOT NULL,
      from_city TEXT NOT NULL,
      to_city TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      duration TEXT NOT NULL,
      economy_price_usd REAL NOT NULL,
      business_price_usd REAL NOT NULL,
      baggage_allowance TEXT DEFAULT '30 kg check-in + 8 kg cabin',
      days_of_week TEXT DEFAULT 'Har kuni (Daily)',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS cultural_experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      city TEXT NOT NULL,
      category TEXT DEFAULT 'masterclass',
      price_usd REAL NOT NULL,
      duration TEXT,
      description TEXT,
      icon TEXT DEFAULT 'fa-utensils',
      is_active INTEGER DEFAULT 1
    );
  `);

  seedData();
}

function seedData() {
  // 1. Seed Agency Settings
  const agencyCount = db.prepare('SELECT COUNT(*) as count FROM agency_settings').get().count;
  if (agencyCount === 0) {
    db.prepare(`
      INSERT INTO agency_settings (id, name, phone, whatsapp, telegram, email, address, license_no, about_text, currency)
      VALUES (
        1,
        'Silk Road — by M.S',
        '+998 71 200 45 45',
        '+998 90 987 65 43',
        '@SilkRoad_MS',
        'contact@silkroad-ms.uz',
        '14 Amir Temur Avenue, Mirabad District, Tashkent, Uzbekistan',
        'T-UZB-2024-8841',
        'Silk Road by M.S is a luxury Silk Road tour operator specializing exclusively in crafting bespoke, authentic, and seamless travel journeys across ancient Uzbekistan (Samarkand, Bukhara, Khiva) for international guests.',
        'USD'
      )
    `).run();
  }

  // 2. Seed Admin User (admin / admin123)
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get().count;
  if (adminCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO admin_users (username, password_hash, full_name, role)
      VALUES ('admin', ?, 'Chief Tour Operator (Admin)', 'admin')
    `).run(hash);
  }

  // 3. Seed Contracted Hotels and Rooms
  const hotelCount = db.prepare('SELECT COUNT(*) as count FROM hotels').get().count;
  if (hotelCount === 0) {
    const insertHotel = db.prepare(`
      INSERT INTO hotels (name, city, stars, address, phone, email, description, image_url, contract_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertRoom = db.prepare(`
      INSERT INTO hotel_rooms (hotel_id, room_name, capacity, price_per_night_usd, description, is_available)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const initialHotels = [
      // Tashkent
      {
        name: 'Hyatt Regency Tashkent',
        city: 'Tashkent',
        stars: 5,
        address: '1 Navoi Avenue, Tashkent',
        phone: '+998 71 207 12 34',
        email: 'tashkent.regency@hyatt.com',
        description: 'Luxury 5-star hotel in the heart of Tashkent with indoor pool, spa, and panoramic rooftop lounge.',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Standard King Room', capacity: 2, price: 180, desc: 'Spacious 42 sqm room with city view, king bed and marble bath' },
          { name: 'Deluxe Twin Room', capacity: 2, price: 210, desc: 'Luxury room with two double beds and executive lounge access' },
          { name: 'Regency Executive Suite', capacity: 3, price: 340, desc: 'Large luxury suite with separate living room and skyline vistas' }
        ]
      },
      {
        name: 'Hotel Uzbekistan',
        city: 'Tashkent',
        stars: 4,
        address: '45 Musakhanov Street, Amir Temur Square, Tashkent',
        phone: '+998 71 113 11 11',
        email: 'booking@hoteluzbekistan.uz',
        description: 'Iconic historic landmark overlooking Amir Temur Square with classic architecture and modern amenities.',
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Classic Single', capacity: 1, price: 55, desc: 'Cozy room with single bed and square view' },
          { name: 'Superior Double / Twin', capacity: 2, price: 75, desc: 'Renovated comfortable room with private balcony' },
          { name: 'Junior Suite', capacity: 2, price: 110, desc: 'Spacious suite with heritage interior and sitting lounge' }
        ]
      },
      {
        name: 'Art Hotel Tashkent',
        city: 'Tashkent',
        stars: 3,
        address: 'Zarbog Street 24, Yakkasaray, Tashkent',
        phone: '+998 71 252 50 50',
        email: 'info@arthotel.uz',
        description: 'Charming boutique hotel featuring traditional Uzbek ceramic decor and a peaceful courtyard garden.',
        image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Standard Double', capacity: 2, price: 45, desc: 'Air-conditioned room with oriental furnishings' },
          { name: 'Deluxe Triple', capacity: 3, price: 65, desc: 'Great for families or friends, includes traditional breakfast' }
        ]
      },

      // Samarkand
      {
        name: 'Silk Road by Samarkand (Registan Plaza)',
        city: 'Samarkand',
        stars: 4,
        address: '53 Shohrukh Mirzo Street, Samarkand',
        phone: '+998 66 233 40 40',
        email: 'info@registanplaza.uz',
        description: 'Premium central hotel minutes away from Gur-e-Amir Mausoleum and Registan Square with authentic Uzbek hospitality.',
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Standard Twin Room', capacity: 2, price: 85, desc: 'Comfortable twin room with complimentary oriental breakfast' },
          { name: 'Deluxe King Heritage', capacity: 2, price: 125, desc: 'Refined decor inspired by Silk Road motifs with king-size bed' },
          { name: 'Presidential Suite', capacity: 4, price: 260, desc: 'Exclusive VIP suite with dining area and Registan views' }
        ]
      },
      {
        name: 'Mövenpick Samarkand',
        city: 'Samarkand',
        stars: 5,
        address: 'University Boulevard 30, Samarkand',
        phone: '+998 66 232 99 99',
        email: 'hotel.samarkand@movenpick.com',
        description: 'World-class 5-star Swiss luxury nestled on tree-lined University Boulevard, walking distance to ancient sights.',
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Classic Queen', capacity: 2, price: 165, desc: 'Modern Swiss luxury with ergonomic bed and high-speed Wi-Fi' },
          { name: 'Executive Suite', capacity: 2, price: 275, desc: 'Expansive suite with lounge and afternoon chocolate hour' }
        ]
      },
      {
        name: 'Hotel Diyora Samarkand',
        city: 'Samarkand',
        stars: 3,
        address: 'Ibn Sina Street 112, Samarkand',
        phone: '+998 66 235 60 70',
        email: 'diyorahotel@gmail.com',
        description: 'Cozy, authentic family-run hotel located 300 meters from Bibi-Khanym Mosque and Siyob Bazaar.',
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Standard Single', capacity: 1, price: 40, desc: 'Quiet room with tea maker and garden view' },
          { name: 'Standard Double / Twin', capacity: 2, price: 55, desc: 'Traditional wood-carved details, private bath and breakfast' }
        ]
      },

      // Bukhara
      {
        name: 'Shahristan Boutique Hotel',
        city: 'Bukhara',
        stars: 4,
        address: 'Bahauddin Naqshband Street 82, Bukhara',
        phone: '+998 65 224 45 45',
        email: 'info@shahristanhotel.uz',
        description: 'Authentic 19th-century merchant courtyard converted into a luxury boutique hotel right next to Lyabi-Hauz complex.',
        image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Oriental Double Room', capacity: 2, price: 80, desc: 'Hand-painted ceilings with modern en-suite amenities' },
          { name: 'Courtyard Deluxe Twin', capacity: 2, price: 110, desc: 'Direct access to the tranquil aivan courtyard fountain' },
          { name: 'Khan Heritage Suite', capacity: 3, price: 160, desc: 'Masterpiece of Bukharian carving and silk tapestries' }
        ]
      },
      {
        name: 'Asia Bukhara Hotel',
        city: 'Bukhara',
        stars: 4,
        address: 'M. Ambar Street 49, Bukhara',
        phone: '+998 65 224 64 64',
        email: 'reservation@asiabukhara.uz',
        description: 'Popular hotel with outdoor swimming pool, sauna, and traditional restaurant located near the old gates of Bukhara.',
        image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Standard Twin', capacity: 2, price: 70, desc: 'Air-conditioned bright room with satellite TV' },
          { name: 'Superior Double', capacity: 2, price: 90, desc: 'Poolside view room with minibar and bathrobe' }
        ]
      },
      {
        name: 'KomiL Boutique Hotel',
        city: 'Bukhara',
        stars: 3,
        address: 'Ali-Xon Street 40, Bukhara',
        phone: '+998 65 224 44 68',
        email: 'komiltravel@hotmail.com',
        description: 'Exquisite 19th-century private Jewish quarter mansion renowned for intricate ganch plaster carvings and personalized service.',
        image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Traditional Single', capacity: 1, price: 45, desc: 'Authentic historical atmosphere with breakfast included' },
          { name: 'Historic Deluxe Double', capacity: 2, price: 65, desc: 'Original antique wall carvings and king bed' }
        ]
      },

      // Khiva
      {
        name: 'Orient Star Khiva (inside Ichan-Qala)',
        city: 'Khiva',
        stars: 4,
        address: '1 Pakhlavan Makhmud Street, inside Ichan-Qala, Khiva',
        phone: '+998 62 375 31 72',
        email: 'orientstarkhiva@mail.ru',
        description: 'Unforgettable opportunity to sleep inside the historical 1855 Muhammad Amin-khan Madrassah right next to the Kalta-Minor Minaret.',
        image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Authentic Madrassah Cell Room', capacity: 2, price: 75, desc: 'Former student cell with thick cool brick walls and modern bath' },
          { name: 'Deluxe Madrassah King', capacity: 2, price: 105, desc: 'Vaulted ceiling, oriental carpet and view of Kalta-Minor' }
        ]
      },
      {
        name: 'Farovon Khiva Hotel',
        city: 'Khiva',
        stars: 5,
        address: 'Yangiariq Road, Khiva',
        phone: '+998 62 227 99 99',
        email: 'welcome@farovonkhiva.uz',
        description: 'State-of-the-art 5-star resort hotel combining Khorezmian majestic fort architecture with luxury amenities and Turkish hammam.',
        image_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Superior King', capacity: 2, price: 140, desc: 'Magnificent 40 sqm room with panoramic oasis view' },
          { name: 'Executive Silk Suite', capacity: 3, price: 230, desc: 'Two rooms with terrace overlooking the ancient silhouette of Khiva' }
        ]
      },
      {
        name: 'Hotel Arkanchi Khiva',
        city: 'Khiva',
        stars: 3,
        address: '10 Pakhlavan Makhmud Street, inside Ichan-Qala, Khiva',
        phone: '+998 62 375 22 30',
        email: 'arkanchi@khiva.uz',
        description: 'Friendly hotel situated right inside the fortress walls featuring a rooftop terrace with 360-degree views of minarets.',
        image_url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80',
        rooms: [
          { name: 'Standard Twin', capacity: 2, price: 45, desc: 'Quiet comfortable room with fortress breeze' },
          { name: 'Triple Comfort', capacity: 3, price: 65, desc: 'Spacious room with traditional silk suzani wall decor' }
        ]
      }
    ];

    const transaction = db.transaction(() => {
      for (const h of initialHotels) {
        const result = insertHotel.run(h.name, h.city, h.stars, h.address, h.phone, h.email, h.description, h.image_url);
        const hotelId = result.lastInsertRowid;
        for (const r of h.rooms) {
          insertRoom.run(hotelId, r.name, r.capacity, r.price, r.desc);
        }
      }
    });
    transaction();
  }

  // 4. Seed Contracted Train Routes & Timetables
  const trainCount = db.prepare('SELECT COUNT(*) as count FROM train_routes').get().count;
  if (trainCount === 0) {
    const insertTrain = db.prepare(`
      INSERT INTO train_routes (train_name, train_number, train_type, from_city, to_city, departure_time, arrival_time, duration, economy_price_usd, business_price_usd, vip_price_usd, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const initialTrains = [
      // Tashkent <-> Samarkand
      { name: 'Afrosiyob High-Speed', num: '762F', type: 'High-Speed Bullet Train', from: 'Tashkent', to: 'Samarkand', dep: '07:30', arr: '09:45', dur: '2h 15m', eco: 16, bus: 25, vip: 38 },
      { name: 'Afrosiyob High-Speed', num: '764F', type: 'High-Speed Bullet Train', from: 'Tashkent', to: 'Samarkand', dep: '08:30', arr: '10:45', dur: '2h 15m', eco: 16, bus: 25, vip: 38 },
      { name: 'Afrosiyob High-Speed', num: '766F', type: 'High-Speed Bullet Train', from: 'Samarkand', to: 'Tashkent', dep: '17:30', arr: '19:45', dur: '2h 15m', eco: 16, bus: 25, vip: 38 },
      { name: 'Sharq Fast Express', num: '010F', type: 'Fast Express Train', from: 'Samarkand', to: 'Tashkent', dep: '18:15', arr: '21:30', dur: '3h 15m', eco: 12, bus: 18, vip: 28 },

      // Samarkand <-> Bukhara
      { name: 'Afrosiyob High-Speed', num: '762F', type: 'High-Speed Bullet Train', from: 'Samarkand', to: 'Bukhara', dep: '09:50', arr: '11:20', dur: '1h 30m', eco: 14, bus: 22, vip: 32 },
      { name: 'Afrosiyob High-Speed', num: '766F', type: 'High-Speed Bullet Train', from: 'Bukhara', to: 'Samarkand', dep: '15:50', arr: '17:20', dur: '1h 30m', eco: 14, bus: 22, vip: 32 },
      { name: 'Sharq Fast Express', num: '010F', type: 'Fast Express Train', from: 'Samarkand', to: 'Bukhara', dep: '12:40', arr: '15:10', dur: '2h 30m', eco: 10, bus: 16, vip: 24 },

      // Tashkent <-> Bukhara (Direct)
      { name: 'Afrosiyob High-Speed', num: '762F', type: 'High-Speed Bullet Train', from: 'Tashkent', to: 'Bukhara', dep: '07:30', arr: '11:20', dur: '3h 50m', eco: 24, bus: 38, vip: 58 },
      { name: 'Afrosiyob High-Speed', num: '766F', type: 'High-Speed Bullet Train', from: 'Bukhara', to: 'Tashkent', dep: '15:50', arr: '19:45', dur: '3h 55m', eco: 24, bus: 38, vip: 58 },

      // Bukhara <-> Khiva
      { name: 'Kyzylkum Express', num: '126F', type: 'Fast Express Train', from: 'Bukhara', to: 'Khiva', dep: '12:25', arr: '18:35', dur: '6h 10m', eco: 18, bus: 28, vip: 45 },
      { name: 'Kyzylkum Express', num: '125F', type: 'Fast Express Train', from: 'Khiva', to: 'Bukhara', dep: '08:45', arr: '14:55', dur: '6h 10m', eco: 18, bus: 28, vip: 45 },

      // Samarkand <-> Khiva
      { name: 'Silk Way Night Train', num: '056F', type: 'Night Sleeper Train', from: 'Samarkand', to: 'Khiva', dep: '01:15', arr: '09:20', dur: '8h 05m', eco: 22, bus: 34, vip: 55 },

      // Khiva <-> Tashkent (Direct Overnighter)
      { name: 'Khiva Night Express', num: '126F', type: 'Night Sleeper Train', from: 'Khiva', to: 'Tashkent', dep: '18:45', arr: '08:15', dur: '13h 30m', eco: 28, bus: 44, vip: 68 },
      { name: 'Khiva Night Express', num: '125F', type: 'Night Sleeper Train', from: 'Tashkent', to: 'Khiva', dep: '20:30', arr: '10:00', dur: '13h 30m', eco: 28, bus: 44, vip: 68 }
    ];

    const trainTx = db.transaction(() => {
      for (const t of initialTrains) {
        insertTrain.run(t.name, t.num, t.type, t.from, t.to, t.dep, t.arr, t.dur, t.eco, t.bus, t.vip);
      }
    });
    trainTx();
  }

  // 5. Seed Professional Licensed Tour Guides
  const guideCount = db.prepare('SELECT COUNT(*) as count FROM guides').get().count;
  if (guideCount === 0) {
    const insertGuide = db.prepare(`
      INSERT INTO guides (name, languages, city, license_number, daily_rate_usd, phone, bio, image_url, rating, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const initialGuides = [
      {
        name: 'Alisher Rasulov',
        languages: 'Türkçe, English, Русский',
        city: 'All Uzbekistan (Toshkent, Samarqand, Buxoro, Xiva)',
        license: 'UZB-GUIDE-2022-104',
        rate: 55,
        phone: '+998 90 112 33 44',
        bio: 'O\'zbekiston bo\'ylab 12 yillik tajribaga ega oliy toifali gid. Istanbul universiteti sharqshunoslik bitiruvchisi, turk va ingliz tillarida mukammal so\'zlashadi.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        rating: 4.96
      },
      {
        name: 'Zebo Karimova',
        languages: 'Türkçe, English, Italiano',
        city: 'Samarqand & Buxoro',
        license: 'UZB-GUIDE-2023-219',
        rate: 50,
        phone: '+998 93 223 44 55',
        bio: 'Samarqand Davlat Chet tillari instituti dotsenti. Qadimiy Ipak Yo\'li me\'morchiligi va Temuriylar tarixi bo\'yicha xalqaro sertifikat sohibasi.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        rating: 4.98
      },
      {
        name: 'Bekzod Nurmatov',
        languages: 'English, Deutsch, Türkçe',
        city: 'Toshkent & Xiva',
        license: 'UZB-GUIDE-2021-088',
        rate: 50,
        phone: '+998 97 334 55 66',
        bio: 'Xiva Ichan-Qala tarixi bo\'yicha ixtisoslashgan gidi. Nemis va turk sayyohlari bilan ishlashda katta amaliyotga ega.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        rating: 4.93
      },
      {
        name: 'Dilnoza Umarova',
        languages: 'Türkçe, Français, English',
        city: 'Buxoro & Xiva',
        license: 'UZB-GUIDE-2024-331',
        rate: 60,
        phone: '+998 99 445 66 77',
        bio: 'Fransuz va turk tillarida madaniy-tarixiy sayohatlar yetakchisi. Buxoro hunarmandchiligi va suzanilar bo\'yicha ekspert.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        rating: 5.0
      }
    ];

    const guideTx = db.transaction(() => {
      for (const g of initialGuides) {
        insertGuide.run(g.name, g.languages, g.city, g.license, g.rate, g.phone, g.bio, g.image, g.rating);
      }
    });
    guideTx();
  }

  // 6. Seed International Flights (Global Inbound Hubs <-> Uzbekistan)
  const insertFlightStmt = db.prepare(`
    INSERT INTO flight_routes (airline, flight_number, from_city, to_city, departure_time, arrival_time, duration, economy_price_usd, business_price_usd, baggage_allowance, days_of_week, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const internationalFlights = [
    // 1. Turkey: Istanbul (IST) <-> Tashkent (TAS) / Samarkand (SKD) / Bukhara (BHK) / Urgench (UGC)
    { airline: 'Turkish Airlines', num: 'TK 368', from: 'Istanbul (IST)', to: 'Tashkent (TAS)', dep: '00:45', arr: '07:15', dur: '4h 30m', eco: 340, bus: 680, bag: '30 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Turkish Airlines', num: 'TK 369', from: 'Tashkent (TAS)', to: 'Istanbul (IST)', dep: '08:45', arr: '12:05', dur: '5h 20m', eco: 340, bus: 680, bag: '30 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Uzbekistan Airways', num: 'HY 274', from: 'Istanbul (IST)', to: 'Tashkent (TAS)', dep: '13:40', arr: '20:10', dur: '4h 30m', eco: 290, bus: 580, bag: '32 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Uzbekistan Airways', num: 'HY 273', from: 'Tashkent (TAS)', to: 'Istanbul (IST)', dep: '08:50', arr: '12:10', dur: '5h 20m', eco: 290, bus: 580, bag: '32 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Turkish Airlines', num: 'TK 372', from: 'Istanbul (IST)', to: 'Samarkand (SKD)', dep: '21:55', arr: '04:15', dur: '4h 20m', eco: 320, bus: 620, bag: '30 kg bagaj + 8 kg kabina', days: 'Dush, Chor, Juma, Yak' },
    { airline: 'Turkish Airlines', num: 'TK 373', from: 'Samarkand (SKD)', to: 'Istanbul (IST)', dep: '05:45', arr: '08:50', dur: '5h 05m', eco: 320, bus: 620, bag: '30 kg bagaj + 8 kg kabina', days: 'Dush, Chor, Juma, Yak' },
    { airline: 'Uzbekistan Airways', num: 'HY 278', from: 'Istanbul (IST)', to: 'Bukhara (BHK)', dep: '14:20', arr: '20:15', dur: '3h 55m', eco: 295, bus: 560, bag: '32 kg bagaj + 8 kg kabina', days: 'Sesh, Pay, Shan' },
    { airline: 'Uzbekistan Airways', num: 'HY 277', from: 'Bukhara (BHK)', to: 'Istanbul (IST)', dep: '09:30', arr: '12:40', dur: '5h 10m', eco: 295, bus: 560, bag: '32 kg bagaj + 8 kg kabina', days: 'Sesh, Pay, Shan' },
    { airline: 'Uzbekistan Airways', num: 'HY 280', from: 'Istanbul (IST)', to: 'Urgench/Khiva (UGC)', dep: '15:30', arr: '21:20', dur: '3h 50m', eco: 310, bus: 590, bag: '32 kg bagaj + 8 kg kabina', days: 'Dush, Juma' },
    { airline: 'Uzbekistan Airways', num: 'HY 279', from: 'Urgench/Khiva (UGC)', to: 'Istanbul (IST)', dep: '10:00', arr: '13:00', dur: '5h 00m', eco: 310, bus: 590, bag: '32 kg bagaj + 8 kg kabina', days: 'Dush, Juma' },

    // 2. United Kingdom: London (LHR) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways', num: 'HY 202', from: 'London (LHR)', to: 'Tashkent (TAS)', dep: '16:20', arr: '03:10', dur: '6h 50m', eco: 460, bus: 920, bag: '32 kg bagaj + 8 kg kabina', days: 'Ses, Pay, Shan' },
    { airline: 'Uzbekistan Airways', num: 'HY 201', from: 'Tashkent (TAS)', to: 'London (LHR)', dep: '10:45', arr: '14:35', dur: '7h 50m', eco: 460, bus: 920, bag: '32 kg bagaj + 8 kg kabina', days: 'Ses, Pay, Shan' },

    // 3. Germany: Frankfurt (FRA) & Munich (MUC) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways', num: 'HY 232', from: 'Frankfurt (FRA)', to: 'Tashkent (TAS)', dep: '11:45', arr: '21:00', dur: '6h 15m', eco: 420, bus: 840, bag: '32 kg bagaj + 8 kg kabina', days: 'Juma, Yak' },
    { airline: 'Uzbekistan Airways', num: 'HY 231', from: 'Tashkent (TAS)', to: 'Frankfurt (FRA)', dep: '05:55', arr: '09:45', dur: '6h 50m', eco: 420, bus: 840, bag: '32 kg bagaj + 8 kg kabina', days: 'Juma, Yak' },
    { airline: 'Uzbekistan Airways', num: 'HY 236', from: 'Munich (MUC)', to: 'Tashkent (TAS)', dep: '12:30', arr: '21:30', dur: '6h 00m', eco: 410, bus: 820, bag: '32 kg bagaj + 8 kg kabina', days: 'Chorshanba, Shanba' },
    { airline: 'Uzbekistan Airways', num: 'HY 235', from: 'Tashkent (TAS)', to: 'Munich (MUC)', dep: '06:30', arr: '10:30', dur: '6h 00m', eco: 410, bus: 820, bag: '32 kg bagaj + 8 kg kabina', days: 'Chorshanba, Shanba' },

    // 4. France: Paris (CDG) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways', num: 'HY 252', from: 'Paris (CDG)', to: 'Tashkent (TAS)', dep: '11:00', arr: '20:40', dur: '6h 40m', eco: 450, bus: 900, bag: '32 kg bagaj + 8 kg kabina', days: 'Seshanba, Juma' },
    { airline: 'Uzbekistan Airways', num: 'HY 251', from: 'Tashkent (TAS)', to: 'Paris (CDG)', dep: '05:00', arr: '09:15', dur: '7h 15m', eco: 450, bus: 900, bag: '32 kg bagaj + 8 kg kabina', days: 'Seshanba, Juma' },

    // 5. United States: New York (JFK) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways', num: 'HY 102', from: 'New York (JFK)', to: 'Tashkent (TAS)', dep: '12:55', arr: '09:45', dur: '11h 50m', eco: 680, bus: 1350, bag: '2 x 23 kg bagaj + 8 kg kabina', days: 'Payshanba, Yakshanba' },
    { airline: 'Uzbekistan Airways', num: 'HY 101', from: 'Tashkent (TAS)', to: 'New York (JFK)', dep: '06:10', arr: '10:55', dur: '13h 45m', eco: 680, bus: 1350, bag: '2 x 23 kg bagaj + 8 kg kabina', days: 'Payshanba, Yakshanba' },

    // 6. UAE: Dubai (DXB) <-> Tashkent (TAS) & Samarkand (SKD)
    { airline: 'Flydubai / Emirates', num: 'FZ 1941', from: 'Dubai (DXB)', to: 'Tashkent (TAS)', dep: '08:30', arr: '12:55', dur: '3h 25m', eco: 250, bus: 520, bag: '30 kg bagaj + 7 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Flydubai / Emirates', num: 'FZ 1942', from: 'Tashkent (TAS)', to: 'Dubai (DXB)', dep: '14:25', arr: '17:05', dur: '3h 40m', eco: 250, bus: 520, bag: '30 kg bagaj + 7 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Flydubai', num: 'FZ 1943', from: 'Dubai (DXB)', to: 'Samarkand (SKD)', dep: '09:00', arr: '13:15', dur: '3h 15m', eco: 260, bus: 540, bag: '30 kg bagaj + 7 kg kabina', days: 'Dush, Chor, Juma' },
    { airline: 'Flydubai', num: 'FZ 1944', from: 'Samarkand (SKD)', to: 'Dubai (DXB)', dep: '14:45', arr: '17:15', dur: '3h 30m', eco: 260, bus: 540, bag: '30 kg bagaj + 7 kg kabina', days: 'Dush, Chor, Juma' },

    // 7. South Korea: Seoul (ICN) <-> Tashkent (TAS)
    { airline: 'Asiana / UzAirways', num: 'OZ 573', from: 'Seoul (ICN)', to: 'Tashkent (TAS)', dep: '17:50', arr: '21:35', dur: '7h 15m', eco: 490, bus: 980, bag: '30 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Asiana / UzAirways', num: 'OZ 574', from: 'Tashkent (TAS)', to: 'Seoul (ICN)', dep: '23:05', arr: '09:30', dur: '6h 25m', eco: 490, bus: 980, bag: '30 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },

    // 8. Japan: Tokyo (NRT) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways', num: 'HY 528', from: 'Tokyo (NRT)', to: 'Tashkent (TAS)', dep: '11:05', arr: '16:50', dur: '8h 45m', eco: 580, bus: 1160, bag: '32 kg bagaj + 8 kg kabina', days: 'Dushanba, Payshanba' },
    { airline: 'Uzbekistan Airways', num: 'HY 527', from: 'Tashkent (TAS)', to: 'Tokyo (NRT)', dep: '22:05', arr: '09:40', dur: '7h 35m', eco: 580, bus: 1160, bag: '32 kg bagaj + 8 kg kabina', days: 'Dushanba, Payshanba' },

    // 9. Italy: Rome (FCO) & Milan (MXP) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways', num: 'HY 258', from: 'Rome (FCO)', to: 'Tashkent (TAS)', dep: '12:00', arr: '21:30', dur: '6h 30m', eco: 440, bus: 880, bag: '32 kg bagaj + 8 kg kabina', days: 'Yakshanba' },
    { airline: 'Uzbekistan Airways', num: 'HY 257', from: 'Tashkent (TAS)', to: 'Rome (FCO)', dep: '05:40', arr: '09:50', dur: '7h 10m', eco: 440, bus: 880, bag: '32 kg bagaj + 8 kg kabina', days: 'Yakshanba' },
    { airline: 'Uzbekistan Airways', num: 'HY 256', from: 'Milan (MXP)', to: 'Tashkent (TAS)', dep: '13:00', arr: '22:20', dur: '6h 20m', eco: 430, bus: 860, bag: '32 kg bagaj + 8 kg kabina', days: 'Juma' },
    { airline: 'Uzbekistan Airways', num: 'HY 255', from: 'Tashkent (TAS)', to: 'Milan (MXP)', dep: '06:30', arr: '10:50', dur: '7h 20m', eco: 430, bus: 860, bag: '32 kg bagaj + 8 kg kabina', days: 'Juma' },

    // 10. Spain: Madrid (MAD) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways / Partner', num: 'HY 288', from: 'Madrid (MAD)', to: 'Tashkent (TAS)', dep: '10:30', arr: '21:45', dur: '8h 15m', eco: 470, bus: 940, bag: '30 kg bagaj + 8 kg kabina', days: 'Chorshanba, Shanba' },
    { airline: 'Uzbekistan Airways / Partner', num: 'HY 287', from: 'Tashkent (TAS)', to: 'Madrid (MAD)', dep: '04:15', arr: '09:00', dur: '8h 45m', eco: 470, bus: 940, bag: '30 kg bagaj + 8 kg kabina', days: 'Chorshanba, Shanba' },

    // 11. Russia: Moscow (VKO/DME) <-> Tashkent (TAS) & Samarkand (SKD)
    { airline: 'Uzbekistan Airways', num: 'HY 604', from: 'Moscow (VKO)', to: 'Tashkent (TAS)', dep: '11:15', arr: '17:05', dur: '3h 50m', eco: 210, bus: 430, bag: '32 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Uzbekistan Airways', num: 'HY 603', from: 'Tashkent (TAS)', to: 'Moscow (VKO)', dep: '07:05', arr: '09:15', dur: '4h 10m', eco: 210, bus: 430, bag: '32 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Uzbekistan Airways', num: 'HY 606', from: 'Moscow (DME)', to: 'Samarkand (SKD)', dep: '12:00', arr: '18:00', dur: '4h 00m', eco: 220, bus: 450, bag: '32 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Uzbekistan Airways', num: 'HY 605', from: 'Samarkand (SKD)', to: 'Moscow (DME)', dep: '08:00', arr: '10:20', dur: '4h 20m', eco: 220, bus: 450, bag: '32 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },

    // 12. India: Delhi (DEL) <-> Tashkent (TAS)
    { airline: 'Uzbekistan Airways / IndiGo', num: 'HY 422', from: 'Delhi (DEL)', to: 'Tashkent (TAS)', dep: '08:50', arr: '11:00', dur: '3h 10m', eco: 195, bus: 390, bag: '30 kg bagaj + 7 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Uzbekistan Airways / IndiGo', num: 'HY 421', from: 'Tashkent (TAS)', to: 'Delhi (DEL)', dep: '03:15', arr: '06:45', dur: '3h 00m', eco: 195, bus: 390, bag: '30 kg bagaj + 7 kg kabina', days: 'Har kuni (Daily)' },

    // 13. China: Beijing (PEK) <-> Tashkent (TAS)
    { airline: 'Air China / UzAirways', num: 'CA 783', from: 'Beijing (PEK)', to: 'Tashkent (TAS)', dep: '18:10', arr: '21:40', dur: '6h 00m', eco: 380, bus: 760, bag: '30 kg bagaj + 8 kg kabina', days: 'Ses, Juma, Yak' },
    { airline: 'Air China / UzAirways', num: 'CA 784', from: 'Tashkent (TAS)', to: 'Beijing (PEK)', dep: '23:10', arr: '07:40', dur: '5h 30m', eco: 380, bus: 760, bag: '30 kg bagaj + 8 kg kabina', days: 'Ses, Juma, Yak' },

    // 14. Kazakhstan: Almaty (ALA) <-> Tashkent (TAS)
    { airline: 'Air Astana', num: 'KC 127', from: 'Almaty (ALA)', to: 'Tashkent (TAS)', dep: '11:45', arr: '12:20', dur: '1h 35m', eco: 110, bus: 220, bag: '23 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' },
    { airline: 'Air Astana', num: 'KC 128', from: 'Tashkent (TAS)', to: 'Almaty (ALA)', dep: '13:20', arr: '15:55', dur: '1h 35m', eco: 110, bus: 220, bag: '23 kg bagaj + 8 kg kabina', days: 'Har kuni (Daily)' }
  ];

  // Seed missing routes
  const checkFlightStmt = db.prepare('SELECT id FROM flight_routes WHERE flight_number = ? AND from_city = ?');
  const flightTx = db.transaction(() => {
    for (const f of internationalFlights) {
      const existing = checkFlightStmt.get(f.num, f.from);
      if (!existing) {
        insertFlightStmt.run(f.airline, f.num, f.from, f.to, f.dep, f.arr, f.dur, f.eco, f.bus, f.bag, f.days);
      }
    }
  });
  flightTx();

  // 7. Seed Cultural Experiences & Masterclasses
  const expCount = db.prepare('SELECT COUNT(*) as count FROM cultural_experiences').get().count;
  if (expCount === 0) {
    const insertExp = db.prepare(`
      INSERT INTO cultural_experiences (title, city, category, price_usd, duration, description, icon, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const initialExps = [
      {
        title: 'Samarqand Osh (Palov) Pishirish Mahorat Darsi',
        city: 'Samarkand',
        category: 'culinary',
        price: 25,
        duration: '2h 30m',
        description: 'Bosh oshpaz ustozligida an\'anaviy cho\'yan qozonda haqiqiy Samarqandcha palov tayyorlash sirlarini o\'rganish va tantanali tatib ko\'rish.',
        icon: 'fa-utensils'
      },
      {
        title: 'Buxoro Ipak Suzani va Zardo\'zlik San\'ati Darsi',
        city: 'Bukhara',
        category: 'craft',
        price: 20,
        duration: '2h',
        description: 'Buxoroning asriy hunarmand oilasida sof ipak iplar bilan milliy naqshlar va zardo\'zlik tikish amaliyoti.',
        icon: 'fa-palette'
      },
      {
        title: 'Rishton Kulolchilik San\'ati va Loydan Buyum Yasash',
        city: 'Tashkent / Fergana',
        category: 'craft',
        price: 20,
        duration: '1h 30m',
        description: 'Kulolchilik charxida o\'z qo\'lingiz bilan idish yasash va o\'simlik bo\'yoqlari bilan bezash.',
        icon: 'fa-shapes'
      },
      {
        title: 'Xiva Qal\'asi Devorlarida Tuyada Quyosh Botishi Sayri',
        city: 'Khiva',
        category: 'adventure',
        price: 15,
        duration: '1h',
        description: 'Ichan-Qalaning 10 metrlik qadimiy loy qal\'a devorlari bo\'ylab tuyada unutilmas oqshom sayri.',
        icon: 'fa-sun'
      },
      {
        title: 'Cheksiz Internetli 5G Sayyohlik eSIM Kartasi',
        city: 'All Uzbekistan',
        category: 'connectivity',
        price: 12,
        duration: '30 kun',
        description: 'O\'zbekiston bo\'ylab tezyurar 5G mobil internet, mamlakatga kelishdan oldin telefoningizga QR-kod orqali faollashtiriladi.',
        icon: 'fa-wifi'
      }
    ];

    const expTx = db.transaction(() => {
      for (const e of initialExps) {
        insertExp.run(e.title, e.city, e.category, e.price, e.duration, e.description, e.icon);
      }
    });
    expTx();
  }
}

// Initialize tables and seed data immediately
initDb();

module.exports = {
  db,
  // Helper Queries
  getAgencySettings: () => db.prepare('SELECT * FROM agency_settings WHERE id = 1').get(),
  updateAgencySettings: (data) => {
    return db.prepare(`
      UPDATE agency_settings
      SET name = @name, phone = @phone, whatsapp = @whatsapp, telegram = @telegram,
          email = @email, address = @address, license_no = @license_no,
          about_text = @about_text, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(data);
  },

  // Hotels
  getAllHotels: (onlyActive = true) => {
    const sql = onlyActive
      ? 'SELECT * FROM hotels WHERE contract_active = 1 ORDER BY city, stars DESC'
      : 'SELECT * FROM hotels ORDER BY city, stars DESC';
    const hotels = db.prepare(sql).all();
    const getRooms = db.prepare('SELECT * FROM hotel_rooms WHERE hotel_id = ? AND is_available = 1');
    return hotels.map(h => ({
      ...h,
      rooms: getRooms.all(h.id)
    }));
  },

  getHotelsByCity: (city) => {
    const hotels = db.prepare('SELECT * FROM hotels WHERE LOWER(city) = LOWER(?) AND contract_active = 1 ORDER BY stars DESC').all(city);
    const getRooms = db.prepare('SELECT * FROM hotel_rooms WHERE hotel_id = ? AND is_available = 1');
    return hotels.map(h => ({
      ...h,
      rooms: getRooms.all(h.id)
    }));
  },

  addHotel: (hotel) => {
    const stmt = db.prepare(`
      INSERT INTO hotels (name, city, stars, address, phone, email, description, image_url, contract_active)
      VALUES (@name, @city, @stars, @address, @phone, @email, @description, @image_url, 1)
    `);
    const res = stmt.run(hotel);
    return res.lastInsertRowid;
  },

  updateHotel: (id, hotel) => {
    const stmt = db.prepare(`
      UPDATE hotels
      SET name = @name, city = @city, stars = @stars, address = @address,
          phone = @phone, email = @email, description = @description,
          image_url = @image_url, contract_active = @contract_active
      WHERE id = @id
    `);
    return stmt.run({ ...hotel, id });
  },

  deleteHotel: (id) => {
    return db.prepare('DELETE FROM hotels WHERE id = ?').run(id);
  },

  // Hotel Rooms
  addRoom: (room) => {
    return db.prepare(`
      INSERT INTO hotel_rooms (hotel_id, room_name, capacity, price_per_night_usd, description, is_available)
      VALUES (@hotel_id, @room_name, @capacity, @price_per_night_usd, @description, 1)
    `).run(room);
  },

  updateRoom: (id, room) => {
    return db.prepare(`
      UPDATE hotel_rooms
      SET room_name = @room_name, capacity = @capacity, price_per_night_usd = @price_per_night_usd,
          description = @description, is_available = @is_available
      WHERE id = @id
    `).run({ ...room, id });
  },

  deleteRoom: (id) => {
    return db.prepare('DELETE FROM hotel_rooms WHERE id = ?').run(id);
  },

  // Trains
  getAllTrains: (onlyActive = true) => {
    const sql = onlyActive ? 'SELECT * FROM train_routes WHERE is_active = 1 ORDER BY from_city, departure_time' : 'SELECT * FROM train_routes ORDER BY from_city, departure_time';
    return db.prepare(sql).all();
  },

  getTrainsBetween: (fromCity, toCity) => {
    return db.prepare(`
      SELECT * FROM train_routes
      WHERE LOWER(from_city) = LOWER(?) AND LOWER(to_city) = LOWER(?) AND is_active = 1
      ORDER BY departure_time
    `).all(fromCity, toCity);
  },

  addTrain: (train) => {
    return db.prepare(`
      INSERT INTO train_routes (train_name, train_number, train_type, from_city, to_city, departure_time, arrival_time, duration, economy_price_usd, business_price_usd, vip_price_usd, is_active)
      VALUES (@train_name, @train_number, @train_type, @from_city, @to_city, @departure_time, @arrival_time, @duration, @economy_price_usd, @business_price_usd, @vip_price_usd, 1)
    `).run(train);
  },

  updateTrain: (id, train) => {
    return db.prepare(`
      UPDATE train_routes
      SET train_name = @train_name, train_number = @train_number, train_type = @train_type,
          from_city = @from_city, to_city = @to_city, departure_time = @departure_time,
          arrival_time = @arrival_time, duration = @duration, economy_price_usd = @economy_price_usd,
          business_price_usd = @business_price_usd, vip_price_usd = @vip_price_usd, is_active = @is_active
      WHERE id = @id
    `).run({ ...train, id });
  },

  deleteTrain: (id) => {
    return db.prepare('DELETE FROM train_routes WHERE id = ?').run(id);
  },

  // Tour Proposals
  saveTourProposal: (proposal) => {
    return db.prepare(`
      INSERT INTO tour_proposals (tour_code, package_title, customer_origin, cities, budget_usd, duration_days, total_estimated_usd, itinerary_json)
      VALUES (@tour_code, @package_title, @customer_origin, @cities, @budget_usd, @duration_days, @total_estimated_usd, @itinerary_json)
    `).run(proposal);
  },

  getTourProposalByCode: (code) => {
    return db.prepare('SELECT * FROM tour_proposals WHERE tour_code = ?').get(code);
  },

  // Inquiries / Leads (Bookings)
  createInquiry: (inquiry) => {
    return db.prepare(`
      INSERT INTO tour_inquiries (
        tour_code, customer_name, customer_country, customer_email, customer_phone,
        customer_whatsapp, start_date, number_of_travelers, special_requests,
        selected_package_title, total_price_usd, full_itinerary_json, status
      )
      VALUES (
        @tour_code, @customer_name, @customer_country, @customer_email, @customer_phone,
        @customer_whatsapp, @start_date, @number_of_travelers, @special_requests,
        @selected_package_title, @total_price_usd, @full_itinerary_json, 'new'
      )
    `).run(inquiry);
  },

  getAllInquiries: () => {
    return db.prepare('SELECT * FROM tour_inquiries ORDER BY created_at DESC').all();
  },

  getInquiryById: (id) => {
    return db.prepare('SELECT * FROM tour_inquiries WHERE id = ?').get(id);
  },

  updateInquiryStatus: (id, status, notes) => {
    return db.prepare(`
      UPDATE tour_inquiries
      SET status = ?, admin_notes = COALESCE(?, admin_notes)
      WHERE id = ?
    `).run(status, notes, id);
  },

  // Admin Auth
  getAdminByUsername: (username) => {
    return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  },

  updateAdminPassword: (username, newHash) => {
    return db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(newHash, username);
  },

  // Guides Management
  getAllGuides: (onlyActive = true) => {
    const sql = onlyActive ? 'SELECT * FROM guides WHERE is_active = 1 ORDER BY rating DESC' : 'SELECT * FROM guides ORDER BY rating DESC';
    return db.prepare(sql).all();
  },
  getGuideById: (id) => db.prepare('SELECT * FROM guides WHERE id = ?').get(id),
  addGuide: (guide) => {
    return db.prepare(`
      INSERT INTO guides (name, languages, city, license_number, daily_rate_usd, phone, bio, image_url, rating, is_active)
      VALUES (@name, @languages, @city, @license_number, @daily_rate_usd, @phone, @bio, @image_url, @rating, 1)
    `).run(guide);
  },
  updateGuide: (id, guide) => {
    return db.prepare(`
      UPDATE guides
      SET name = @name, languages = @languages, city = @city, license_number = @license_number,
          daily_rate_usd = @daily_rate_usd, phone = @phone, bio = @bio, image_url = @image_url,
          rating = @rating, is_active = @is_active
      WHERE id = @id
    `).run({ ...guide, id });
  },
  deleteGuide: (id) => db.prepare('DELETE FROM guides WHERE id = ?').run(id),

  // Flights Management
  getAllFlights: (onlyActive = true) => {
    const sql = onlyActive ? 'SELECT * FROM flight_routes WHERE is_active = 1 ORDER BY from_city, departure_time' : 'SELECT * FROM flight_routes ORDER BY from_city, departure_time';
    return db.prepare(sql).all();
  },
  getFlightsBetween: (fromCity, toCity) => {
    return db.prepare(`
      SELECT * FROM flight_routes
      WHERE LOWER(from_city) LIKE LOWER(?) AND LOWER(to_city) LIKE LOWER(?) AND is_active = 1
      ORDER BY departure_time
    `).all(`%${fromCity}%`, `%${toCity}%`);
  },
  addFlight: (flight) => {
    return db.prepare(`
      INSERT INTO flight_routes (airline, flight_number, from_city, to_city, departure_time, arrival_time, duration, economy_price_usd, business_price_usd, baggage_allowance, days_of_week, is_active)
      VALUES (@airline, @flight_number, @from_city, @to_city, @departure_time, @arrival_time, @duration, @economy_price_usd, @business_price_usd, @baggage_allowance, @days_of_week, 1)
    `).run(flight);
  },
  updateFlight: (id, flight) => {
    return db.prepare(`
      UPDATE flight_routes
      SET airline = @airline, flight_number = @flight_number, from_city = @from_city, to_city = @to_city,
          departure_time = @departure_time, arrival_time = @arrival_time, duration = @duration,
          economy_price_usd = @economy_price_usd, business_price_usd = @business_price_usd,
          baggage_allowance = @baggage_allowance, days_of_week = @days_of_week, is_active = @is_active
      WHERE id = @id
    `).run({ ...flight, id });
  },
  deleteFlight: (id) => db.prepare('DELETE FROM flight_routes WHERE id = ?').run(id),

  // Cultural Experiences & Masterclasses
  getAllExperiences: (onlyActive = true) => {
    const sql = onlyActive ? 'SELECT * FROM cultural_experiences WHERE is_active = 1 ORDER BY price_usd ASC' : 'SELECT * FROM cultural_experiences ORDER BY price_usd ASC';
    return db.prepare(sql).all();
  },
  addExperience: (exp) => {
    return db.prepare(`
      INSERT INTO cultural_experiences (title, city, category, price_usd, duration, description, icon, is_active)
      VALUES (@title, @city, @category, @price_usd, @duration, @description, @icon, 1)
    `).run(exp);
  },
  deleteExperience: (id) => db.prepare('DELETE FROM cultural_experiences WHERE id = ?').run(id),

  // Stats for Admin Dashboard
  getDashboardStats: () => {
    const totalInquiries = db.prepare('SELECT COUNT(*) as count FROM tour_inquiries').get().count;
    const newInquiries = db.prepare("SELECT COUNT(*) as count FROM tour_inquiries WHERE status = 'new'").get().count;
    const confirmedInquiries = db.prepare("SELECT COUNT(*) as count FROM tour_inquiries WHERE status = 'confirmed'").get().count;
    const totalHotels = db.prepare('SELECT COUNT(*) as count FROM hotels WHERE contract_active = 1').get().count;
    const totalRooms = db.prepare('SELECT COUNT(*) as count FROM hotel_rooms WHERE is_available = 1').get().count;
    const totalTrains = db.prepare('SELECT COUNT(*) as count FROM train_routes WHERE is_active = 1').get().count;
    const totalGuides = db.prepare('SELECT COUNT(*) as count FROM guides WHERE is_active = 1').get().count;
    const totalFlights = db.prepare('SELECT COUNT(*) as count FROM flight_routes WHERE is_active = 1').get().count;
    const totalProposals = db.prepare('SELECT COUNT(*) as count FROM tour_proposals').get().count;

    return {
      totalInquiries,
      newInquiries,
      confirmedInquiries,
      totalHotels,
      totalRooms,
      totalTrains,
      totalGuides,
      totalFlights,
      totalProposals
    };
  }
};
