// Silk Road — by M.S | Creative AI Concierge & Tour Planner Application Logic
let currentAgency = null;
let currentPackages = [];
let selectedPackageForBooking = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initI18n === 'function') {
    initI18n();
  }
  loadAgencyInfo();
});

// Load agency details from REST API
async function loadAgencyInfo() {
  try {
    const res = await fetch('/api/agency');
    const data = await res.json();
    if (data.success && data.agency) {
      currentAgency = data.agency;
      updateAgencyUI(data.agency);
    }
  } catch (err) {
    console.error('Failed to load agency info:', err);
  }
}

function updateAgencyUI(agency) {
  const topPhone = document.getElementById('topPhone');
  if (topPhone) {
    topPhone.href = `tel:${agency.phone}`;
    topPhone.innerHTML = `<i class="fa-solid fa-phone mr-1"></i> ${agency.phone}`;
  }

  const topWhatsapp = document.getElementById('topWhatsapp');
  if (topWhatsapp && agency.whatsapp) {
    const cleanNum = agency.whatsapp.replace(/[^0-9]/g, '');
    topWhatsapp.href = `https://wa.me/${cleanNum}`;
  }

  // Populate modals
  if (document.getElementById('modalAgencyName')) document.getElementById('modalAgencyName').innerText = agency.name;
  if (document.getElementById('modalAgencyLicense')) document.getElementById('modalAgencyLicense').innerText = `License: ${agency.license_no}`;
  if (document.getElementById('modalAgencyAbout')) document.getElementById('modalAgencyAbout').innerText = agency.about_text;
  if (document.getElementById('modalAgencyPhone')) document.getElementById('modalAgencyPhone').innerText = agency.phone;
  if (document.getElementById('modalAgencyWhatsapp')) document.getElementById('modalAgencyWhatsapp').innerText = agency.whatsapp;
  if (document.getElementById('modalAgencyEmail')) document.getElementById('modalAgencyEmail').innerText = agency.email;
  if (document.getElementById('modalAgencyAddress')) document.getElementById('modalAgencyAddress').innerText = agency.address;
}

// Switch between AI Chat and Wizard form tabs
function switchPlannerTab(tab) {
  const chatBtn = document.getElementById('tabChatBtn');
  const formBtn = document.getElementById('tabFormBtn');
  const chatContent = document.getElementById('tabChatContent');
  const formContent = document.getElementById('tabFormContent');

  if (tab === 'chat') {
    chatBtn.className = 'flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 bg-white text-blue-700 shadow-sm border border-slate-200';
    formBtn.className = 'flex-1 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-900';
    chatContent.classList.remove('hidden');
    formContent.classList.add('hidden');
  } else {
    formBtn.className = 'flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 bg-white text-blue-700 shadow-sm border border-slate-200';
    chatBtn.className = 'flex-1 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 text-slate-600 hover:text-slate-900';
    formContent.classList.remove('hidden');
    chatContent.classList.add('hidden');
  }
}

// Quick Prompt Sender
function sendQuickPrompt(promptText) {
  document.getElementById('chatInput').value = promptText;
  handleChatSubmit(new Event('submit'));
}

// Handle AI Chat Submission
async function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';

  const sendBtn = document.getElementById('sendBtn');
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

  const loadingId = appendLoadingMessage();

  try {
    const currentLang = typeof getCurrentLang === 'function' ? getCurrentLang() : 'en';
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, lang: currentLang })
    });
    const data = await res.json();
    removeLoadingMessage(loadingId);

    if (data.success) {
      appendMessage('ai', data.reply);

      if (data.packages && data.packages.length > 0) {
        currentPackages = data.packages;
        renderCreativeTourPackages(data.packages);
        setTimeout(() => {
          document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } else {
      appendMessage('ai', `Kechirasiz, xatolik yuz berdi: ${data.error}`);
    }
  } catch (err) {
    removeLoadingMessage(loadingId);
    appendMessage('ai', 'Server bilan aloqa uzildi. Iltimos, qaytadan urinib ko\'ring yoki WhatsApp orqali bog\'laning.');
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = `<i class="fa-solid fa-paper-plane text-xs"></i>`;
  }
}

// Handle Wizard Form Submission
async function handleWizardSubmit(e) {
  e.preventDefault();
  const origin = document.getElementById('wizardOrigin').value.trim();
  const budget = parseFloat(document.getElementById('wizardBudget').value);
  const duration = parseInt(document.getElementById('wizardDuration').value, 10);

  const cityCheckboxes = document.querySelectorAll('input[name="wizardCities"]:checked');
  const cities = Array.from(cityCheckboxes).map(cb => cb.value);

  if (cities.length === 0) {
    alert('Iltimos, kamida bitta shaharni tanlang!');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const origText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Aviaparvozlar va gidlar bilan reja tuzilmoqda...`;

  try {
    const currentLang = typeof getCurrentLang === 'function' ? getCurrentLang() : 'en';
    const res = await fetch('/api/generate-tour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, cities, budget, duration, lang: currentLang })
    });
    const data = await res.json();
    if (data.success && data.packages) {
      currentPackages = data.packages;

      // Check wizard checkboxes
      const includeFlight = document.getElementById('wizardIncludeFlight') ? document.getElementById('wizardIncludeFlight').checked : true;
      const includeGuide = document.getElementById('wizardIncludeGuide') ? document.getElementById('wizardIncludeGuide').checked : true;

      currentPackages.forEach(p => {
        p.breakdown.include_flight = includeFlight;
        p.breakdown.include_guide = includeGuide;
        recalculatePackageCost(p);
      });

      renderCreativeTourPackages(currentPackages);
      document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server bilan bog\'lanishda xatolik yuz berdi.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = origText;
  }
}

// Message Rendering in Chat
function appendMessage(sender, text) {
  const container = document.getElementById('chatHistory');
  const wrapper = document.createElement('div');
  wrapper.className = `flex items-start space-x-3 ${sender === 'user' ? 'justify-end' : ''}`;

  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  if (sender === 'user') {
    wrapper.innerHTML = `
      <div class="chat-bubble-user p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed">
        ${formattedText}
      </div>
      <div class="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 shadow">
        <i class="fa-solid fa-user"></i>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-7 h-7 rounded-xl gold-gradient text-white flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm mt-0.5">
        <i class="fa-solid fa-sparkles"></i>
      </div>
      <div class="chat-bubble-ai p-3 rounded-2xl max-w-[90%] text-xs sm:text-sm leading-relaxed">
        ${formattedText}
      </div>
    `;
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function appendLoadingMessage() {
  const container = document.getElementById('chatHistory');
  const id = `loading-${Date.now()}`;
  const wrapper = document.createElement('div');
  wrapper.id = id;
  wrapper.className = 'flex items-start space-x-3';
  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);
  wrapper.innerHTML = `
    <div class="w-7 h-7 rounded-xl gold-gradient text-white flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm mt-0.5">
      <i class="fa-solid fa-sparkles"></i>
    </div>
    <div class="chat-bubble-ai p-3 rounded-2xl text-xs text-slate-600 flex items-center space-x-2 shadow-sm max-w-[90%]">
      <i class="fa-solid fa-circle-notch fa-spin text-amber-500"></i>
      <span>${_t('chat_calculating', 'Aviachiptalar, hamkor mehmonxonalar, gidlar va tezyurar poyezdlar hisob-kitob qilinmoqda...')}</span>
    </div>
  `;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeLoadingMessage(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Recalculate package totals based on active options (Hotels + Trains + Flights + Guide + Transport + Meals + Tax + Agency fee)
function recalculatePackageCost(pkg) {
  const b = pkg.breakdown;
  let total = b.hotels_total + b.trains_total + b.daily_transport_total + b.meals_est_total + b.tickets_est_total + b.state_tourist_tax + b.agency_service_fee;

  if (b.include_flight) {
    total += b.flights_total;
  }
  if (b.include_guide) {
    total += b.guide_total;
  }

  b.grand_total_usd = total;
  b.savings_usd = Math.max(0, b.client_budget_usd - total);
  return total;
}

// Localize day titles dynamically
function localizeDayTitle(d, totalDays) {
  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);
  const city = d.city || 'Uzbekistan';
  if (d.day_number === 1) {
    return _t('pkg_day_arrival', 'Arrival in {city} & City Orientation').replace('{city}', city);
  }
  if (d.day_number === totalDays) {
    return _t('pkg_day_departure', 'Farewell, Oriental Souvenirs & Airport Departure Transfer').replace('{city}', city);
  }
  if (d.train_info) {
    return _t('pkg_day_transfer', 'High-Speed Train to {city} & Historic Sightseeing').replace('{city}', city);
  }
  return _t('pkg_day_explore', 'Full-Day In-Depth Exploration of Ancient {city}').replace('{city}', city);
}

// ========================================================
// CREATIVE MODERN TOUR PACKAGES RENDERER (Full Rich View)
// ========================================================
function renderCreativeTourPackages(packages) {
  const resultsSection = document.getElementById('resultsSection');
  const container = document.getElementById('packagesContainer');
  resultsSection.classList.remove('hidden');
  container.innerHTML = '';

  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);

  packages.forEach((pkg, pkgIndex) => {
    const card = document.createElement('div');
    card.id = `package-card-${pkgIndex}`;
    card.className = 'creative-tour-card bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col transition-all duration-300';

    let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
    if (pkg.package_id === 'luxury') {
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
    }
    if (pkg.package_id === 'budget') {
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }

    const cardBadge = _t('pkg_badge_' + pkg.package_id, pkg.badge);
    const cardTitle = _t('pkg_title_' + pkg.package_id, pkg.package_title);
    const cardTagline = _t('pkg_tagline_' + pkg.package_id, pkg.tagline);
    const flightOrigin = pkg.flights && pkg.flights.outbound ? pkg.flights.outbound.from_city.split('(')[0].trim() : (pkg.customer_origin || 'International');
    const daysCountText = _t('pkg_days_count', '{days} Days / {nights} Nights').replace('{days}', pkg.duration_days).replace('{nights}', Math.max(1, pkg.duration_days - 1));

    let bannerImg = 'images/samarkand_registan.jpg';
    if (pkg.package_id === 'comfort') bannerImg = 'images/bukhara_kalyan.jpg';
    if (pkg.package_id === 'budget') bannerImg = 'images/khiva_itchankala.jpg';

    card.innerHTML = `
      <!-- Card Top Banner with Uzbek Silk Road Visuals -->
      <div class="p-6 text-white relative overflow-hidden" style="background: linear-gradient(to bottom, rgba(4, 8, 20, 0.88) 0%, rgba(4, 8, 20, 0.96) 100%), url('${bannerImg}') center/cover no-repeat;">
        <div class="uzb-hoshiya-trim absolute top-0 left-0 right-0"></div>
        <div class="absolute right-0 top-0 opacity-15 text-9xl transform translate-x-6 -translate-y-6 text-amber-300">
          <i class="fa-solid fa-mosque"></i>
        </div>

        <div class="flex justify-between items-start mb-3 relative z-10">
          <span class="px-3 py-1 text-xs font-bold rounded-full border ${badgeClass} uppercase tracking-wider">
            ${cardBadge}
          </span>
          <div class="flex items-center space-x-2">
            <button onclick="printTourVoucher(${pkgIndex})" title="${_t('pkg_voucher', 'Voucher')}" class="text-xs bg-white/10 hover:bg-white/20 text-slate-300 px-2.5 py-1 rounded-full flex items-center border border-white/10 transition-colors">
              <i class="fa-solid fa-print mr-1 text-[11px]"></i> ${_t('pkg_voucher', 'Voucher')}
            </button>
            <button onclick="copyTourId('${pkg.tour_code}')" title="Copy Tour ID" class="font-mono text-xs font-semibold bg-white/10 hover:bg-white/20 text-amber-300 px-3 py-1 rounded-full flex items-center border border-white/10 transition-colors">
              <i class="fa-solid fa-copy mr-1.5 text-[11px]"></i> ${pkg.tour_code}
            </button>
          </div>
        </div>

        <h3 class="font-serif font-bold text-2xl text-white mb-1 relative z-10">${cardTitle}</h3>
        <p class="text-xs text-slate-300 font-light mb-4 relative z-10">${cardTagline}</p>

        <!-- Route & Visa Visualization -->
        <div class="space-y-2 relative z-10">
          <div class="flex items-center space-x-2 text-xs font-semibold text-amber-400 bg-black/30 p-2.5 rounded-xl border border-white/5">
            <i class="fa-solid fa-route"></i>
            <span>${pkg.cities}</span>
            <span class="text-slate-400 font-normal ml-auto">${daysCountText}</span>
          </div>
          ${pkg.visa_info ? `
            <div class="text-[11px] text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center">
              <i class="fa-solid fa-passport mr-1.5 text-emerald-400"></i> ${pkg.visa_info}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Financial Metric Bar -->
      <div class="p-5 bg-gradient-to-r from-amber-50/50 via-white to-blue-50/50 border-b border-slate-100">
        <div class="flex items-baseline justify-between mb-3">
          <div>
            <span class="text-3xl font-extrabold text-slate-900" id="total-price-${pkgIndex}">${pkg.breakdown.grand_total_usd.toLocaleString()}</span>
            <span class="text-xs text-slate-500 font-semibold uppercase"> ${_t('pkg_total_cost', 'USD • Grand Total')}</span>
          </div>
          <div class="text-right">
            ${pkg.breakdown.savings_usd > 0 ? `
              <span class="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full inline-block" id="savings-badge-${pkgIndex}">
                ${_t('pkg_savings', 'Savings:')} ${pkg.breakdown.savings_usd.toLocaleString()}
              </span>
            ` : `<span class="text-xs text-slate-500">${_t('pkg_budget_matched', 'Matches Budget')}</span>`}
            <span class="text-[10px] text-slate-400 block mt-0.5">${_t('pkg_client_budget', 'Target Budget:')} ${pkg.breakdown.client_budget_usd.toLocaleString()}</span>
          </div>
        </div>

        <!-- Interactive Fast Toggles: Flight & Guide -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white rounded-xl border border-slate-200 mb-3 text-xs">
          <!-- Guide Toggle -->
          <label class="flex items-center justify-between cursor-pointer p-1">
            <span class="flex items-center font-bold text-slate-800">
              <input type="checkbox" id="toggle-guide-${pkgIndex}" ${pkg.breakdown.include_guide ? 'checked' : ''} onchange="toggleGuideService(${pkgIndex})" class="w-4 h-4 text-blue-600 rounded mr-2 focus:ring-blue-500">
              <i class="fa-solid fa-user-tie text-amber-600 mr-1.5"></i> ${_t('pkg_guide_service', 'Guide Service:')}
            </span>
            <span class="font-bold text-amber-700">+${pkg.breakdown.guide_total}</span>
          </label>

          <!-- Flight Toggle -->
          <label class="flex items-center justify-between cursor-pointer p-1">
            <span class="flex items-center font-bold text-slate-800">
              <input type="checkbox" id="toggle-flight-${pkgIndex}" ${pkg.breakdown.include_flight ? 'checked' : ''} onchange="toggleFlightService(${pkgIndex})" class="w-4 h-4 text-blue-600 rounded mr-2 focus:ring-blue-500">
              <i class="fa-solid fa-plane text-blue-600 mr-1.5"></i> ${_t('pkg_flight_service', 'Flight ({origin}):').replace('{origin}', flightOrigin)}
            </span>
            <span class="font-bold text-blue-700">+${pkg.breakdown.flights_total}</span>
          </label>
        </div>

        <!-- Detailed Cost Allocation Chips -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-400 block text-[10px]"><i class="fa-solid fa-hotel text-amber-500 mr-1"></i> ${_t('pkg_chip_hotels', 'Hotels')}:</span>
            <strong class="text-slate-900" id="hotels-cost-${pkgIndex}">${pkg.breakdown.hotels_total}</strong>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-400 block text-[10px]"><i class="fa-solid fa-train text-blue-500 mr-1"></i> ${_t('pkg_chip_trains', 'Trains')}:</span>
            <strong class="text-slate-900">${pkg.breakdown.trains_total}</strong>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-400 block text-[10px]"><i class="fa-solid fa-car text-purple-500 mr-1"></i> ${_t('pkg_chip_transport', 'VIP Transport')}:</span>
            <strong class="text-slate-900">${pkg.breakdown.daily_transport_total}</strong>
          </div>
          <div class="bg-white p-2 rounded-lg border border-slate-200">
            <span class="text-slate-400 block text-[10px]"><i class="fa-solid fa-utensils text-green-600 mr-1"></i> ${_t('pkg_chip_meals', 'Meals')}:</span>
            <strong class="text-slate-900">${pkg.breakdown.meals_est_total}</strong>
          </div>
        </div>
      </div>

      <!-- Interactive Tab Selector Inside Card -->
      <div class="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 overflow-x-auto">
        <button onclick="switchCardSubTab(${pkgIndex}, 'schedule')" id="card-tab-btn-${pkgIndex}-schedule" class="package-tab-btn active flex-1 py-3 px-2 text-center transition-all flex items-center justify-center space-x-1 whitespace-nowrap">
          <i class="fa-solid fa-clock-rotate-left text-amber-600"></i>
          <span>${_t('pkg_tab_timeline', 'Hourly Schedule')}</span>
        </button>
        <button onclick="switchCardSubTab(${pkgIndex}, 'hotels')" id="card-tab-btn-${pkgIndex}-hotels" class="package-tab-btn flex-1 py-3 px-2 text-center transition-all flex items-center justify-center space-x-1 whitespace-nowrap">
          <i class="fa-solid fa-bed text-blue-600"></i>
          <span>${_t('pkg_tab_hotels', 'Hotels & Rooms')}</span>
        </button>
        <button onclick="switchCardSubTab(${pkgIndex}, 'trains')" id="card-tab-btn-${pkgIndex}-trains" class="package-tab-btn flex-1 py-3 px-2 text-center transition-all flex items-center justify-center space-x-1 whitespace-nowrap">
          <i class="fa-solid fa-train text-indigo-600"></i>
          <span>${_t('pkg_tab_trains', 'Trains')}</span>
        </button>
        <button onclick="switchCardSubTab(${pkgIndex}, 'flights')" id="card-tab-btn-${pkgIndex}-flights" class="package-tab-btn flex-1 py-3 px-2 text-center transition-all flex items-center justify-center space-x-1 whitespace-nowrap">
          <i class="fa-solid fa-plane-departure text-sky-600"></i>
          <span>${_t('pkg_tab_flights', 'Flight')}</span>
        </button>
        <button onclick="switchCardSubTab(${pkgIndex}, 'guide')" id="card-tab-btn-${pkgIndex}-guide" class="package-tab-btn flex-1 py-3 px-2 text-center transition-all flex items-center justify-center space-x-1 whitespace-nowrap">
          <i class="fa-solid fa-user-tie text-amber-600"></i>
          <span>${_t('pkg_tab_guide', 'Guide & Services')}</span>
        </button>
        <button onclick="switchCardSubTab(${pkgIndex}, 'included')" id="card-tab-btn-${pkgIndex}-included" class="package-tab-btn flex-1 py-3 px-2 text-center transition-all flex items-center justify-center space-x-1 whitespace-nowrap">
          <i class="fa-solid fa-shield-heart text-emerald-600"></i>
          <span>${_t('pkg_tab_included', 'Included')}</span>
        </button>
      </div>

      <!-- Tab 1: Hourly Schedule -->
      <div id="card-tab-view-${pkgIndex}-schedule" class="p-5 flex-1 space-y-4">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
            <i class="fa-solid fa-calendar-day text-amber-500 mr-1"></i> ${_t('pkg_schedule_header', 'Day-by-Day Hour-by-Hour Itinerary ({days} days)').replace('{days}', pkg.itinerary_days.length)}
          </span>
          <span class="text-[11px] text-blue-600 font-semibold">${_t('pkg_schedule_sub', 'All scheduled times, landmarks, and private transport included')}</span>
        </div>

        <div class="space-y-3" id="days-accordion-${pkgIndex}">
          ${renderDaysAccordion(pkg.itinerary_days, pkgIndex)}
        </div>
      </div>

      <!-- Tab 2: Hotels & Room Customizer -->
      <div id="card-tab-view-${pkgIndex}-hotels" class="p-5 flex-1 space-y-4 hidden">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
            <i class="fa-solid fa-hotel text-blue-600 mr-1"></i> ${_t('pkg_hotels_header', 'Contracted Partner Hotels')}
          </span>
          <span class="text-[11px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200">
            ${_t('pkg_hotels_sub', 'Selecting a room automatically updates total cost')}
          </span>
        </div>

        <div class="space-y-3" id="hotels-room-picker-${pkgIndex}">
          ${renderHotelsWithRoomSwitcher(pkg.hotels, pkgIndex)}
        </div>
      </div>

      <!-- Tab 3: Trains Schedule -->
      <div id="card-tab-view-${pkgIndex}-trains" class="p-5 flex-1 space-y-4 hidden">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
            <i class="fa-solid fa-train text-amber-600 mr-1"></i> ${_t('pkg_trains_header', 'Afrosiyob High-Speed Rail & Express Train Schedule')}
          </span>
          <span class="text-[11px] text-slate-500">${_t('pkg_trains_sub', 'Official Uzbekistan Railways (O\'ztemiryo\'lyo\'lovchi)')}</span>
        </div>

        <div class="space-y-3">
          ${renderTrainCards(pkg.trains)}
        </div>
      </div>

      <!-- Tab 4: Flights -->
      <div id="card-tab-view-${pkgIndex}-flights" class="p-5 flex-1 space-y-4 hidden">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
            <i class="fa-solid fa-plane-departure text-blue-600 mr-1"></i> ${_t('pkg_flight_header', 'Arrival and Departure Flights ({origin})').replace('{origin}', flightOrigin)}
          </span>
          <span class="text-[11px] text-slate-500 font-semibold">${flightOrigin} ⇄ ${_t('pkg_uzb', 'Uzbekistan')}</span>
        </div>

        ${renderFlightsView(pkg.flights, pkg.breakdown.include_flight, pkgIndex, pkg.customer_origin)}
      </div>

      <!-- Tab 5: Guide & Services -->
      <div id="card-tab-view-${pkgIndex}-guide" class="p-5 flex-1 space-y-4 hidden">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
            <i class="fa-solid fa-user-tie text-amber-600 mr-1"></i> ${_t('pkg_guide_header', 'Certified Personal Guide & Chauffeur Services')}
          </span>
          <span class="text-[11px] text-slate-500">${_t('pkg_guide_sub', 'Licensed multilingual experts')}</span>
        </div>

        ${renderGuideAndServicesView(pkg, pkgIndex)}
      </div>

      <!-- Tab 6: Inclusions & Guarantee -->
      <div id="card-tab-view-${pkgIndex}-included" class="p-5 flex-1 space-y-4 hidden">
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
          <h4 class="font-bold text-slate-900 text-sm mb-2 flex items-center">
            <i class="fa-solid fa-circle-check text-green-600 mr-2 text-base"></i> ${_t('pkg_inc_header', 'What is Included in This Tour Package?')}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700">
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_1', 'Overnight stays in contracted 3-5★ partner hotels')}</span></div>
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_2', 'Daily rich buffet breakfast at each hotel')}</span></div>
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_3', 'Guaranteed high-speed Afrosiyob train tickets')}</span></div>
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_4', 'Air-conditioned VIP transport with dedicated chauffeur')}</span></div>
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_5', 'VIP airport meet & greet and departure transfers')}</span></div>
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_6', 'Professional certified tour guide (optional toggle)')}</span></div>
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_7', 'Official state tourist taxes in all historical cities')}</span></div>
            <div class="flex items-start space-x-2"><i class="fa-solid fa-check text-green-600 mt-0.5"></i><span>${_t('pkg_inc_8', '24/7 personal tour coordinator & agency support')}</span></div>
          </div>
        </div>

        <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950">
          <p class="font-bold mb-1"><i class="fa-solid fa-shield-halved text-amber-600 mr-1.5"></i> ${_t('pkg_guarantee_title', 'Official Guarantee & Contractual Trust:')}</p>
          <p class="leading-relaxed">
            ${_t('pkg_guarantee_desc', 'We are an officially state-licensed tour operator. All pricing is transparent and contractually protected with zero hidden fees.').replace('{license}', currentAgency ? currentAgency.license_no : 'T-UZB-2024-8841')}
          </p>
        </div>
      </div>

      <!-- Card Footer CTA Button -->
      <div class="p-5 bg-white border-t border-slate-100 flex flex-col items-center">
        <button
          onclick="openBookingModal(${pkgIndex})"
          class="w-full py-4 px-6 gold-gradient hover:opacity-95 text-slate-950 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2.5 btn-cta-pulse"
        >
          <i class="fa-solid fa-paper-plane text-lg"></i>
          <span>${_t('pkg_contact_operator', 'Book This Tour / Contact Operator')}</span>
        </button>
        <span class="text-[11px] text-slate-400 mt-2 font-medium">
          <i class="fa-solid fa-lock mr-1 text-[10px]"></i> ${_t('pkg_direct_order_note', 'This booking request is routed directly to our concierge operator')}
        </span>
      </div>
    `;

    container.appendChild(card);
  });
}

// Switch Sub Tabs inside package card
function switchCardSubTab(pkgIndex, tabName) {
  const tabs = ['schedule', 'hotels', 'trains', 'flights', 'guide', 'included'];
  tabs.forEach(t => {
    const btn = document.getElementById(`card-tab-btn-${pkgIndex}-${t}`);
    const view = document.getElementById(`card-tab-view-${pkgIndex}-${t}`);
    if (btn && view) {
      if (t === tabName) {
        btn.classList.add('active');
        view.classList.remove('hidden');
      } else {
        btn.classList.remove('active');
        view.classList.add('hidden');
      }
    }
  });
}

// Toggle Guide Service on/off
function toggleGuideService(pkgIndex) {
  const pkg = currentPackages[pkgIndex];
  if (!pkg) return;

  const cb = document.getElementById(`toggle-guide-${pkgIndex}`);
  pkg.breakdown.include_guide = cb.checked;
  recalculatePackageCost(pkg);

  // Update total price display
  document.getElementById(`total-price-${pkgIndex}`).innerText = `$${pkg.breakdown.grand_total_usd.toLocaleString()}`;
  const savingsEl = document.getElementById(`savings-badge-${pkgIndex}`);
  if (savingsEl) {
    savingsEl.innerText = `${typeof t === 'function' ? t('pkg_savings') : 'Savings:'} ${pkg.breakdown.savings_usd.toLocaleString()}`;
  }

  // Update guide sub-tab if open
  const guideTab = document.getElementById(`card-tab-view-${pkgIndex}-guide`);
  if (guideTab) {
    guideTab.innerHTML = `
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
          <i class="fa-solid fa-user-tie text-amber-600 mr-1"></i> Shaxsiy Gid va Xizmat Haqilari
        </span>
      </div>
      ${renderGuideAndServicesView(pkg, pkgIndex)}
    `;
  }
}

// Toggle Flight Service on/off
function toggleFlightService(pkgIndex) {
  const pkg = currentPackages[pkgIndex];
  if (!pkg) return;

  const cb = document.getElementById(`toggle-flight-${pkgIndex}`);
  pkg.breakdown.include_flight = cb.checked;
  recalculatePackageCost(pkg);

  // Update total price display
  document.getElementById(`total-price-${pkgIndex}`).innerText = `$${pkg.breakdown.grand_total_usd.toLocaleString()}`;
  const savingsEl = document.getElementById(`savings-badge-${pkgIndex}`);
  if (savingsEl) {
    savingsEl.innerText = `${typeof t === 'function' ? t('pkg_savings') : 'Savings:'} ${pkg.breakdown.savings_usd.toLocaleString()}`;
  }

  // Update flights sub-tab if open
  const flightsTab = document.getElementById(`card-tab-view-${pkgIndex}-flights`);
  if (flightsTab) {
    const flightOrigin = pkg.flights && pkg.flights.outbound ? pkg.flights.outbound.from_city.split('(')[0].trim() : (pkg.customer_origin || 'Xalqaro');
    flightsTab.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
          <i class="fa-solid fa-plane-departure text-blue-600 mr-1"></i> ${flightOrigin}dan Kelish va Ketish Parvozlari
        </span>
        <span class="text-[11px] text-slate-500 font-semibold">${flightOrigin} ⇄ O'zbekiston</span>
      </div>
      ${renderFlightsView(pkg.flights, pkg.breakdown.include_flight, pkgIndex, pkg.customer_origin)}
    `;
  }
}

// Render Flights Tab
function renderFlightsView(flights, isIncluded, pkgIndex, originName) {
  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);
  if (!flights || !flights.outbound) {
    return `<div class="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400 text-center">${_t('pkg_flight_excluded_msg', 'Flights excluded')}</div>`;
  }

  const fromCityName = flights.outbound.from_city || originName || 'International';

  return `
    <div class="space-y-3">
      <!-- Flight Status Banner -->
      <div class="p-3 ${isIncluded ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-100 border-slate-200 text-slate-600'} border rounded-2xl text-xs flex justify-between items-center">
        <span>
          <i class="fa-solid fa-plane text-blue-600 mr-1.5"></i>
          ${_t('pkg_flight_status_lbl', 'Status:')} <strong>${isIncluded ? _t('pkg_flight_included_msg', 'Roundtrip flights from {origin} included in total').replace('{origin}', fromCityName) : _t('pkg_flight_excluded_msg', 'Flights excluded (Domestic Uzbekistan tour only)')}</strong>
        </span>
        <button onclick="document.getElementById('toggle-flight-${pkgIndex}').click()" class="font-bold underline text-blue-700 text-xs">
          ${isIncluded ? _t('pkg_btn_remove', 'Remove') : _t('pkg_btn_add', 'Add')}
        </button>
      </div>

      <!-- Outbound Flight -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-bold text-slate-900 flex items-center">
            <i class="fa-solid fa-plane-departure text-blue-600 mr-2"></i> ${flights.outbound.airline} (${flights.outbound.flight_number})
          </span>
          <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">${flights.outbound.class_type}</span>
        </div>
        <div class="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
          <div>
            <strong class="text-slate-900 block text-xs">${flights.outbound.departure_time || '10:00'}</strong>
            <span class="text-slate-500">${(flights.outbound.route || '').split('➔')[0] || fromCityName}</span>
          </div>
          <div class="text-center text-[10px] text-slate-400">
            <span>⏱ ${flights.outbound.duration || '6h'}</span>
            <div class="h-0.5 bg-blue-300 w-16 mx-auto my-0.5"></div>
            <span>${_t('pkg_flight_direct', 'Direct Scheduled')}</span>
          </div>
          <div class="text-right">
            <strong class="text-slate-900 block text-xs">${flights.outbound.arrival_time || '18:00'}</strong>
            <span class="text-slate-500">${(flights.outbound.route || '').split('➔')[1] || _t('pkg_uzb', 'Uzbekistan')}</span>
          </div>
        </div>
        <div class="flex justify-between items-center text-[10px] text-slate-500 pt-1">
          <span><i class="fa-solid fa-suitcase-rolling mr-1"></i> ${flights.outbound.baggage || '30 kg'}</span>
          <span class="font-bold text-slate-800">${_t('pkg_flight_ticket', 'Ticket:')} $${flights.outbound.ticket_price_usd || 350}</span>
        </div>
      </div>

      <!-- Return Flight -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-bold text-slate-900 flex items-center">
            <i class="fa-solid fa-plane-arrival text-amber-600 mr-2"></i> ${flights.return.airline || 'Uzbekistan Airways'} (${flights.return.flight_number || 'HY-201'})
          </span>
          <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">${flights.return.class_type || 'Economy Class'}</span>
        </div>
        <div class="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
          <div>
            <strong class="text-slate-900 block text-xs">${flights.return.departure_time || '09:00'}</strong>
            <span class="text-slate-500">${(flights.return.route || '').split('➔')[0] || _t('pkg_uzb', 'Uzbekistan')}</span>
          </div>
          <div class="text-center text-[10px] text-slate-400">
            <span>⏱ ${flights.return.duration || '6h'}</span>
            <div class="h-0.5 bg-blue-300 w-16 mx-auto my-0.5"></div>
            <span>${_t('pkg_flight_direct', 'Direct Scheduled')}</span>
          </div>
          <div class="text-right">
            <strong class="text-slate-900 block text-xs">${flights.return.arrival_time || '17:00'}</strong>
            <span class="text-slate-500">${(flights.return.route || '').split('➔')[1] || fromCityName}</span>
          </div>
        </div>
        <div class="flex justify-between items-center text-[10px] text-slate-500 pt-1">
          <span><i class="fa-solid fa-suitcase-rolling mr-1"></i> ${flights.return.baggage || '30 kg'}</span>
          <span class="font-bold text-slate-800">${_t('pkg_flight_ticket', 'Ticket:')} $${flights.return.ticket_price_usd || 350}</span>
        </div>
      </div>

      <div class="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex justify-between items-center font-bold">
        <span>${_t('pkg_flight_roundtrip_total', 'Roundtrip Flight Total:')}</span>
        <span class="text-sm text-blue-700">${flights.roundtrip_total} USD</span>
      </div>
    </div>
  `;
}

// Render Guide and Services Tab
function renderGuideAndServicesView(pkg, pkgIndex) {
  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);
  const g = pkg.assigned_guide;
  const isGuideOn = pkg.breakdown.include_guide;
  const guidePhoto = g.image_url || g.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  return `
    <div class="space-y-3 text-xs">
      <!-- Assigned Guide Card -->
      <div class="p-3.5 bg-slate-50 border ${isGuideOn ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'} rounded-2xl space-y-2">
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            <img
              src="${guidePhoto}"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';"
              class="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-sm flex-shrink-0"
              alt="${g.name}"
            >
            <div>
              <h5 class="font-bold text-slate-900 text-sm flex items-center">
                ${g.name}
                <span class="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">${_t('pkg_guide_certified', '✓ Certified')}</span>
              </h5>
              <span class="text-[11px] text-amber-700 font-semibold"><i class="fa-solid fa-language mr-1"></i> ${g.languages}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-amber-500 font-bold text-xs"><i class="fa-solid fa-star mr-0.5"></i> ${g.rating || '4.95'}</span>
            <span class="text-[10px] text-slate-400 block">${g.license_number || 'UZB-CERTIFIED'}</span>
          </div>
        </div>

        <p class="text-[11px] text-slate-600 leading-relaxed">${g.bio || 'International Silk Road certified tour guide.'}</p>

        <div class="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px]">
          <span>${_t('pkg_guide_rate_lbl', 'Guide daily rate:')} <strong>${g.daily_rate_usd || 50}/${_t('pkg_day_word', 'day')}</strong> (${pkg.duration_days} ${_t('pkg_day_word', 'days')} = <strong>${pkg.breakdown.guide_total}</strong>)</span>
          <button onclick="document.getElementById('toggle-guide-${pkgIndex}').click()" class="font-bold underline text-amber-800">
            ${isGuideOn ? _t('pkg_guide_remove_btn', 'Remove guide') : _t('pkg_guide_add_btn', 'Add guide')}
          </button>
        </div>
      </div>

      <!-- Transportation & Chauffeur -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
        <div class="flex justify-between items-center">
          <span class="font-bold text-slate-900 flex items-center">
            <i class="fa-solid fa-car-side text-purple-600 mr-2"></i> ${_t('pkg_vip_car_title', 'Private Air-Conditioned VIP Transport & Chauffeur')}
          </span>
          <span class="font-bold text-slate-900">$${pkg.breakdown.daily_transport_total}</span>
        </div>
        <p class="text-[11px] text-slate-600">
          ${_t('pkg_vip_car_desc', 'Full-trip fuel, city transfers, airport greetings, and dedicated driver included.')} (${pkg.duration_days} ${_t('pkg_day_word', 'days')} @ $${pkg.breakdown.daily_transport_rate}/${_t('pkg_day_word', 'day')})
        </p>
      </div>

      <!-- Daily Meals Breakdown -->
      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
        <div class="flex justify-between items-center">
          <span class="font-bold text-slate-900 flex items-center">
            <i class="fa-solid fa-utensils text-green-600 mr-2"></i> ${_t('pkg_dining_title', 'Daily Dining & Meal Estimation')}
          </span>
          <span class="font-bold text-slate-900">$${pkg.breakdown.meals_est_total}</span>
        </div>
        <p class="text-[11px] text-slate-600">
          ${_t('pkg_dining_desc', '• Breakfast: Rich buffet at partner hotels (included)<br>• Lunch & Dinner: Authentic Uzbek plov, kebabs, somsa & salads ($35/day).')}
        </p>
      </div>

      <!-- Taxes and Agency Fee -->
      <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-[11px]">
        <div class="flex justify-between items-center text-slate-700">
          <span><i class="fa-solid fa-landmark mr-1.5 text-slate-400"></i> ${_t('pkg_state_tax', 'City Tourist Tax ($3/night):')}</span>
          <strong>$${pkg.breakdown.state_tourist_tax}</strong>
        </div>
        <div class="flex justify-between items-center text-slate-700">
          <span><i class="fa-solid fa-handshake mr-1.5 text-slate-400"></i> ${_t('pkg_agency_fee', 'Agency Service Fee & 24/7 Coordinator:')}</span>
          <strong>$${pkg.breakdown.agency_service_fee}</strong>
        </div>
      </div>
    </div>
  `;
}

// Days Accordion HTML Generator with Timeline
function renderDaysAccordion(days, pkgIndex) {
  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);
  const curLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'en';

  return days.map((d, dIdx) => {
    const isFirst = dIdx === 0;
    const localizedTitle = localizeDayTitle(d, days.length);
    const timelineHtml = (d.timeline || []).map((tItem, tIdx) => {
      // Localize item using multi-language engine
      const item = (typeof localizeTimelineItem === 'function')
        ? localizeTimelineItem(tItem, curLang)
        : tItem;

      let iconColor = 'bg-blue-100 text-blue-700';
      if (item.category === 'meal') iconColor = 'bg-green-100 text-green-700';
      if (item.category === 'transport') iconColor = 'bg-purple-100 text-purple-700';
      if (item.category === 'hotel') iconColor = 'bg-amber-100 text-amber-700';
      if (item.category === 'shopping') iconColor = 'bg-rose-100 text-rose-700';

      const durStr = item.duration || '1 hour';
      const transStr = item.transport || _t('pkg_walking', 'Walking');

      return `
        <div class="timeline-item flex items-start space-x-3 mb-4 last:mb-0 relative">
          <!-- Time & Icon Node -->
          <div class="timeline-node w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center text-xs flex-shrink-0 shadow-sm border border-white">
            <i class="fa-solid ${item.icon || 'fa-location-dot'}"></i>
          </div>

          <!-- Content Details -->
          <div class="flex-1 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition-colors">
            <div class="flex flex-wrap justify-between items-center gap-1 mb-1">
              <span class="font-mono text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <i class="fa-solid fa-clock text-[10px] mr-1"></i> ${item.time}
              </span>
              <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                ⏱ ${durStr}
              </span>
            </div>

            <h5 class="font-bold text-slate-900 text-xs sm:text-sm mb-1">${item.title}</h5>
            <div class="text-[11px] text-blue-700 font-medium mb-1.5 flex items-center">
              <i class="fa-solid fa-map-pin mr-1 text-slate-400"></i> ${item.location}
            </div>

            <p class="text-xs text-slate-600 leading-relaxed mb-2">${item.description}</p>

            <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
              <span><i class="fa-solid fa-car-side text-slate-400 mr-1"></i> ${transStr}</span>
              <span class="text-green-700 font-semibold ml-auto"><i class="fa-solid fa-check-circle mr-1"></i> ${_t('pkg_day_included_badge', 'Included in program')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
        <button
          onclick="toggleDayAccordion(${pkgIndex}, ${dIdx})"
          class="w-full p-3.5 text-left font-bold text-xs sm:text-sm text-slate-900 flex justify-between items-center hover:bg-slate-100/70 transition-colors"
        >
          <div class="flex items-center space-x-2.5">
            <span class="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-mono">
              ${d.day_number}
            </span>
            <span>${localizedTitle}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-[11px] text-slate-400 font-normal hidden sm:inline">${d.date}</span>
            <i id="accordion-arrow-${pkgIndex}-${dIdx}" class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform ${isFirst ? 'rotate-180' : ''}"></i>
          </div>
        </button>

        <div id="accordion-body-${pkgIndex}-${dIdx}" class="p-4 bg-white border-t border-slate-200 timeline-stem ${isFirst ? '' : 'hidden'}">
          ${timelineHtml}
        </div>
      </div>
    `;
  }).join('');
}

function toggleDayAccordion(pkgIndex, dayIndex) {
  const body = document.getElementById(`accordion-body-${pkgIndex}-${dayIndex}`);
  const arrow = document.getElementById(`accordion-arrow-${pkgIndex}-${dayIndex}`);
  if (body.classList.contains('hidden')) {
    body.classList.remove('hidden');
    arrow.classList.add('rotate-180');
  } else {
    body.classList.add('hidden');
    arrow.classList.remove('rotate-180');
  }
}

// Hotels with Interactive Room Type Switcher
function renderHotelsWithRoomSwitcher(hotels, pkgIndex) {
  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);
  return hotels.map((h, hIdx) => {
    const starsHtml = '★'.repeat(h.stars) + '☆'.repeat(5 - h.stars);

    const defaultHotelImg = (h.city || '').toLowerCase().includes('samarkand') ? 'images/samarkand_registan.jpg' :
                            (h.city || '').toLowerCase().includes('bukhara') ? 'images/bukhara_kalyan.jpg' :
                            (h.city || '').toLowerCase().includes('khiva') ? 'images/khiva_itchankala.jpg' :
                            'images/tashkent_chorsu.jpg';
    const hotelImgSrc = h.image_url || defaultHotelImg;

    // Render interactive room pills
    const roomsHtml = (h.available_rooms || []).map(r => {
      const isSelected = r.room_name === h.room_name;
      return `
        <div
          onclick="switchRoomType(${pkgIndex}, ${hIdx}, ${r.id}, '${r.room_name}', ${r.price_per_night_usd})"
          class="room-picker-pill p-2.5 rounded-xl border text-xs flex justify-between items-center ${isSelected ? 'active border-amber-500 bg-amber-50 font-bold' : 'border-slate-200 bg-white hover:border-slate-300'}"
        >
          <div>
            <span class="block text-slate-900">${r.room_name}</span>
            <span class="text-[10px] text-slate-500">${r.description || (r.capacity + ' guests')}</span>
          </div>
          <div class="text-right">
            <span class="font-bold text-amber-700 text-xs">${r.price_per_night_usd} / ${_t('pkg_per_night', 'night')}</span>
            ${isSelected ? `<span class="text-[10px] text-green-700 block font-semibold">${_t('pkg_room_selected', '✓ Selected')}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3">
        <div class="flex items-center space-x-3">
          <img
            src="${hotelImgSrc}"
            onerror="this.onerror=null; this.src='${defaultHotelImg}';"
            alt="${h.hotel_name}"
            class="w-16 h-16 rounded-xl object-cover border border-amber-300/40 shadow-sm flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <h5 class="font-bold text-slate-900 text-sm truncate">${h.hotel_name}</h5>
              <span class="text-amber-500 font-bold text-sm ml-2 flex-shrink-0">${starsHtml}</span>
            </div>
            <span class="text-[11px] text-slate-500 block truncate"><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${h.city} • ${h.address}</span>
          </div>
        </div>

        <div class="flex justify-between items-center text-[11px] bg-blue-50/70 p-2 rounded-lg text-blue-900 border border-blue-100">
          <span><i class="fa-solid fa-calendar-check mr-1"></i> ${h.nights} ${_t('pkg_per_night', 'nights')} (${h.check_in} — ${h.check_out})</span>
          <span>${_t('pkg_hotel_total', 'Total:')} <strong id="hotel-cost-${pkgIndex}-${hIdx}">${h.total_cost}</strong></span>
        </div>

        <!-- Room selection -->
        <div class="space-y-1.5">
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">${_t('pkg_rooms_avail', 'Available Room Categories:')}</label>
          ${roomsHtml || '<p class="text-slate-400 italic">Standard</p>'}
        </div>
      </div>
    `;
  }).join('');
}

// Live Room Switcher
function switchRoomType(pkgIndex, hotelIndex, roomId, roomName, pricePerNight) {
  const pkg = currentPackages[pkgIndex];
  if (!pkg || !pkg.hotels[hotelIndex]) return;

  const hotel = pkg.hotels[hotelIndex];
  hotel.room_name = roomName;
  hotel.room_id = roomId;
  hotel.price_per_night = pricePerNight;
  hotel.total_cost = pricePerNight * hotel.nights;

  // Recalculate package totals
  let newHotelsTotal = 0;
  pkg.hotels.forEach(h => newHotelsTotal += h.total_cost);
  pkg.breakdown.hotels_total = newHotelsTotal;
  recalculatePackageCost(pkg);

  // Update UI live
  document.getElementById(`total-price-${pkgIndex}`).innerText = `$${pkg.breakdown.grand_total_usd.toLocaleString()}`;
  document.getElementById(`hotels-cost-${pkgIndex}`).innerText = `$${pkg.breakdown.hotels_total}`;
  const savingsEl = document.getElementById(`savings-badge-${pkgIndex}`);
  if (savingsEl) savingsEl.innerText = `${typeof t === 'function' ? t('pkg_savings') : 'Savings:'} ${pkg.breakdown.savings_usd.toLocaleString()}`;

  // Re-render hotels sub-tab
  document.getElementById(`hotels-room-picker-${pkgIndex}`).innerHTML = renderHotelsWithRoomSwitcher(pkg.hotels, pkgIndex);
}

// Render Train Cards
function renderTrainCards(trains) {
  const _t = (k, fb) => (typeof t === 'function' ? t(k, fb) : fb);
  if (!trains || trains.length === 0) {
    return `<div class="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400 text-center">${_t('pkg_train_no_need', 'No intercity train needed within this destination')}</div>`;
  }

  return trains.map(tTrain => `
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2.5">
      <div class="flex justify-between items-center">
        <span class="font-bold text-slate-900 text-sm flex items-center">
          <i class="fa-solid fa-train text-amber-600 mr-2"></i> ${tTrain.train_name} (${tTrain.train_number})
        </span>
        <span class="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
          ${tTrain.seat_class}
        </span>
      </div>

      <!-- Route visualization bar -->
      <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <div class="text-left">
          <span class="font-bold text-slate-900 text-sm block">${tTrain.departure_time}</span>
          <span class="text-[11px] text-slate-500 font-semibold">${tTrain.from_city}</span>
        </div>

        <div class="flex-1 px-4 text-center">
          <span class="text-[10px] text-slate-400 block">${tTrain.duration}</span>
          <div class="h-0.5 bg-blue-300 relative my-1">
            <i class="fa-solid fa-train absolute -top-2 left-1/2 -translate-x-1/2 text-blue-600 text-xs bg-white px-1"></i>
          </div>
          <span class="text-[10px] text-green-700 font-semibold">${_t('pkg_train_bullet', 'High-Speed Rail')}</span>
        </div>

        <div class="text-right">
          <span class="font-bold text-slate-900 text-sm block">${tTrain.arrival_time}</span>
          <span class="text-[11px] text-slate-500 font-semibold">${tTrain.to_city}</span>
        </div>
      </div>

      <div class="flex justify-between items-center text-[11px] text-slate-600 pt-1">
        <span>${_t('pkg_train_date', 'Date:')} <strong>${tTrain.travel_date}</strong></span>
        <span class="text-slate-900 font-bold">${_t('pkg_train_price', 'Ticket price:')} ${tTrain.ticket_price_usd}</span>
      </div>
    </div>
  `).join('');
}

// Copy Tour ID helper
function copyTourId(code) {
  navigator.clipboard.writeText(code).then(() => {
    alert((typeof t === 'function' ? t('copied_alert') : 'Tour ID copied!') + `\n${code}`);
  });
}

// Print / Download Tour Voucher
function printTourVoucher(pkgIndex) {
  const pkg = currentPackages[pkgIndex];
  if (!pkg) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Official Travel Voucher - ${pkg.tour_code}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; }
        .header { border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 20px; }
        .tour-code { font-family: monospace; font-size: 18px; color: #0284c7; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f8fafc; font-weight: bold; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${currentAgency ? currentAgency.name : 'Silk Road — by M.S'}</h2>
        <p>Litsenziya: ${currentAgency ? currentAgency.license_no : 'T-UZB-2024-8841'} • Tel: ${currentAgency ? currentAgency.phone : '+998 71 200 45 45'}</p>
        <p class="tour-code">TOUR VOUCHER ID: ${pkg.tour_code}</p>
      </div>
      <h3>${pkg.package_title} (${pkg.duration_days} Kun)</h3>
      <p><strong>Marshrut:</strong> ${pkg.cities}</p>
      <p><strong>Umumiy Xarajat:</strong> $${pkg.breakdown.grand_total_usd.toLocaleString()} USD</p>
      <h4>Hamkor Mehmonxonalar:</h4>
      <ul>
        ${pkg.hotels.map(h => `<li><strong>${h.hotel_name} (${h.stars}★)</strong>: ${h.room_name} - ${h.nights} kecha (${h.check_in} to ${h.check_out})</li>`).join('')}
      </ul>
      <h4>Poyezdlar va Parvozlar:</h4>
      <ul>
        ${pkg.trains.map(t => `<li>${t.train_name} (${t.train_number}): ${t.from_city} -> ${t.to_city} [${t.travel_date} ${t.departure_time}]</li>`).join('')}
        ${pkg.breakdown.include_flight && pkg.flights.outbound ? `<li>Xalqaro Parvoz: ${pkg.flights.outbound.airline} (${pkg.flights.outbound.flight_number}) ${pkg.flights.outbound.route}</li>` : ''}
      </ul>
      <div class="footer">
        <p>Ushbu sayohat hujjati Silk Road — by M.S rasmiy operatori tomonidan tasdiqlangan.</p>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// Open Booking Inquiry Modal ("Adminga Murojaat Qilish")
function openBookingModal(packageIndex) {
  const pkg = currentPackages[packageIndex];
  if (!pkg) return;
  selectedPackageForBooking = pkg;

  document.getElementById('modalPackageTitle').innerText = pkg.package_title;
  document.getElementById('modalTourCode').innerText = pkg.tour_code;
  document.getElementById('modalTotalPrice').innerText = `$${pkg.breakdown.grand_total_usd.toLocaleString()} USD`;
  document.getElementById('modalCities').innerText = pkg.cities;

  const summaryEl = document.getElementById('modalHotelsSummary');
  if (summaryEl && pkg.hotels) {
    summaryEl.innerHTML = `
      ${pkg.hotels.map(h => `
        <div class="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
          <span><strong>${h.hotel_name}</strong> (${h.city})</span>
          <span class="text-amber-700 font-bold">${h.room_name} ($${h.price_per_night}/n)</span>
        </div>
      `).join('')}
      <div class="flex justify-between items-center bg-blue-50 p-1.5 rounded border border-blue-200 mt-1">
        <span>${typeof t === 'function' ? t('pkg_guide_service') : 'Guide Service:'}</span>
        <strong>${pkg.breakdown.include_guide ? (typeof t === 'function' ? t('pkg_day_included_badge') : 'Included') + ' (' + (pkg.assigned_guide ? pkg.assigned_guide.name : 'Guide') + ')' : (typeof t === 'function' ? t('pkg_flight_excluded_msg') : 'Excluded')}</strong>
      </div>
      <div class="flex justify-between items-center bg-blue-50 p-1.5 rounded border border-blue-200">
        <span>${typeof t === 'function' ? t('pkg_flight_header') : 'Flight:'}</span>
        <strong>${pkg.breakdown.include_flight ? (typeof t === 'function' ? t('pkg_day_included_badge') : 'Included') + ' (' + (pkg.flights && pkg.flights.outbound ? pkg.flights.outbound.from_city.split('(')[0].trim() : 'Roundtrip') + ')' : (typeof t === 'function' ? t('pkg_flight_excluded_msg') : 'Excluded')}</strong>
      </div>
    `;
  }

  if (document.getElementById('wizardOrigin')) {
    document.getElementById('bookCountry').value = document.getElementById('wizardOrigin').value || pkg.customer_origin || '';
  }

  const modal = document.getElementById('bookingModal');
  modal.classList.remove('hidden');
}

function closeBookingModal() {
  document.getElementById('bookingModal').classList.add('hidden');
}

// Handle Booking Form Submit
async function handleBookingSubmit(e) {
  e.preventDefault();
  if (!selectedPackageForBooking) return;

  const btn = document.getElementById('bookSubmitBtn');
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Yuborilmoqda...`;

  const payload = {
    tour_code: selectedPackageForBooking.tour_code,
    selected_package_title: selectedPackageForBooking.package_title,
    total_price_usd: selectedPackageForBooking.breakdown.grand_total_usd,
    customer_name: document.getElementById('bookName').value.trim(),
    customer_country: document.getElementById('bookCountry').value.trim(),
    customer_email: document.getElementById('bookEmail').value.trim(),
    customer_phone: document.getElementById('bookPhone').value.trim(),
    customer_whatsapp: document.getElementById('bookPhone').value.trim(),
    start_date: selectedPackageForBooking.start_date,
    number_of_travelers: parseInt(document.getElementById('bookTravelers').value || 1, 10),
    special_requests: document.getElementById('bookRequests').value.trim(),
    itinerary: selectedPackageForBooking
  };

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      closeBookingModal();

      const whatsappMsg = encodeURIComponent(
        `Hello! I just submitted a tour inquiry for ${payload.selected_package_title} (Tour ID: ${payload.tour_code}). My name is ${payload.customer_name}. Total: $${payload.total_price_usd} USD.`
      );
      const whatsappUrl = currentAgency && currentAgency.whatsapp
        ? `https://wa.me/${currentAgency.whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`
        : null;

      const successMsg = typeof t === 'function' 
        ? t('inquiry_success') 
        : 'Your inquiry has been successfully submitted! Our manager will contact you shortly.';

      alert(`✅ ${successMsg}\n\nTour ID: ${data.tour_code}\nTotal: $${payload.total_price_usd} USD`);

      if (whatsappUrl) {
        if (confirm("WhatsApp orqali operatorimiz bilan to'g'ridan-to'g'ri bog'lanishni xohlaysizmi? / Connect directly via WhatsApp?")) {
          window.open(whatsappUrl, '_blank');
        }
      }
    } else {
      alert(`Xatolik: ${data.error}`);
    }
  } catch (err) {
    alert('Server bilan bog\'lanishda xatolik yuz berdi.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = origText;
  }
}

// Agency Modal
function openAgencyModal() {
  document.getElementById('agencyModal').classList.remove('hidden');
}
function closeAgencyModal() {
  document.getElementById('agencyModal').classList.add('hidden');
}
