// Admin Portal Application Logic
let adminToken = localStorage.getItem('silkway_admin_token') || null;
let currentAdmin = null;
let currentInquiries = [];
let selectedInquiry = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
});

// Check if authenticated
async function checkAdminAuth() {
  if (!adminToken) {
    showLoginView();
    return;
  }

  try {
    const res = await fetch('/api/admin/me', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.admin) {
      currentAdmin = data.admin;
      showDashboardView();
      loadDashboardStats();
      loadInquiries();
    } else {
      logoutAdmin();
    }
  } catch (err) {
    logoutAdmin();
  }
}

function showLoginView() {
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('dashboardView').classList.add('hidden');
}

function showDashboardView() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('dashboardView').classList.remove('hidden');
  if (currentAdmin) {
    document.getElementById('currentAdminName').innerText = currentAdmin.full_name || currentAdmin.username;
  }
}

// Handle Admin Login
async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const errBox = document.getElementById('loginError');
  errBox.classList.add('hidden');

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Tekshirilmoqda...`;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success && data.token) {
      adminToken = data.token;
      currentAdmin = data.admin;
      localStorage.setItem('silkway_admin_token', adminToken);
      showDashboardView();
      loadDashboardStats();
      loadInquiries();
    } else {
      errBox.classList.remove('hidden');
      document.getElementById('loginErrorText').innerText = data.error || 'Login yoki parol noto\'g\'ri';
    }
  } catch (err) {
    errBox.classList.remove('hidden');
    document.getElementById('loginErrorText').innerText = 'Server bilan aloqa uzildi';
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-right-to-bracket mr-1"></i> Tizimga Kirish`;
  }
}

function logoutAdmin() {
  adminToken = null;
  currentAdmin = null;
  localStorage.removeItem('silkway_admin_token');
  showLoginView();
}

// Switch Admin Tabs
function switchAdminTab(tab) {
  const tabs = ['inquiries', 'hotels', 'trains', 'guides', 'flights', 'agency'];
  tabs.forEach(t => {
    const btn = document.getElementById(`nav${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const view = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}View`);
    if (btn && view) {
      if (t === tab) {
        btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all bg-blue-600 text-white shadow-sm';
        view.classList.remove('hidden');
      } else {
        btn.className = 'px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all text-slate-600 hover:text-slate-900';
        view.classList.add('hidden');
      }
    }
  });

  if (tab === 'inquiries') loadInquiries();
  if (tab === 'hotels') loadHotels();
  if (tab === 'trains') loadTrains();
  if (tab === 'guides') loadGuides();
  if (tab === 'flights') loadFlights();
  if (tab === 'agency') loadAgencySettings();
}

// Load Dashboard Statistics
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('statTotalInquiries').innerText = s.totalInquiries;
      document.getElementById('statNewInquiries').innerText = s.newInquiries;
      document.getElementById('statConfirmedInquiries').innerText = s.confirmedInquiries;
      document.getElementById('statTotalProposals').innerText = s.totalProposals;

      document.getElementById('badgeNewInquiries').innerText = s.newInquiries;
      document.getElementById('badgeHotelsCount').innerText = s.totalHotels;
      document.getElementById('badgeTrainsCount').innerText = s.totalTrains;
      if (document.getElementById('badgeGuidesCount')) document.getElementById('badgeGuidesCount').innerText = s.totalGuides || 0;
      if (document.getElementById('badgeFlightsCount')) document.getElementById('badgeFlightsCount').innerText = s.totalFlights || 0;
    }
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// ==========================================
// 1. INQUIRIES MANAGEMENT
// ==========================================
async function loadInquiries() {
  const tbody = document.getElementById('inquiriesTableBody');
  tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Yuklanmoqda...</td></tr>`;

  try {
    const res = await fetch('/api/admin/inquiries', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.inquiries) {
      currentInquiries = data.inquiries;
      renderInquiriesTable(data.inquiries);
      loadDashboardStats();
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-red-500">Murojaatlarni yuklashda xatolik yuz berdi</td></tr>`;
  }
}

function renderInquiriesTable(inquiries) {
  const tbody = document.getElementById('inquiriesTableBody');
  if (inquiries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-inbox text-3xl mb-2 block"></i>
          Hozircha sayyohlardan murojaat kelib tushmagan.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = inquiries.map(inq => {
    let statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Yangi</span>';
    if (inq.status === 'contacted') statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Bog\'lanildi</span>';
    if (inq.status === 'in_progress') statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Muzokarada</span>';
    if (inq.status === 'confirmed') statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">Tasdiqlandi</span>';
    if (inq.status === 'cancelled') statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Bekor qilindi</span>';

    const cleanPhone = (inq.customer_phone || '').replace(/[^0-9]/g, '');
    const dateFormatted = new Date(inq.created_at).toLocaleString();

    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-blue-600">${inq.tour_code}</td>
        <td class="py-3 px-4 font-bold text-slate-900">${inq.customer_name}</td>
        <td class="py-3 px-4 text-slate-600">${inq.customer_country || 'Noma\'lum'}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${inq.selected_package_title}</td>
        <td class="py-3 px-4 font-bold text-green-700">$${inq.total_price_usd.toLocaleString()}</td>
        <td class="py-3 px-4">
          <div class="flex items-center space-x-1.5">
            <a href="tel:${inq.customer_phone}" title="Qo'ng'iroq qilish" class="w-6 h-6 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center">
              <i class="fa-solid fa-phone text-[10px]"></i>
            </a>
            ${cleanPhone ? `
              <a href="https://wa.me/${cleanPhone}" target="_blank" title="WhatsApp ochish" class="w-6 h-6 rounded bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center">
                <i class="fa-brands fa-whatsapp text-xs"></i>
              </a>
            ` : ''}
            <span class="text-[11px] text-slate-700 font-mono">${inq.customer_phone}</span>
          </div>
        </td>
        <td class="py-3 px-4">${statusBadge}</td>
        <td class="py-3 px-4 text-[11px] text-slate-400">${dateFormatted}</td>
        <td class="py-3 px-4 text-center">
          <button onclick="viewInquiryDetail(${inq.id})" class="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors">
            Ko'rish
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// View Inquiry Modal
async function viewInquiryDetail(id) {
  try {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.inquiry) return;

    selectedInquiry = data.inquiry;
    const inq = data.inquiry;

    document.getElementById('inqModalTourCode').innerText = inq.tour_code;
    document.getElementById('inqCustomerName').innerText = inq.customer_name;
    document.getElementById('inqCustomerCountry').innerText = inq.customer_country;

    const emailEl = document.getElementById('inqCustomerEmail');
    emailEl.innerText = inq.customer_email;
    emailEl.href = `mailto:${inq.customer_email}`;

    const phoneEl = document.getElementById('inqCustomerPhone');
    phoneEl.innerText = inq.customer_phone;
    phoneEl.href = `tel:${inq.customer_phone}`;

    document.getElementById('inqTravelers').innerText = `${inq.number_of_travelers || 1} kishi`;
    document.getElementById('inqTotalPrice').innerText = `$${inq.total_price_usd.toLocaleString()} USD`;
    document.getElementById('inqSpecialRequests').innerText = inq.special_requests || 'Maxsus talablar bildirilmagan';

    document.getElementById('inqStatusSelect').value = inq.status;
    document.getElementById('inqAdminNotes').value = inq.admin_notes || '';

    // Quick Action buttons
    const cleanPhone = (inq.customer_phone || '').replace(/[^0-9]/g, '');
    document.getElementById('inqQuickActions').innerHTML = `
      <a href="tel:${inq.customer_phone}" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center space-x-1">
        <i class="fa-solid fa-phone text-xs"></i> <span>Telefon qilish</span>
      </a>
      ${cleanPhone ? `
        <a href="https://wa.me/${cleanPhone}" target="_blank" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center space-x-1">
          <i class="fa-brands fa-whatsapp"></i> <span>WhatsApp</span>
        </a>
      ` : ''}
    `;

    // Render Itinerary components
    const detailsContainer = document.getElementById('inqItineraryDetails');
    if (inq.itinerary && inq.itinerary.hotels) {
      const hotelsList = inq.itinerary.hotels.map(h => `
        <div class="p-2 bg-white rounded border border-slate-200">
          <div class="font-bold text-slate-800">${h.hotel_name} (${'★'.repeat(h.stars)}) - ${h.city}</div>
          <div class="text-slate-600">Xona: <strong>${h.room_name}</strong> ($${h.price_per_night}/kecha) • ${h.nights} kecha (${h.check_in} to ${h.check_out}) = <strong>$${h.total_cost}</strong></div>
        </div>
      `).join('');

      const trainsList = (inq.itinerary.trains || []).map(t => `
        <div class="p-2 bg-white rounded border border-slate-200">
          <div class="font-bold text-slate-800"><i class="fa-solid fa-train mr-1 text-amber-600"></i>${t.train_name} (${t.train_number}): ${t.from_city} ➔ ${t.to_city}</div>
          <div class="text-slate-600">Sana: ${t.travel_date} | Jo'nash: ${t.departure_time} - Yetib borish: ${t.arrival_time} | Toifa: <strong>${t.seat_class}</strong> = <strong>$${t.ticket_price_usd}</strong></div>
        </div>
      `).join('');

      const daysList = (inq.itinerary.itinerary_days || []).map(d => `
        <div class="p-2.5 bg-white rounded-lg border border-slate-200">
          <div class="font-bold text-slate-900 text-xs">${d.title} (${d.date})</div>
          <div class="text-[11px] text-slate-500 mb-1">Mehmonxona: ${d.hotel_night} (${d.room_type || 'Standard'})</div>
          <div class="pl-2 border-l-2 border-amber-400 space-y-1 text-[11px]">
            ${(d.timeline || []).map(t => `
              <div class="text-slate-700"><strong>${t.time}</strong> — ${t.title} <span class="text-slate-400">(${t.location})</span></div>
            `).join('')}
          </div>
        </div>
      `).join('');

      detailsContainer.innerHTML = `
        <div class="space-y-1 mb-2">
          <span class="font-bold text-slate-700 block">Hamkor Mehmonxonalar:</span>
          ${hotelsList}
        </div>
        <div class="space-y-1 mb-2">
          <span class="font-bold text-slate-700 block">Poyezd Chiptalari:</span>
          ${trainsList || '<span class="text-slate-400">Poyezd yo\'q</span>'}
        </div>
        <div class="space-y-1.5 pt-2 border-t border-slate-200">
          <span class="font-bold text-slate-700 block">Soatma-Soat Kunlik Dastur:</span>
          <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            ${daysList}
          </div>
        </div>
      `;
    } else {
      detailsContainer.innerHTML = `<span class="text-slate-500 italic">Oddiy murojaat</span>`;
    }

    document.getElementById('inquiryDetailModal').classList.remove('hidden');
  } catch (err) {
    console.error(err);
  }
}

function closeInquiryModal() {
  document.getElementById('inquiryDetailModal').classList.add('hidden');
}

async function saveInquiryStatus() {
  if (!selectedInquiry) return;
  const status = document.getElementById('inqStatusSelect').value;
  const notes = document.getElementById('inqAdminNotes').value.trim();

  try {
    const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status, notes })
    });
    const data = await res.json();
    if (data.success) {
      closeInquiryModal();
      loadInquiries();
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server bilan xatolik');
  }
}

// ==========================================
// 2. HOTELS & ROOMS MANAGEMENT
// ==========================================
async function loadHotels() {
  const grid = document.getElementById('hotelsGrid');
  grid.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Mehmonxonalar yuklanmoqda...</div>`;

  try {
    const res = await fetch('/api/admin/hotels', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.hotels) {
      renderHotelsGrid(data.hotels);
    }
  } catch (err) {
    grid.innerHTML = `<div class="col-span-3 text-center py-8 text-red-500">Mehmonxonalarni yuklashda xatolik</div>`;
  }
}

function renderHotelsGrid(hotels) {
  const grid = document.getElementById('hotelsGrid');
  if (hotels.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400">Hali mehmonxona qo'shilmagan</div>`;
    return;
  }

  grid.innerHTML = hotels.map(h => {
    const starsHtml = '★'.repeat(h.stars) + '☆'.repeat(5 - h.stars);

    const roomsHtml = (h.rooms || []).map(r => `
      <div class="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-1.5">
        <div>
          <span class="font-bold text-slate-800 block">${r.room_name}</span>
          <span class="text-[10px] text-slate-500">${r.description || (r.capacity + ' kishilik')}</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="font-bold text-blue-700">$${r.price_per_night_usd}/n</span>
          <button onclick="deleteRoom(${r.id})" title="Xonani o'chirish" class="text-slate-400 hover:text-red-500 p-1">
            <i class="fa-solid fa-trash-can text-[11px]"></i>
          </button>
        </div>
      </div>
    `).join('');

    return `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div class="p-5 border-b border-slate-100">
          <div class="flex justify-between items-start mb-1">
            <h4 class="font-bold text-slate-900 text-base leading-tight">${h.name}</h4>
            <span class="text-amber-500 font-bold text-sm">${starsHtml}</span>
          </div>
          <div class="text-xs text-slate-500 mb-2">
            <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${h.city} • ${h.address || ''}
          </div>
          <p class="text-[11px] text-slate-600 line-clamp-2">${h.description || ''}</p>
        </div>

        <div class="p-4 flex-1">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Xona Turlari & Narxlari:</span>
            <button onclick="openAddRoomModal(${h.id}, '${h.name}')" class="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center">
              <i class="fa-solid fa-plus mr-1"></i> Xona qo'shish
            </button>
          </div>
          <div class="space-y-1">
            ${roomsHtml || '<span class="text-xs text-slate-400 italic">Xonalar kiritilmagan</span>'}
          </div>
        </div>

        <div class="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
          <span class="text-[11px] text-green-700 font-semibold flex items-center">
            <i class="fa-solid fa-circle-check mr-1 text-[10px]"></i> Shartnoma faol
          </span>
          <button onclick="deleteHotel(${h.id})" class="text-slate-400 hover:text-red-600 text-xs font-semibold p-1">
            <i class="fa-solid fa-trash-can mr-1"></i> O'chirish
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Add Hotel
function openAddHotelModal() {
  document.getElementById('hotelModal').classList.remove('hidden');
}
function closeHotelModal() {
  document.getElementById('hotelModal').classList.add('hidden');
}

async function handleSaveHotel(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('newHotelName').value.trim(),
    city: document.getElementById('newHotelCity').value,
    stars: parseInt(document.getElementById('newHotelStars').value, 10),
    phone: document.getElementById('newHotelPhone').value.trim(),
    address: document.getElementById('newHotelAddress').value.trim(),
    description: document.getElementById('newHotelDesc').value.trim(),
    rooms: [
      {
        room_name: document.getElementById('newRoomName1').value.trim(),
        price_per_night_usd: parseFloat(document.getElementById('newRoomPrice1').value || 70),
        capacity: 2
      }
    ]
  };

  try {
    const res = await fetch('/api/admin/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeHotelModal();
      loadHotels();
      loadDashboardStats();
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server xatosi');
  }
}

async function deleteHotel(id) {
  if (!confirm('Mehmonxona va uning barcha xonalarini o\'chirmoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/admin/hotels/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadHotels();
      loadDashboardStats();
    }
  } catch (err) {
    alert('O\'chirishda xatolik');
  }
}

// Add Room Modal
function openAddRoomModal(hotelId, hotelName) {
  document.getElementById('roomHotelId').value = hotelId;
  document.getElementById('roomModalHotelName').innerText = `${hotelName} uchun yangi xona turi`;
  document.getElementById('roomModal').classList.remove('hidden');
}
function closeRoomModal() {
  document.getElementById('roomModal').classList.add('hidden');
}

async function handleSaveRoom(e) {
  e.preventDefault();
  const hotelId = document.getElementById('roomHotelId').value;
  const payload = {
    room_name: document.getElementById('newRoomName').value.trim(),
    price_per_night_usd: parseFloat(document.getElementById('newRoomPrice').value),
    capacity: parseInt(document.getElementById('newRoomCapacity').value || 2, 10),
    description: document.getElementById('newRoomDesc').value.trim()
  };

  try {
    const res = await fetch(`/api/admin/hotels/${hotelId}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeRoomModal();
      loadHotels();
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server xatosi');
  }
}

async function deleteRoom(id) {
  if (!confirm('Ushbu xona turini o\'chirmoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/admin/rooms/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadHotels();
    }
  } catch (err) {
    alert('Xatolik');
  }
}

// ==========================================
// 3. TRAINS MANAGEMENT
// ==========================================
async function loadTrains() {
  const tbody = document.getElementById('trainsTableBody');
  tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Poyezdlar yuklanmoqda...</td></tr>`;

  try {
    const res = await fetch('/api/admin/trains', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.trains) {
      renderTrainsTable(data.trains);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-red-500">Poyezdlarni yuklashda xatolik</td></tr>`;
  }
}

function renderTrainsTable(trains) {
  const tbody = document.getElementById('trainsTableBody');
  if (trains.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="py-8 text-center text-slate-400">Poyezdlar kiritilmagan</td></tr>`;
    return;
  }

  tbody.innerHTML = trains.map(t => {
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-4 font-bold text-slate-900">${t.train_name} <span class="text-slate-400 font-normal">(${t.train_number})</span></td>
        <td class="py-3 px-4 text-slate-600">${t.train_type}</td>
        <td class="py-3 px-4 font-semibold text-blue-800">${t.from_city} ➔ ${t.to_city}</td>
        <td class="py-3 px-4 font-mono">${t.departure_time} - ${t.arrival_time}</td>
        <td class="py-3 px-4 text-slate-600">${t.duration}</td>
        <td class="py-3 px-4 font-bold text-slate-800">$${t.economy_price_usd}</td>
        <td class="py-3 px-4 font-bold text-blue-700">$${t.business_price_usd}</td>
        <td class="py-3 px-4 font-bold text-amber-700">$${t.vip_price_usd}</td>
        <td class="py-3 px-4 text-center">
          <button onclick="deleteTrain(${t.id})" class="text-slate-400 hover:text-red-600 p-1">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddTrainModal() {
  document.getElementById('trainModal').classList.remove('hidden');
}
function closeTrainModal() {
  document.getElementById('trainModal').classList.add('hidden');
}

async function handleSaveTrain(e) {
  e.preventDefault();
  const payload = {
    train_name: document.getElementById('newTrainName').value.trim(),
    train_number: document.getElementById('newTrainNumber').value.trim(),
    train_type: document.getElementById('newTrainType').value,
    from_city: document.getElementById('newTrainFrom').value,
    to_city: document.getElementById('newTrainTo').value,
    duration: document.getElementById('newTrainDuration').value.trim(),
    departure_time: document.getElementById('newTrainDep').value,
    arrival_time: document.getElementById('newTrainArr').value,
    economy_price_usd: parseFloat(document.getElementById('newTrainEco').value),
    business_price_usd: parseFloat(document.getElementById('newTrainBus').value),
    vip_price_usd: parseFloat(document.getElementById('newTrainVip').value)
  };

  try {
    const res = await fetch('/api/admin/trains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeTrainModal();
      loadTrains();
      loadDashboardStats();
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server xatosi');
  }
}

async function deleteTrain(id) {
  if (!confirm('Ushbu poyezd yo\'nalishini o\'chirmoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/admin/trains/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadTrains();
      loadDashboardStats();
    }
  } catch (err) {
    alert('Xatolik');
  }
}

// ==========================================
// 4. AGENCY SETTINGS
// ==========================================
async function loadAgencySettings() {
  try {
    const res = await fetch('/api/agency');
    const data = await res.json();
    if (data.success && data.agency) {
      const a = data.agency;
      document.getElementById('setAgencyName').value = a.name || '';
      document.getElementById('setAgencyLicense').value = a.license_no || '';
      document.getElementById('setAgencyPhone').value = a.phone || '';
      document.getElementById('setAgencyWhatsapp').value = a.whatsapp || '';
      document.getElementById('setAgencyTelegram').value = a.telegram || '';
      document.getElementById('setAgencyEmail').value = a.email || '';
      document.getElementById('setAgencyAddress').value = a.address || '';
      document.getElementById('setAgencyAbout').value = a.about_text || '';
    }
  } catch (err) {
    console.error('Agency load error:', err);
  }
}

async function handleAgencySettingsSubmit(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('setAgencyName').value.trim(),
    license_no: document.getElementById('setAgencyLicense').value.trim(),
    phone: document.getElementById('setAgencyPhone').value.trim(),
    whatsapp: document.getElementById('setAgencyWhatsapp').value.trim(),
    telegram: document.getElementById('setAgencyTelegram').value.trim(),
    email: document.getElementById('setAgencyEmail').value.trim(),
    address: document.getElementById('setAgencyAddress').value.trim(),
    about_text: document.getElementById('setAgencyAbout').value.trim()
  };

  try {
    const res = await fetch('/api/admin/agency', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ Agentlik ma\'lumotlari muvaffaqiyatli saqlandi!');
      loadAgencySettings();
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server xatosi');
  }
}

// ==========================================
// 5. GUIDES MANAGEMENT
// ==========================================
async function loadGuides() {
  const grid = document.getElementById('guidesGrid');
  grid.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Gidlar yuklanmoqda...</div>`;

  try {
    const res = await fetch('/api/admin/guides', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.guides) {
      renderGuidesGrid(data.guides);
    }
  } catch (err) {
    grid.innerHTML = `<div class="col-span-3 text-center py-8 text-red-500">Gidlarni yuklashda xatolik</div>`;
  }
}

function renderGuidesGrid(guides) {
  const grid = document.getElementById('guidesGrid');
  if (guides.length === 0) {
    grid.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400">Gidlar kiritilmagan</div>`;
    return;
  }

  grid.innerHTML = guides.map(g => `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-base leading-tight">${g.name}</h4>
              <span class="text-xs text-amber-700 font-semibold"><i class="fa-solid fa-language mr-1"></i> ${g.languages}</span>
            </div>
          </div>
          <span class="text-xs font-bold text-amber-500"><i class="fa-solid fa-star mr-0.5"></i> ${g.rating || '4.9'}</span>
        </div>

        <div class="text-xs text-slate-500 space-y-1 mb-2">
          <div><i class="fa-solid fa-map-pin mr-1 text-slate-400"></i> ${g.city}</div>
          <div><i class="fa-solid fa-id-card mr-1 text-slate-400"></i> Litsenziya: <strong>${g.license_number || 'Mavjud'}</strong></div>
          ${g.phone ? `<div><i class="fa-solid fa-phone mr-1 text-slate-400"></i> ${g.phone}</div>` : ''}
        </div>

        <p class="text-xs text-slate-600 line-clamp-3">${g.bio || 'Professional turizm gidi.'}</p>
      </div>

      <div class="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
        <span class="font-bold text-blue-700 text-sm">$${g.daily_rate_usd} / kun</span>
        <button onclick="deleteGuide(${g.id})" class="text-slate-400 hover:text-red-600 p-1 font-semibold">
          <i class="fa-solid fa-trash-can mr-1"></i> O'chirish
        </button>
      </div>
    </div>
  `).join('');
}

function openAddGuideModal() {
  document.getElementById('guideModal').classList.remove('hidden');
}
function closeGuideModal() {
  document.getElementById('guideModal').classList.add('hidden');
}

async function handleSaveGuide(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('newGuideName').value.trim(),
    languages: document.getElementById('newGuideLanguages').value.trim(),
    city: document.getElementById('newGuideCity').value.trim(),
    daily_rate_usd: parseFloat(document.getElementById('newGuideRate').value || 50),
    license_number: document.getElementById('newGuideLicense').value.trim(),
    phone: document.getElementById('newGuidePhone').value.trim(),
    bio: document.getElementById('newGuideBio').value.trim()
  };

  try {
    const res = await fetch('/api/admin/guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeGuideModal();
      loadGuides();
      loadDashboardStats();
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server xatosi');
  }
}

async function deleteGuide(id) {
  if (!confirm('Ushbu gidni ro\'yxatdan o\'chirmoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/admin/guides/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadGuides();
      loadDashboardStats();
    }
  } catch (err) {
    alert('Xatolik');
  }
}

// ==========================================
// 6. FLIGHTS MANAGEMENT (Turkey <-> UZB)
// ==========================================
async function loadFlights() {
  const tbody = document.getElementById('flightsTableBody');
  tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Parvozlar yuklanmoqda...</td></tr>`;

  try {
    const res = await fetch('/api/admin/flights', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.flights) {
      renderFlightsTable(data.flights);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-red-500">Parvozlarni yuklashda xatolik</td></tr>`;
  }
}

function renderFlightsTable(flights) {
  const tbody = document.getElementById('flightsTableBody');
  if (flights.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="py-8 text-center text-slate-400">Aviaparvozlar kiritilmagan</td></tr>`;
    return;
  }

  tbody.innerHTML = flights.map(f => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-3 px-4 font-bold text-slate-900">${f.airline}</td>
      <td class="py-3 px-4 font-mono font-bold text-blue-600">${f.flight_number}</td>
      <td class="py-3 px-4 font-semibold text-slate-800">${f.from_city} ➔ ${f.to_city}</td>
      <td class="py-3 px-4 font-mono text-slate-700">${f.departure_time} - ${f.arrival_time}</td>
      <td class="py-3 px-4 text-slate-500">${f.duration}</td>
      <td class="py-3 px-4 font-bold text-slate-900">$${f.economy_price_usd}</td>
      <td class="py-3 px-4 font-bold text-amber-700">$${f.business_price_usd}</td>
      <td class="py-3 px-4 text-[11px] text-slate-500">${f.baggage_allowance}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="deleteFlight(${f.id})" class="text-slate-400 hover:text-red-600 p-1">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function openAddFlightModal() {
  document.getElementById('flightModal').classList.remove('hidden');
}
function closeFlightModal() {
  document.getElementById('flightModal').classList.add('hidden');
}

async function handleSaveFlight(e) {
  e.preventDefault();
  const payload = {
    airline: document.getElementById('newFlightAirline').value.trim(),
    flight_number: document.getElementById('newFlightNumber').value.trim(),
    from_city: document.getElementById('newFlightFrom').value.trim(),
    to_city: document.getElementById('newFlightTo').value.trim(),
    departure_time: document.getElementById('newFlightDep').value,
    arrival_time: document.getElementById('newFlightArr').value,
    duration: document.getElementById('newFlightDuration').value.trim(),
    economy_price_usd: parseFloat(document.getElementById('newFlightEco').value || 300),
    business_price_usd: parseFloat(document.getElementById('newFlightBus').value || 600),
    baggage_allowance: document.getElementById('newFlightBaggage').value.trim()
  };

  try {
    const res = await fetch('/api/admin/flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeFlightModal();
      loadFlights();
      loadDashboardStats();
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server xatosi');
  }
}

async function deleteFlight(id) {
  if (!confirm('Ushbu parvozni o\'chirmoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/admin/flights/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadFlights();
      loadDashboardStats();
    }
  } catch (err) {
    alert('Xatolik');
  }
}
