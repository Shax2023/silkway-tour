require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./db');
const aiAgent = require('./ai_agent');
const { requireAdminAuth, generateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// PUBLIC TOURIST & AI CONCIERGE API
// ==========================================

// 1. Get Agency Public Profile
app.get('/api/agency', (req, res) => {
  try {
    const agency = db.getAgencySettings();
    res.json({ success: true, agency });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Chat with AI Agent
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, lang } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Xabar kiritilmadi (Message is required)' });
    }

    const aiResponse = await aiAgent.processUserMessage(message, history || [], lang || 'en');
    res.json({
      success: true,
      reply: aiResponse.reply,
      parameters: aiResponse.parameters || null,
      packages: aiResponse.packages || []
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Generate Structured Tour Proposals directly (from wizard / parameters)
app.post('/api/generate-tour', (req, res) => {
  try {
    const { origin, cities, budget, duration, startDate, includeFlight, includeGuide, guideLang, lang } = req.body;
    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({ success: false, error: 'Kamida bitta shahar tanlanishi kerak (At least one city required)' });
    }

    const customerOrigin = origin && origin.trim() ? origin.trim() : 'International Guest';
    const parsedBudget = budget ? parseFloat(budget) : 1800;
    const parsedDuration = duration ? parseInt(duration, 10) : 7;

    const packages = aiAgent.buildTourPackages(customerOrigin, cities, parsedBudget, parsedDuration, startDate, {
      includeFlight: includeFlight !== undefined ? includeFlight : true,
      includeGuide: includeGuide !== undefined ? includeGuide : true,
      guideLang: guideLang || 'English',
      lang: lang || 'en'
    });

    res.json({
      success: true,
      packages: packages
    });
  } catch (err) {
    console.error('Tour generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Retrieve saved proposal by code
app.get('/api/proposals/:code', (req, res) => {
  try {
    const proposal = db.getTourProposalByCode(req.params.code);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Taklif topilmadi (Proposal not found)' });
    }
    res.json({
      success: true,
      proposal: {
        ...proposal,
        itinerary: JSON.parse(proposal.itinerary_json)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Submit Booking Inquiry ("Adminga murojaat qilish")
app.post('/api/inquiries', (req, res) => {
  try {
    const {
      tour_code,
      customer_name,
      customer_country,
      customer_email,
      customer_phone,
      customer_whatsapp,
      start_date,
      number_of_travelers,
      special_requests,
      selected_package_title,
      total_price_usd,
      itinerary
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone) {
      return res.status(400).json({
        success: false,
        error: 'Iltimos, ismingiz, telefon raqamingiz va emailingizni kiriting (Name, email, and phone required)'
      });
    }

    const inquiryData = {
      tour_code: tour_code || 'DIRECT-REQ',
      customer_name: customer_name.trim(),
      customer_country: (customer_country || 'Not specified').trim(),
      customer_email: customer_email.trim(),
      customer_phone: customer_phone.trim(),
      customer_whatsapp: (customer_whatsapp || customer_phone).trim(),
      start_date: start_date || new Date().toISOString().split('T')[0],
      number_of_travelers: parseInt(number_of_travelers || 1, 10),
      special_requests: (special_requests || '').trim(),
      selected_package_title: selected_package_title || 'Custom Tour',
      total_price_usd: parseFloat(total_price_usd || 0),
      full_itinerary_json: typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary || {})
    };

    const result = db.createInquiry(inquiryData);

    res.json({
      success: true,
      inquiry_id: result.lastInsertRowid,
      tour_code: inquiryData.tour_code,
      message: 'Murojaatingiz qabul qilindi! Mas\'ul xodimimiz tez orada siz bilan bog\'lanadi (Your inquiry has been received! Our tour operator will contact you shortly).'
    });
  } catch (err) {
    console.error('Inquiry error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Public list of contracted partner hotels
app.get('/api/public/hotels', (req, res) => {
  try {
    const hotels = db.getAllHotels(true);
    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Public list of train routes
app.get('/api/public/trains', (req, res) => {
  try {
    const trains = db.getAllTrains(true);
    res.json({ success: true, trains });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Public list of licensed tour guides
app.get('/api/public/guides', (req, res) => {
  try {
    const guides = db.getAllGuides ? db.getAllGuides(true) : [];
    res.json({ success: true, guides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Public list of international flights (Turkey <-> Uzbekistan)
app.get('/api/public/flights', (req, res) => {
  try {
    const flights = db.getAllFlights ? db.getAllFlights(true) : [];
    res.json({ success: true, flights });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Public list of cultural experiences & masterclasses
app.get('/api/public/experiences', (req, res) => {
  try {
    const experiences = db.getAllExperiences ? db.getAllExperiences(true) : [];
    res.json({ success: true, experiences });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ADMIN AUTHENTICATION API
// ==========================================

app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Login va parolni kiriting (Username & password required)' });
    }

    const admin = db.getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Noto\'g\'ri login yoki parol (Invalid credentials)' });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Noto\'g\'ri login yoki parol (Invalid credentials)' });
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      full_name: admin.full_name
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ==========================================
// PROTECTED ADMIN MANAGEMENT API
// ==========================================

// Dashboard Stats
app.get('/api/admin/dashboard', requireAdminAuth, (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lead / Inquiries Management
app.get('/api/admin/inquiries', requireAdminAuth, (req, res) => {
  try {
    const inquiries = db.getAllInquiries();
    res.json({ success: true, inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/inquiries/:id', requireAdminAuth, (req, res) => {
  try {
    const inquiry = db.getInquiryById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, error: 'Murojaat topilmadi' });
    let itineraryObj = null;
    try {
      itineraryObj = JSON.parse(inquiry.full_itinerary_json);
    } catch (e) {
      itineraryObj = inquiry.full_itinerary_json;
    }
    res.json({ success: true, inquiry: { ...inquiry, itinerary: itineraryObj } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/inquiries/:id/status', requireAdminAuth, (req, res) => {
  try {
    const { status, notes } = req.body;
    db.updateInquiryStatus(req.params.id, status, notes);
    res.json({ success: true, message: 'Status yangilandi (Status updated)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Hotels Management
app.get('/api/admin/hotels', requireAdminAuth, (req, res) => {
  try {
    const hotels = db.getAllHotels(false); // including inactive
    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/hotels', requireAdminAuth, (req, res) => {
  try {
    const { name, city, stars, address, phone, email, description, image_url, rooms } = req.body;
    if (!name || !city) {
      return res.status(400).json({ success: false, error: 'Mehmonxona nomi va shahri talab qilinadi' });
    }

    const hotelId = db.addHotel({
      name,
      city,
      stars: parseInt(stars || 4, 10),
      address: address || '',
      phone: phone || '',
      email: email || '',
      description: description || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    });

    if (rooms && Array.isArray(rooms)) {
      for (const r of rooms) {
        if (r.room_name && r.price_per_night_usd) {
          db.addRoom({
            hotel_id: hotelId,
            room_name: r.room_name,
            capacity: parseInt(r.capacity || 2, 10),
            price_per_night_usd: parseFloat(r.price_per_night_usd),
            description: r.description || ''
          });
        }
      }
    }

    res.json({ success: true, hotel_id: hotelId, message: 'Mehmonxona qo\'shildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/hotels/:id', requireAdminAuth, (req, res) => {
  try {
    const { name, city, stars, address, phone, email, description, image_url, contract_active } = req.body;
    db.updateHotel(req.params.id, {
      name,
      city,
      stars: parseInt(stars || 4, 10),
      address: address || '',
      phone: phone || '',
      email: email || '',
      description: description || '',
      image_url: image_url || '',
      contract_active: contract_active === undefined ? 1 : (contract_active ? 1 : 0)
    });
    res.json({ success: true, message: 'Mehmonxona ma\'lumotlari yangilandi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/hotels/:id', requireAdminAuth, (req, res) => {
  try {
    db.deleteHotel(req.params.id);
    res.json({ success: true, message: 'Mehmonxona o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Hotel Rooms Management
app.post('/api/admin/hotels/:id/rooms', requireAdminAuth, (req, res) => {
  try {
    const { room_name, capacity, price_per_night_usd, description } = req.body;
    if (!room_name || !price_per_night_usd) {
      return res.status(400).json({ success: false, error: 'Xona nomi va narxi talab qilinadi' });
    }
    db.addRoom({
      hotel_id: req.params.id,
      room_name,
      capacity: parseInt(capacity || 2, 10),
      price_per_night_usd: parseFloat(price_per_night_usd),
      description: description || ''
    });
    res.json({ success: true, message: 'Xona turi qo\'shildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/rooms/:id', requireAdminAuth, (req, res) => {
  try {
    const { room_name, capacity, price_per_night_usd, description, is_available } = req.body;
    db.updateRoom(req.params.id, {
      room_name,
      capacity: parseInt(capacity || 2, 10),
      price_per_night_usd: parseFloat(price_per_night_usd),
      description: description || '',
      is_available: is_available === undefined ? 1 : (is_available ? 1 : 0)
    });
    res.json({ success: true, message: 'Xona ma\'lumotlari yangilandi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/rooms/:id', requireAdminAuth, (req, res) => {
  try {
    db.deleteRoom(req.params.id);
    res.json({ success: true, message: 'Xona o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trains Management
app.get('/api/admin/trains', requireAdminAuth, (req, res) => {
  try {
    const trains = db.getAllTrains(false);
    res.json({ success: true, trains });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/trains', requireAdminAuth, (req, res) => {
  try {
    const { train_name, train_number, train_type, from_city, to_city, departure_time, arrival_time, duration, economy_price_usd, business_price_usd, vip_price_usd } = req.body;
    if (!train_name || !from_city || !to_city || !departure_time) {
      return res.status(400).json({ success: false, error: 'Asosiy poyezd ma\'lumotlari kiritilmadi' });
    }

    db.addTrain({
      train_name,
      train_number: train_number || '',
      train_type: train_type || 'Express Train',
      from_city,
      to_city,
      departure_time,
      arrival_time: arrival_time || '',
      duration: duration || '',
      economy_price_usd: parseFloat(economy_price_usd || 15),
      business_price_usd: parseFloat(business_price_usd || 25),
      vip_price_usd: parseFloat(vip_price_usd || 40)
    });

    res.json({ success: true, message: 'Poyezd yo\'nalishi muvaffaqiyatli qo\'shildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/trains/:id', requireAdminAuth, (req, res) => {
  try {
    const { train_name, train_number, train_type, from_city, to_city, departure_time, arrival_time, duration, economy_price_usd, business_price_usd, vip_price_usd, is_active } = req.body;
    db.updateTrain(req.params.id, {
      train_name,
      train_number: train_number || '',
      train_type: train_type || 'Express Train',
      from_city,
      to_city,
      departure_time,
      arrival_time: arrival_time || '',
      duration: duration || '',
      economy_price_usd: parseFloat(economy_price_usd || 15),
      business_price_usd: parseFloat(business_price_usd || 25),
      vip_price_usd: parseFloat(vip_price_usd || 40),
      is_active: is_active === undefined ? 1 : (is_active ? 1 : 0)
    });
    res.json({ success: true, message: 'Poyezd yo\'nalishi yangilandi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/trains/:id', requireAdminAuth, (req, res) => {
  try {
    db.deleteTrain(req.params.id);
    res.json({ success: true, message: 'Poyezd o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Agency Settings
app.put('/api/admin/agency', requireAdminAuth, (req, res) => {
  try {
    const { name, phone, whatsapp, telegram, email, address, license_no, about_text } = req.body;
    db.updateAgencySettings({
      name,
      phone,
      whatsapp,
      telegram,
      email,
      address,
      license_no,
      about_text
    });
    res.json({ success: true, message: 'Agentlik ma\'lumotlari yangilandi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Guides Management
app.get('/api/admin/guides', requireAdminAuth, (req, res) => {
  try {
    const guides = db.getAllGuides(false);
    res.json({ success: true, guides });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/guides', requireAdminAuth, (req, res) => {
  try {
    const { name, languages, city, license_number, daily_rate_usd, phone, bio, image_url, rating } = req.body;
    if (!name || !languages) {
      return res.status(400).json({ success: false, error: 'Gid ismi va tillari talab qilinadi' });
    }
    db.addGuide({
      name,
      languages,
      city: city || 'All Uzbekistan',
      license_number: license_number || '',
      daily_rate_usd: parseFloat(daily_rate_usd || 50),
      phone: phone || '',
      bio: bio || '',
      image_url: image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      rating: parseFloat(rating || 4.9)
    });
    res.json({ success: true, message: 'Gid muvaffaqiyatli qo\'shildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/guides/:id', requireAdminAuth, (req, res) => {
  try {
    const { name, languages, city, license_number, daily_rate_usd, phone, bio, image_url, rating, is_active } = req.body;
    db.updateGuide(req.params.id, {
      name,
      languages,
      city: city || 'All Uzbekistan',
      license_number: license_number || '',
      daily_rate_usd: parseFloat(daily_rate_usd || 50),
      phone: phone || '',
      bio: bio || '',
      image_url: image_url || '',
      rating: parseFloat(rating || 4.9),
      is_active: is_active === undefined ? 1 : (is_active ? 1 : 0)
    });
    res.json({ success: true, message: 'Gid ma\'lumotlari yangilandi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/guides/:id', requireAdminAuth, (req, res) => {
  try {
    db.deleteGuide(req.params.id);
    res.json({ success: true, message: 'Gid o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Flights Management
app.get('/api/admin/flights', requireAdminAuth, (req, res) => {
  try {
    const flights = db.getAllFlights(false);
    res.json({ success: true, flights });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/flights', requireAdminAuth, (req, res) => {
  try {
    const { airline, flight_number, from_city, to_city, departure_time, arrival_time, duration, economy_price_usd, business_price_usd, baggage_allowance, days_of_week } = req.body;
    if (!airline || !flight_number || !from_city || !to_city) {
      return res.status(400).json({ success: false, error: 'Aviakompaniya, reys raqami va yo\'nalish talab qilinadi' });
    }
    db.addFlight({
      airline,
      flight_number,
      from_city,
      to_city,
      departure_time: departure_time || '00:00',
      arrival_time: arrival_time || '00:00',
      duration: duration || '4h',
      economy_price_usd: parseFloat(economy_price_usd || 300),
      business_price_usd: parseFloat(business_price_usd || 600),
      baggage_allowance: baggage_allowance || '30 kg bagaj + 8 kg kabina',
      days_of_week: days_of_week || 'Har kuni'
    });
    res.json({ success: true, message: 'Aviaparvoz muvaffaqiyatli qo\'shildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/flights/:id', requireAdminAuth, (req, res) => {
  try {
    db.deleteFlight(req.params.id);
    res.json({ success: true, message: 'Aviaparvoz o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cultural Experiences
app.get('/api/admin/experiences', requireAdminAuth, (req, res) => {
  try {
    const experiences = db.getAllExperiences(false);
    res.json({ success: true, experiences });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/experiences', requireAdminAuth, (req, res) => {
  try {
    const { title, city, category, price_usd, duration, description, icon } = req.body;
    db.addExperience({
      title,
      city: city || 'All Uzbekistan',
      category: category || 'masterclass',
      price_usd: parseFloat(price_usd || 20),
      duration: duration || '2h',
      description: description || '',
      icon: icon || 'fa-utensils'
    });
    res.json({ success: true, message: 'Mahorat darsi qo\'shildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/experiences/:id', requireAdminAuth, (req, res) => {
  try {
    db.deleteExperience(req.params.id);
    res.json({ success: true, message: 'Mahorat darsi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct admin panel navigation helper
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Silk Road — by M.S | AI Tour Operator Platform is LIVE`);
  console.log(` Customer Portal: http://localhost:${PORT}`);
  console.log(` Admin Portal:    http://localhost:${PORT}/admin`);
  console.log(` Status:          Xavfsiz avtorizatsiya himoyasi faol`);
  console.log(`====================================================`);
});
