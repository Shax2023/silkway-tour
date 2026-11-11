const db = require('./db');

/**
 * AI Tour Planning Engine for SilkWay Uzbekistan Travel
 * Operates for international tourists with dynamic database-backed partner hotels and trains.
 */

// Generate a random unique Tour Code (e.g. UZB-2026-A82F)
function generateTourCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `UZB-2026-${rand}`;
}

// Extract tourist requirements from text (Rule-based NLP & intent extraction)
function extractTravelerDetails(message) {
  const lower = message.toLowerCase();

  // Extract budget
  let budget = null;
  const budgetMatches = message.match(/(?:\$|usd|dollar|dollor|budjet|budget)?\s*([0-9]{3,5})\s*(?:\$|usd|dollar|dollor)?/i);
  if (budgetMatches && budgetMatches[1]) {
    const num = parseInt(budgetMatches[1], 10);
    if (num >= 300 && num <= 50000) {
      budget = num;
    }
  }

  // Extract duration (days)
  let days = 7; // default
  const dayMatches = message.match(/(\d{1,2})\s*(?:kun|day|kunda|kunga|days)/i);
  if (dayMatches && dayMatches[1]) {
    days = parseInt(dayMatches[1], 10);
    if (days < 2) days = 3;
    if (days > 30) days = 30;
  }

  // Extract cities mentioned
  const cityAliases = {
    'Tashkent': ['toshkent', 'tashkent', 'tash'],
    'Samarkand': ['samarqand', 'samarkand', 'samarkant'],
    'Bukhara': ['buxoro', 'bukhara', 'buxara'],
    'Khiva': ['xiva', 'khiva', 'hiva']
  };

  const detectedCities = [];
  for (const [canonicalCity, aliases] of Object.entries(cityAliases)) {
    for (const alias of aliases) {
      if (lower.includes(alias) && !detectedCities.includes(canonicalCity)) {
        detectedCities.push(canonicalCity);
        break;
      }
    }
  }

  // If no cities mentioned, default to classic Golden Silk Road trio
  const cities = detectedCities.length > 0 ? detectedCities : ['Tashkent', 'Samarkand', 'Bukhara'];

  // Extract country / origin (supports English, Uzbek, Turkish, Russian, etc.)
  const countryPatterns = [
    { name: 'Germany', regex: /(germany|germaniy|deutschland|almaniya|berlin|frankfurt|munich|myunxen|германи|берлин|франкфурт|мюнхен)/i },
    { name: 'United Kingdom', regex: /(uk|united kingdom|britain|england|angliya|britaniya|london|великобритани|англи|лондон)/i },
    { name: 'United States', regex: /(usa|united states|america|aqsh|amerika|new york|сша|америк|нью-йорк)/i },
    { name: 'France', regex: /(france|fransiya|french|paris|франци|париж)/i },
    { name: 'Italy', regex: /(italy|italiya|italia|rome|rim|milan|итали|рим|милан)/i },
    { name: 'Spain', regex: /(spain|ispaniya|espana|madrid|barcelona|испани|мадрид)/i },
    { name: 'UAE', regex: /(uae|dubai|dubay|amirlik|оаэ|дуба[йи])/i },
    { name: 'Turkey', regex: /(turkey|t[uü]rkiy[ea]|istanbul|ankara|турци|стамбул)/i },
    { name: 'Russia', regex: /(russia|rossiya|moscow|moskva|росси|москв|петербург)/i },
    { name: 'South Korea', regex: /(korea|koreya|south korea|seoul|коре|сеул)/i },
    { name: 'Japan', regex: /(japan|yaponiya|nippon|tokyo|япони|токио)/i },
    { name: 'China', regex: /(china|xitoy|zhongguo|beijing|pekin|кита|пекин)/i },
    { name: 'India', regex: /(india|hindiston|delhi|инди|дели)/i },
    { name: 'Kazakhstan', regex: /(kazakhstan|qozogiston|almaty|astana|казахстан|алмат|астан)/i },
    { name: 'Canada', regex: /(canada|kanada|toronto|канада)/i },
    { name: 'Australia', regex: /(australia|avstraliya|sydney|австрали)/i },
    { name: 'Poland', regex: /(poland|polsha|varshava|warsaw|польш|варшав)/i },
    { name: 'Netherlands', regex: /(netherlands|gollandiya|holland|amsterdam|нидерланд|голланди)/i },
    { name: 'Switzerland', regex: /(switzerland|shveysariya|zurich|швейцари)/i },
    { name: 'Singapore', regex: /(singapore|singapur|сингапур)/i },
    { name: 'Malaysia', regex: /(malaysia|malayziya|kuala lumpur|малайзи)/i }
  ];

  let origin = null;
  for (const item of countryPatterns) {
    if (item.regex.test(message)) {
      origin = item.name;
      break;
    }
  }

  if (!origin) {
    const fromMatch = message.match(/(?:from|davlatidan|shahridan)\s+([A-Za-zÀ-ÿ]+)/i) ||
                      message.match(/([A-Za-zÀ-ÿ]+)(?:dan|lik|likmiz)\s+(?:kelmoqchi|kelamiz|bormoqchi|uchmoqchi)/i);
    if (fromMatch && fromMatch[1]) {
      const candidate = fromMatch[1].trim();
      const skipWords = ['biz', 'toshkent', 'samarqand', 'buxoro', 'xiva', 'tashkent', 'bugun', 'ertalab', 'kechki', 'yozda'];
      if (!skipWords.includes(candidate.toLowerCase()) && candidate.length > 2) {
        origin = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
  }

  return {
    budget,
    durationDays: days,
    cities,
    origin: origin || 'International Traveler'
  };
}

/**
 * Build 3 tailored tour packages based on customer budget and cities
 * Package 1: "Comfort & Cultural" (4-Star hotels, Business/Comfort trains)
 * Package 2: "Luxury Silk Road Heritage" (5-Star / Top Boutique hotels, VIP trains)
 * Package 3: "Smart Budget Discovery" (3-Star authentic hotels, Economy trains)
 */
function buildTourPackages(customerOrigin, cities, budget, durationDays, startDateStr, options = {}) {
  // Normalize dates
  const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() + 14 * 24 * 3600 * 1000); // 2 weeks ahead

  // Ensure cities start with Tashkent if possible (major international hub)
  const orderedCities = [...cities];
  if (orderedCities.includes('Tashkent') && orderedCities[0] !== 'Tashkent') {
    const idx = orderedCities.indexOf('Tashkent');
    orderedCities.splice(idx, 1);
    orderedCities.unshift('Tashkent');
  }

  // Packages configuration
  const packageConfigs = [
    {
      id: 'comfort',
      title: 'Silk Road Heritage & Comfort',
      tagline: 'Best balance of 4-star comfort, high-speed rail, and iconic historical charm',
      badge: 'Most Popular',
      preferredStars: [4, 3],
      trainClass: 'business',
      dailyMealsEst: 35,
      guideTicketsEstPerDay: 25
    },
    {
      id: 'luxury',
      title: 'Silk Road Royal Deluxe',
      tagline: '5-star premier hospitality, private suites, and VIP Afrosiyob rail travel',
      badge: 'Luxury Experience',
      preferredStars: [5, 4],
      trainClass: 'vip',
      dailyMealsEst: 65,
      guideTicketsEstPerDay: 45
    },
    {
      id: 'budget',
      title: 'Smart Silk Road Explorer',
      tagline: 'Charming authentic 3-star boutique guest houses and cost-effective rail',
      badge: 'Best Value',
      preferredStars: [3, 4],
      trainClass: 'economy',
      dailyMealsEst: 22,
      guideTicketsEstPerDay: 15
    }
  ];

  // Distribute days across cities
  const cityStays = distributeDays(orderedCities, durationDays);

  const packages = packageConfigs.map(config => {
    return generateSinglePackage(config, customerOrigin, orderedCities, cityStays, budget, durationDays, startDate, options);
  });

  return packages;
}

/**
 * Generate highly detailed hour-by-hour timeline for each day of the tour
 */
function generateDailyDetailedSchedule(city, dayNum, totalDays, isFirstDay, isLastDay, trainOnThisDay, hotelName, roomType) {
  const schedule = [];

  // Departure Day
  if (isLastDay) {
    return [
      {
        activity_id: "hotel_buffet_breakfast",
        time: "08:30 - 09:45",
        title: "Mehmonxonada to'yimli bufet nonushtasi",
        location: `${hotelName} restorani`,
        icon: "fa-mug-saucer",
        category: "meal",
        duration: "1 soat 15 daqiqa",
        description: "Issiq qahva, tog' giyohlari damlamasi, milliy qandolatlar, yangi uzilgan uzum va anjir hamda yevropacha nonushta menyusi.",
        transport: "Piyoda mehmonxona ichida",
        cost_included: true
      },
      {
        activity_id: "souvenir_shopping",
        time: "10:00 - 11:45",
        title: "Esdalik sovg'alari (Suvenirlar) xaridi va Sharq bozori",
        location: `${city} qadimiy markaziy bozori`,
        icon: "fa-bag-shopping",
        category: "shopping",
        duration: "1 soat 45 daqiqa",
        description: "Haqiqiy Marg'ilon ipak ro'mollari, qo'lda tikilgan nafis ipak suzanilar, Rishton sopol likopchalari, qovun qoqisi, pista va qandolatlar xaridi.",
        transport: "Konditsionerli qulay transportda 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "hotel_checkout",
        time: "12:00 - 12:30",
        title: "Mehmonxonadan rasmiy chiqish (Check-out)",
        location: hotelName,
        icon: "fa-bell-concierge",
        category: "hotel",
        duration: "30 daqiqa",
        description: "Hisob-kitob, xonani topshirish va yuklarni shaxsiy avtomashinaga xavfsiz joylashtirish.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "farewell_lunch",
        time: "12:45 - 14:00",
        title: "Xayrlashuv shohona tushligi",
        location: `${city} nufuzli milliy restorani`,
        icon: "fa-utensils",
        category: "meal",
        duration: "1 soat 15 daqiqa",
        description: "O'zbek mehmondo'stligining eng sara taomlari: tender jizza kabob, yangi tandir noni va maxsus o'tli choy.",
        transport: "Mashinada 10 daqiqa",
        cost_included: true
      },
      {
        activity_id: "airport_departure",
        time: "14:15 - 15:30",
        title: "Xalqaro Aeroportga shaxsiy VIP transfer",
        location: `${city} Xalqaro Aeroporti`,
        icon: "fa-plane-departure",
        category: "transport",
        duration: "1 soat 15 daqiqa",
        description: "Parvozingizdan 3 soat oldin aeroportga xavfsiz yetib kelish, yuklarni ro'yxatdan o'tkazishda yordam va iliq xayrlashuv.",
        transport: "Shaxsiy konditsionerli VIP avtomobil",
        cost_included: true
      }
    ];
  }

  // Arrival Day (Day 1)
  if (isFirstDay) {
    return [
      {
        activity_id: "arr_airport",
        time: "08:30 - 09:30",
        title: "Aeroportda kutib olish va VIP kutubxona xizmati",
        location: `${city} Xalqaro Aeroporti (Terminal 2)`,
        icon: "fa-plane-arrival",
        category: "transfer",
        duration: "1 soat",
        description: "Shaxsiy haydovchi va ingliz/rus tilli tajribali gid aeroportda sayyoh ismi yozilgan tablitchka bilan kutib oladi. Valyuta ayirboshlash va mahalliy SIM-karta olishda ko'maklashiladi.",
        transport: "Konditsionerli qulay avtomashina",
        cost_included: true
      },
      {
        activity_id: "arr_hotel_checkin",
        time: "09:45 - 10:30",
        title: "Mehmonxonaga transfer va xonaga joylashish (Check-in)",
        location: hotelName,
        icon: "fa-hotel",
        category: "hotel",
        duration: "45 daqiqa",
        description: `Shartnomali ${hotelName} mehmonxonasiga tezkor ro'yxatga olish, ${roomType} xonasiga joylashish, dush qabul qilish va 30 daqiqa hordiq chiqarish.`,
        transport: "Avtomashinada 20 daqiqa",
        cost_included: true
      },
      {
        activity_id: "hazrati_imom",
        time: "10:45 - 12:45",
        title: "Hazrati Imom (Xastimom) majmuasi va Muqaddas Usmon Qur'oni",
        location: "Qadimiy Toshkent, Olmazor tumani",
        icon: "fa-mosque",
        category: "sightseeing",
        duration: "2 soat",
        description: "VII asrga oid kiyik terisiga yozilgan dunyodagi eng qadimiy Usmon Qur'oni saqlanadigan Mo'yi Muborak madrasasi, Qaffol Shoshiy maqbarasi va Baroqxon madrasasi bo'ylab chuqur tarixiy ekskursiya.",
        transport: "Shaxsiy avtomashinada 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "besh_qozon",
        time: "13:00 - 14:15",
        title: "Milliy Tushlik: \"Besh Qozon\" Markaziy Osiyo Palov Markazi",
        location: "Toshkent Teleminorasi yaqinida",
        icon: "fa-utensils",
        category: "meal",
        duration: "1 soat 15 daqiqa",
        description: "Ulkan cho'yan qozonlarda damlangan mashhur Toshkent to'y palovi, bedana tuxumlari, kazy va qazi-qarta hamda achchiq-chuchuk salati bilan.",
        transport: "Mashinada 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "chorsu_bazaar",
        time: "14:30 - 16:00",
        title: "Chorsu Sharq Bozorida rang-barang an'anaviy sayr",
        location: "Eski Shahar markazi",
        icon: "fa-store",
        category: "sightseeing",
        duration: "1 soat 30 daqiqa",
        description: "Ushbu afsonaviy gumbaz ostidagi ziravorlar rastalari, quruq mevalar (bodom, yong'oq, mayiz), kulolchilik va o'zbek milliy do'ppilari namoyishi.",
        transport: "Mashinada 10 daqiqa",
        cost_included: true
      },
      {
        activity_id: "tashkent_metro",
        time: "16:15 - 17:30",
        title: "Toshkent Metropoliteni me'moriy durdonalari sayohati",
        location: "Alisher Navoi, Kosmonavtlar va Mustaqillik bekatlari",
        icon: "fa-train-subway",
        category: "sightseeing",
        duration: "1 soat 15 daqiqa",
        description: "Har biri alohida yerosti muzeyini eslatuvchi marmar va billur qandillar bilan bezatilgan go'zal metro bekatlari bo'ylab qisqa ekskursiya.",
        transport: "Metro va piyoda",
        cost_included: true
      },
      {
        activity_id: "broadway_walk",
        time: "17:45 - 19:15",
        title: "Amir Temur Xiyoboni va Sayilgoh (Broadway) ko'chasi",
        location: "Toshkent markaziy maydoni",
        icon: "fa-monument",
        category: "leisure",
        duration: "1 soat 30 daqiqa",
        description: "Sohibqiron Amir Temur haykali, afsonaviy Toshkent Kurantlari va ko'cha rassomlari ijod qiladigan Sayilgoh xiyobonida yoqimli oqshom sayri.",
        transport: "Piyoda sayr",
        cost_included: true
      },
      {
        activity_id: "welcome_dinner",
        time: "19:30 - 21:30",
        title: "Xush kelibsiz (Welcome Dinner) tantanali kechki ovqati",
        location: "Nufuzli milliy o'zbek restorani",
        icon: "fa-utensils",
        category: "meal",
        duration: "2 soat",
        description: "Shohona milliy shashliklar assortisi, dimlama, issiq tandir kulchalari va jonli sharqona musiqa sadolari ostida hordiq.",
        transport: "Mashinada 10 daqiqa, so'ngra mehmonxonaga qaytish",
        cost_included: true
      }
    ];
  }

  // Intercity Train Transfer Day (e.g. Tashkent to Samarkand or Samarkand to Bukhara)
  if (trainOnThisDay) {
    const t = trainOnThisDay;
    return [
      {
        activity_id: "train_morning_checkout",
        time: "06:30 - 07:15",
        title: "Ertalabki nonushta va mehmonxonadan chiqish",
        location: hotelName,
        icon: "fa-mug-saucer",
        category: "hotel",
        duration: "45 daqiqa",
        description: "Tezkor nonushta yoki yo'l uchun maxsus qadoqlangan nonushta qutisi (Breakfast Box). Yuklarni topshirib vokzalga yo'l olish.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "train_station_depart",
        time: "07:15 - 07:30",
        title: "Temir yo'l vokzalida VIP kutib olish va xavfsizlik nazorati",
        location: `${t.from_city} Markaziy Temir Yo'l Vokzali`,
        icon: "fa-ticket",
        category: "transfer",
        duration: "15 daqiqa",
        description: "Gid yordamida tezkor pasport va chipta nazoratidan o'tish, qulay perrondan tezyurar poyezd vagoniga joylashish.",
        transport: "Shaxsiy mikroavtobusda 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "train_journey",
        time: `${t.departure_time} - ${t.arrival_time}`,
        title: `${t.train_name} (${t.train_number}) poyezdida sayohat`,
        location: `${t.from_city} ➔ ${t.to_city}`,
        icon: "fa-train",
        category: "transport",
        duration: t.duration,
        description: `O'zbekistonning eng zamonaviy tezyurar poyezdida ${t.seat_class} toifasidagi qulay o'rindiqlarda go'zal qishloq manzaralarini tomosha qilib sayohat qilish. Bepul choy va shirinliklar.`,
        transport: `${t.train_type} (${t.duration})`,
        cost_included: true
      },
      {
        activity_id: "train_station_arrive",
        time: `${t.arrival_time} - 10:45`,
        title: `${t.to_city} vokzalida kutib olish va mehmonxonaga transfer`,
        location: `${t.to_city} Temir yo'l vokzali`,
        icon: "fa-car-side",
        category: "transfer",
        duration: "45 daqiqa",
        description: `Mahalliy gid va yangi shaxsiy transport kutib oladi. Yangi shartnomali mehmonxonaga yuklarni tashlab, to'g'ridan-to'g'ri tarixiy ekskursiyaga kirishiladi.`,
        transport: "Konditsionerli VIP avtomobil",
        cost_included: true
      },
      {
        activity_id: t.to_city === 'Samarkand' ? "registan_square" : (t.to_city === 'Bukhara' ? "lyabi_khauz" : "itchan_kala"),
        time: "11:00 - 13:00",
        title: t.to_city === 'Samarkand' ? "Afsonaviy Registon Maydoni va 3 ta Madrassa mo'jizasi" : (t.to_city === 'Bukhara' ? "Labi Hovuz ansambli va qadimiy savdo gumbazlari" : "Ichan-Qala devorlari ichida tarixiy sayohat"),
        location: `${t.to_city} tarixiy yuragi`,
        icon: "fa-monument",
        category: "sightseeing",
        duration: "2 soat",
        description: t.to_city === 'Samarkand'
          ? "Ulug'bek, Sherdor va Tilla-Kori madrasalari: tilla suvi yugurtirilgan gumbazlar va arxitektura sirlari bo'ylab professional gid hamrohligida ekskursiya."
          : (t.to_city === 'Bukhara'
            ? "Asriy chinorlar soyasidagi Labi Hovuz, Ko'kaldosh madrasasi va qadimiy ipak bozorlari gumbazlari sayohati."
            : "Ichan-Qala ichidagi Ota Darvoza, Kalta Minor firuza minorasi va Ko'hna Ark qasri."),
        transport: "Piyoda qadimiy markaz bo'ylab",
        cost_included: true
      },
      {
        activity_id: t.to_city === 'Samarkand' ? "samarkand_lunch" : (t.to_city === 'Bukhara' ? "bukhara_lunch" : "shivit_oshi"),
        time: "13:15 - 14:30",
        title: `Haqiqiy ${t.to_city} an'anaviy tushligi`,
        location: "Milliy choyxona",
        icon: "fa-utensils",
        category: "meal",
        duration: "1 soat 15 daqiqa",
        description: t.to_city === 'Samarkand' ? "Mashhur Samarqandcha qat-qat palov, bodring-pomidor salatlari va ko'k choy." : "Buxorocha manti yoki Xorazm tuxum baragi.",
        transport: "Piyoda 5 daqiqa",
        cost_included: true
      },
      {
        activity_id: t.to_city === 'Samarkand' ? "guri_amir" : (t.to_city === 'Bukhara' ? "poi_kalyan_ark" : "juma_mosque"),
        time: "14:45 - 17:00",
        title: t.to_city === 'Samarkand' ? "Go'ri Amir Maqbarasi va Shohi Zinda me'moriy koridori" : (t.to_city === 'Bukhara' ? "Poi Kalon ansambli va Kalon minorasi" : "Juma masjidi (218 ta o'ymakor ustun) va Tosh Hovli saroyi"),
        location: `${t.to_city} tarixiy obidalari`,
        icon: "fa-archway",
        category: "sightseeing",
        duration: "2 soat 15 daqiqa",
        description: "Eng saralangan fotogenik nuqtalar, firuza naqshinkor koshinlar va Sharqning eng go'zal arxitektura merosi bilan tanishuv.",
        transport: "Konditsionerli transportda",
        cost_included: true
      },
      {
        activity_id: "hotel_relax",
        time: "17:30 - 18:30",
        title: "Mehmonxonada dam olish va kechki libosga tayyorgarlik",
        location: `${t.to_city} hamkor mehmonxonasi`,
        icon: "fa-bed",
        category: "hotel",
        duration: "1 soat",
        description: "Xonaga to'liq joylashish, dush va qisqa hordiq.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "panoramic_dinner",
        time: "19:00 - 21:00",
        title: "Oqshomgi yoritilgan obidalar tomoshasi va shohona kechki ovqat",
        location: "Panoramik terassali restoran",
        icon: "fa-utensils",
        category: "meal",
        duration: "2 soat",
        description: "Tungi chiroqlar bilan yoritilgan qadimiy minoralar manzarasi ostida nafis sharqona kechki taom.",
        transport: "Mashinada 10 daqiqa",
        cost_included: true
      }
    ];
  }

  // Full Day In-Depth City Exploration (Samarkand, Bukhara, Khiva, or Tashkent)
  if (city === 'Samarkand') {
    return [
      {
        activity_id: "hotel_buffet_breakfast",
        time: "08:00 - 09:00",
        title: "Mehmonxonada to'yimli bufet nonushtasi",
        location: `${hotelName} restorani`,
        icon: "fa-mug-saucer",
        category: "meal",
        duration: "1 soat",
        description: "Samarqand nonlari, tabiiy asal, qaymoq va issiq taomlar bilan to'yimli nonushta.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "shohi_zinda",
        time: "09:15 - 11:30",
        title: "Shohi Zinda moviy maqbaralar xiyoboni",
        location: "Qadimiy Afrosiyob qirlari",
        icon: "fa-archway",
        category: "sightseeing",
        duration: "2 soat 15 daqiqa",
        description: "IX-XIV asrlarga oid dunyodagi eng noyob firuza va lojuvard koshinli xiyobon. Har bir maqbara o'zgacha naqsh bilan bezatilgan bo'lib, fotosessiya uchun ajoyib joy.",
        transport: "Konditsionerli transportda 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "ulugh_beg",
        time: "11:45 - 13:00",
        title: "Mirzo Ulug'bek Rasadxonasi va Sekstant muzeyi",
        location: "Cho'pon-Ota tepaligi",
        icon: "fa-star",
        category: "sightseeing",
        duration: "1 soat 15 daqiqa",
        description: "1428-yilda Amir Temurning nabirasi Ulug'bek tomonidan barpo etilgan va 1018 ta yulduz harakatini teleskopsiz aniqlagan qadimiy yerosti sekstanti.",
        transport: "Mashinada 10 daqiqa",
        cost_included: true
      },
      {
        activity_id: "tandir_meat",
        time: "13:15 - 14:30",
        title: "Tushlik: Samarqandcha Tandir Go'shti va Manti",
        location: "Samarqand mashhur go'sht markazi",
        icon: "fa-utensils",
        category: "meal",
        duration: "1 soat 15 daqiqa",
        description: "Archa novdalari bilan tandirda pishirilgan xushbo'y qo'zi go'shti, pomidorli chuchuk va tog' ko'k choyi.",
        transport: "Mashinada 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "konigil_paper",
        time: "14:45 - 16:45",
        title: "Konigil qadimiy Ipak Qog'oz fabrikasi mahorat darsi",
        location: "Konigil qishlog'i, Siyob daryosi bo'yi",
        icon: "fa-scroll",
        category: "sightseeing",
        duration: "2 soat",
        description: "VIII asr qadimgi Xitoy texnologiyasi asosida suv tegirmoni yordamida tut po'stlog'idan 1000 yil saqlanadigan Samarqand qog'ozi yasash jarayonida bevosita qatnashish.",
        transport: "Mashinada 20 daqiqa",
        cost_included: true
      },
      {
        activity_id: "bibi_khanym",
        time: "17:00 - 18:30",
        title: "Bibi Xonim Jome Masjidi va Siyob Bozorida halvo xaridi",
        location: "Registon yaqinidagi qadimiy bozor",
        icon: "fa-store",
        category: "shopping",
        duration: "1 soat 30 daqiqa",
        description: "Temur davrining ulug'vor jome masjidi va afsonaviy pista-yongoqli Samarqand halvolari, quritilgan mevalarni bepul tatib ko'rish.",
        transport: "Mashinada 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "registan_dinner",
        time: "19:00 - 21:00",
        title: "Kechki Registon nurlari ostida kechki ovqat",
        location: "Registon maydoniga qaragan rooftop restoran",
        icon: "fa-utensils",
        category: "meal",
        duration: "2 soat",
        description: "Musiqiy hamrohlikda Samarqandcha qovurma va yengil shirinliklar bilan kunni unutilmas yakunlash.",
        transport: "Mehmonxonaga qaytish",
        cost_included: true
      }
    ];
  }

  if (city === 'Bukhara') {
    return [
      {
        activity_id: "hotel_buffet_breakfast",
        time: "08:00 - 09:00",
        title: "Buxorocha shirinliklar bilan ertalabki nonushta",
        location: `${hotelName} aivani`,
        icon: "fa-mug-saucer",
        category: "meal",
        duration: "1 soat",
        description: "Qadimiy hovli favvorasi yonida yangi pishirilgan qatlama, anjir murabbosi va qahva.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "poi_kalyan_ark",
        time: "09:15 - 11:30",
        title: "Poi Kalon Majmuasi va Buxoro Arki qal'asi",
        location: "Buxoro Registoni",
        icon: "fa-monument",
        category: "sightseeing",
        duration: "2 soat 15 daqiqa",
        description: "Chingizxon ham hayratlanib buzishga botinolmagan 46 metrli Kalon minorasi (1127 y.), 288 gumbazli Kalon masjidi va amirlarning 2000 yillik qadimiy Ark saroyi.",
        transport: "Piyoda sayr",
        cost_included: true
      },
      {
        activity_id: "bolo_hauz",
        time: "11:45 - 13:00",
        title: "Bolo Hovuz masjidi va Ismoil Somoniy maqbarasi",
        location: "Somoniylar bog'i",
        icon: "fa-archway",
        category: "sightseeing",
        duration: "1 soat 15 daqiqa",
        description: "20 ta naqshinkor yog'och ustunli Bolo Hovuz masjidi va g'isht terish san'atining durdonasi bo'lgan IX asr Ismoil Somoniy maqbarasi.",
        transport: "Piyoda 10 daqiqa",
        cost_included: true
      },
      {
        activity_id: "bukhara_lunch",
        time: "13:15 - 14:30",
        title: "Tushlik: Buxorocha No'xat Shurvak va Qozon Kabob",
        location: "Labi Hovuz bo'yidagi qadimiy choyxona",
        icon: "fa-utensils",
        category: "meal",
        duration: "1 soat 15 daqiqa",
        description: "Katta sopol kosalarda uzoq qaynatilgan no'xatli go'sht sho'rvasi va Buxorocha ziravorli pishiriqlar.",
        transport: "Piyoda 10 daqiqa",
        cost_included: true
      },
      {
        activity_id: "sitorai_mokhi",
        time: "14:45 - 16:45",
        title: "Sitorai Mohi Xosa: So'nggi Buxoro Amirining Yozgi Saroyi",
        location: "Buxoro chekkasi (4 km)",
        icon: "fa-crown",
        category: "sightseeing",
        duration: "2 soat",
        description: "Sharq va rus imperiyasi uslublari uyg'unlashgan oq zallar, oynavand koshonalar, go'zal tovuslar yuradigan bog'lar va amir harami.",
        transport: "Konditsionerli transportda 15 daqiqa",
        cost_included: true
      },
      {
        activity_id: "chor_minor",
        time: "17:00 - 18:30",
        title: "Chor Minor (To'rt Minora) va Ipak gilamlari to'qish ustaxonasi",
        location: "Eski Buxoro mahallasida",
        icon: "fa-palette",
        category: "sightseeing",
        duration: "1 soat 30 daqiqa",
        description: "To'rtta moviy gumbazli betakror madrasa va tabiiy o'simlik bo'yoqlari bilan ipak gilam to'qiyotgan hunarmand ayollar bilan suhbat.",
        transport: "Mashinada 10 daqiqa",
        cost_included: true
      },
      {
        activity_id: "nodir_devonbegi",
        time: "19:00 - 21:30",
        title: "Nodir Devonbegi Madrasasida Jonli Folklor va Moda Namoyishi",
        location: "XVI asr Nodir Devonbegi madrasasi hovlisi",
        icon: "fa-music",
        category: "entertainment",
        duration: "2 soat 30 daqiqa",
        description: "Sharqona musiqa, Buxoro xalq raqslari va o'zbek ipak liboslari defilesi hamrohligida shohona kechki ovqat.",
        transport: "Piyoda Labi Hovuzga",
        cost_included: true
      }
    ];
  }

  if (city === 'Khiva') {
    return [
      {
        activity_id: "hotel_buffet_breakfast",
        time: "08:00 - 09:00",
        title: "Ichan-Qala ichida xonona nonushta",
        location: `${hotelName} restorani`,
        icon: "fa-mug-saucer",
        category: "meal",
        duration: "1 soat",
        description: "Xorazmcha yupqa patirlar, qatiq, yovvoyi tog' asalari va qahva.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "kuhna_ark",
        time: "09:15 - 11:30",
        title: "Ko'hna Ark Qal'asi va Muhammad Amin-xon Madrasasi",
        location: "Ichan-Qala g'arbiy darvozasi",
        icon: "fa-fort-awesome",
        category: "sightseeing",
        duration: "2 soat 15 daqiqa",
        description: "Xiva xonlarining qadimiy qarorgohi, xon tanga zarbxonasi, zindon va Ko'hna Ark kuzatuv minorasidan Ichan-Qalaning 360 darajali panoramik manzarasi.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "juma_mosque",
        time: "11:45 - 13:00",
        title: "Juma Masjidi: 218 ta betakror o'ymakor yog'och ustunlar",
        location: "Ichan-Qala markazi",
        icon: "fa-columns",
        category: "sightseeing",
        duration: "1 soat 15 daqiqa",
        description: "X asrdan boshlab turli asrlarda yong'oq va qayrag'ochdan o'yib yasalgan 218 ta betakror ustun va ajoyib tabiiy akustika sirlari.",
        transport: "Piyoda 5 daqiqa",
        cost_included: true
      },
      {
        activity_id: "shivit_oshi",
        time: "13:15 - 14:30",
        title: "Xorazm milliy tushligi: \"Shivit Oshi\" va \"Tuxum Barak\"",
        location: "Ichan-Qala ichidagi milliy xonadon choyxonasi",
        icon: "fa-utensils",
        category: "meal",
        duration: "1 soat 15 daqiqa",
        description: "Yashil shivit o'tidan tayyorlangan xushbo'y ugra ustida mol go'shti qaylasi va tuxumli nozik pishiriqlar.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "tosh_hovli",
        time: "14:45 - 16:30",
        title: "Tosh Hovli Saroyi (Xonning tosh saroyi va Harami)",
        location: "Ichan-Qala sharqiy qismi",
        icon: "fa-crown",
        category: "sightseeing",
        duration: "1 soat 45 daqiqa",
        description: "Olloqulixon tomonidan barpo etilgan hashamatli koshinli zallar, qabullar saroyi va o'ymakor yog'och aivanlar.",
        transport: "Piyoda 5 daqiqa",
        cost_included: true
      },
      {
        activity_id: "islam_khodja",
        time: "16:45 - 18:15",
        title: "Islom Xo'ja Minorasi (O'zbekistondagi eng baland minora)",
        location: "Islom Xo'ja majmuasi",
        icon: "fa-sun",
        category: "sightseeing",
        duration: "1 soat 30 daqiqa",
        description: "57 metrli balandlikka ega qadimiy minoraga chiqish va qadimiy loy devorlar ustidan cho'l quyosh botishini tomosha qilish.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "wood_carving",
        time: "18:30 - 19:30",
        title: "Yog'och o'ymakorligi va Xiva gilamlari ustaxonasida erkin vaqt",
        location: "Hunarmandlar ko'chasi",
        icon: "fa-hammer",
        category: "shopping",
        duration: "1 soat",
        description: "Qadimiy uslubda yong'oq yog'ochidan kitob lavhlari va quvurlari yasayotgan usta hunarmandlar bilan suhbat.",
        transport: "Piyoda",
        cost_included: true
      },
      {
        activity_id: "khorezm_lazgi",
        time: "19:45 - 21:45",
        title: "Olovlar va mash'allar ostida shohona kechki ovqat & Xorazm Lazgisi",
        location: "Ichan-Qala qal'a devorlari ustidagi terassa",
        icon: "fa-music",
        category: "entertainment",
        duration: "2 soat",
        description: "Jonli tor va doira sadolari ostida jo'shqin Xorazm Lazgisi raqslari hamrohligida baliq kabobi va milliy taomlar.",
        transport: "Mehmonxonaga piyoda 5 daqiqa",
        cost_included: true
      }
    ];
  }

  // Fallback default city day
  return [
    {
      time: "08:30 - 09:30",
      title: "Mehmonxonada to'yimli nonushta",
      location: hotelName,
      icon: "fa-mug-saucer",
      category: "meal",
      duration: "1 soat",
      description: "Issiq qahva, choy va xalqaro bufet nonushtasi.",
      transport: "Piyoda",
      cost_included: true
    },
    {
      time: "09:45 - 12:30",
      title: `${city} qadimiy me'moriy obidalari bo'ylab sayohat`,
      location: `${city} tarixiy markazi`,
      icon: "fa-mosque",
      category: "sightseeing",
      duration: "2 soat 45 daqiqa",
      description: "Tarixiy madrasalar, maqbaralar va qadimiy ko'chalar bo'ylab ekskursiya.",
      transport: "Konditsionerli transportda",
      cost_included: true
    },
    {
      time: "13:00 - 14:15",
      title: "Milliy an'anaviy tushlik",
      location: "Mahalliy choyxona",
      icon: "fa-utensils",
      category: "meal",
      duration: "1 soat 15 daqiqa",
      description: "Shahar xos lazzatli taomlari va ko'k choy.",
      transport: "Mashinada 10 daqiqa",
      cost_included: true
    },
    {
      time: "14:30 - 17:30",
      title: "Hunarmandlar ustaxonalari va Sharq bozori sayohati",
      location: "Hunarmandlar mahallasi",
      icon: "fa-store",
      category: "shopping",
      duration: "3 soat",
      description: "Milliy kulolchilik, to'qimachilik va suvenirlar xaridi.",
      transport: "Piyoda",
      cost_included: true
    },
    {
      time: "18:00 - 19:00",
      title: "Mehmonxonada dam olish va hordiq",
      location: hotelName,
      icon: "fa-bed",
      category: "hotel",
      duration: "1 soat",
      description: "Dush qabul qilish va kechki dasturga tayyorgarlik.",
      transport: "Piyoda",
      cost_included: true
    },
    {
      time: "19:30 - 21:30",
      title: "Kechki oqshom sayri va milliy kechki ovqat",
      location: "Shahar markaziy restorani",
      icon: "fa-utensils",
      category: "meal",
      duration: "2 soat",
      description: "Milliy shashlik va jo'shqin musiqiy muhit.",
      transport: "Mashinada",
      cost_included: true
    }
  ];
}

// Distribute total days evenly or logically across cities
function distributeDays(cities, totalDays) {
  const count = cities.length;
  const baseNights = Math.max(1, Math.floor(totalDays / count));
  const stays = [];
  let allocated = 0;

  for (let i = 0; i < count; i++) {
    let nights = baseNights;
    if (i === count - 1) {
      nights = Math.max(1, totalDays - allocated);
    }
    stays.push({ city: cities[i], nights });
    allocated += nights;
  }
  return stays;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function addDays(d, num) {
  const next = new Date(d);
  next.setDate(next.getDate() + num);
  return next;
}

// Generate a single complete package with hotels, rooms, and trains
function generateSinglePackage(config, origin, cities, cityStays, userBudget, durationDays, startDate, options = {}) {
  const tourCode = generateTourCode();
  let currentDate = new Date(startDate);
  const itineraryDays = [];
  const hotelBookings = [];
  const trainBookings = [];

  let totalHotelCost = 0;
  let totalTrainCost = 0;
  let dayCounter = 1;

  // Plan city by city
  for (let cIdx = 0; cIdx < cityStays.length; cIdx++) {
    const stay = cityStays[cIdx];
    const city = stay.city;
    const nights = stay.nights;
    const checkIn = new Date(currentDate);
    const checkOut = addDays(checkIn, nights);

    // Pick hotel in this city matching preferred stars
    const cityHotels = db.getHotelsByCity(city);
    let chosenHotel = null;
    let chosenRoom = null;

    if (cityHotels && cityHotels.length > 0) {
      // Find matching star rating
      chosenHotel = cityHotels.find(h => config.preferredStars.includes(h.stars)) || cityHotels[0];
      if (chosenHotel && chosenHotel.rooms && chosenHotel.rooms.length > 0) {
        // Pick room matching config
        if (config.id === 'luxury' && chosenHotel.rooms.length > 1) {
          chosenRoom = chosenHotel.rooms[chosenHotel.rooms.length - 1]; // Deluxe/Suite
        } else if (config.id === 'budget') {
          chosenRoom = chosenHotel.rooms[0]; // Standard/Single
        } else {
          chosenRoom = chosenHotel.rooms[Math.min(1, chosenHotel.rooms.length - 1)]; // Comfort
        }
      }
    }

    // Default fallback if no contracted hotel yet in a custom city
    if (!chosenHotel) {
      chosenHotel = {
        name: `Contracted Partner Hotel in ${city}`,
        stars: config.preferredStars[0],
        address: `Central Historical District, ${city}`,
        city: city
      };
      chosenRoom = {
        room_name: 'Comfort Guest Room',
        price_per_night_usd: config.id === 'luxury' ? 150 : (config.id === 'budget' ? 45 : 75)
      };
    }

    const roomPrice = chosenRoom ? chosenRoom.price_per_night_usd : 70;
    const hotelStayCost = roomPrice * nights;
    totalHotelCost += hotelStayCost;

    hotelBookings.push({
      city: city,
      hotel_name: chosenHotel.name,
      hotel_id: chosenHotel.id,
      stars: chosenHotel.stars,
      address: chosenHotel.address,
      image_url: chosenHotel.image_url || null,
      room_name: chosenRoom.room_name,
      room_id: chosenRoom.id,
      nights: nights,
      check_in: formatDate(checkIn),
      check_out: formatDate(checkOut),
      price_per_night: roomPrice,
      total_cost: hotelStayCost,
      available_rooms: chosenHotel.rooms || []
    });

    // Add detailed day descriptions
    for (let d = 0; d < nights; d++) {
      const thisDayDate = addDays(checkIn, d);
      const isFirstDay = (dayCounter === 1);
      const isLastDay = (dayCounter === durationDays);
      const isTransferDay = (d === 0 && cIdx > 0);

      // Check if there was a train taken to arrive in this city today
      let trainTaken = null;
      if (isTransferDay && trainBookings.length > 0) {
        trainTaken = trainBookings[trainBookings.length - 1];
      }

      const timeline = generateDailyDetailedSchedule(
        city,
        dayCounter,
        durationDays,
        isFirstDay,
        isLastDay,
        trainTaken,
        chosenHotel.name,
        chosenRoom.room_name
      );

      let dayTitle = '';
      let dayDesc = '';

      if (isFirstDay) {
        dayTitle = `1-Kun: ${city}ga yetib kelish & Ilk tanishuv`;
        dayDesc = `Aeroportda VIP kutib olish, ${chosenHotel.name} mehmonxonasiga transfer va Hazrati Imom, Chorsu bozori hamda markaziy xiyobonlar bo'ylab ekskursiya.`;
      } else if (isTransferDay) {
        dayTitle = `${dayCounter}-Kun: ${trainTaken ? trainTaken.from_city + 'dan ' + city + 'ga tezyurar poyezdda transfer va ' : ''}${city} obidalari`;
        dayDesc = `Ertalabki tezyurar poyezdda qulay yetib kelish, yangi mehmonxonaga joylashish va jahon merosi durdonalari sayohati.`;
      } else {
        dayTitle = `${dayCounter}-Kun: Qadimiy ${city} bo'ylab to'liq kunlik chuqur ekskursiya`;
        dayDesc = `${city}ning asriy madrasalari, xonlar saroylari, hunarmandchilik ustaxonalari va sharqona bozorlarining barcha sirlari.`;
      }

      itineraryDays.push({
        day_number: dayCounter,
        date: formatDate(thisDayDate),
        city: city,
        title: dayTitle,
        description: dayDesc,
        hotel_night: chosenHotel.name,
        hotel_stars: chosenHotel.stars,
        room_type: chosenRoom.room_name,
        room_price: roomPrice,
        train_info: trainTaken,
        timeline: timeline
      });

      dayCounter++;
    }

    // Check train to next city
    if (cIdx < cityStays.length - 1) {
      const nextCity = cityStays[cIdx + 1].city;
      const availableTrains = db.getTrainsBetween(city, nextCity);
      let chosenTrain = null;

      if (availableTrains && availableTrains.length > 0) {
        chosenTrain = availableTrains[0];
      } else {
        // Fallback default route
        chosenTrain = {
          train_name: 'Uzbekistan Express Rail',
          train_number: '750U',
          train_type: 'Express Intercity Train',
          from_city: city,
          to_city: nextCity,
          departure_time: '08:30',
          arrival_time: '11:45',
          duration: '3h 15m',
          economy_price_usd: 16,
          business_price_usd: 25,
          vip_price_usd: 38
        };
      }

      let ticketPrice = chosenTrain.business_price_usd;
      let seatClass = 'Business Class';
      if (config.trainClass === 'vip') {
        ticketPrice = chosenTrain.vip_price_usd;
        seatClass = 'VIP Class';
      } else if (config.trainClass === 'economy') {
        ticketPrice = chosenTrain.economy_price_usd;
        seatClass = 'Economy Class';
      }

      totalTrainCost += ticketPrice;

      trainBookings.push({
        from_city: city,
        to_city: nextCity,
        train_name: chosenTrain.train_name,
        train_number: chosenTrain.train_number,
        train_type: chosenTrain.train_type,
        travel_date: formatDate(checkOut),
        departure_time: chosenTrain.departure_time,
        arrival_time: chosenTrain.arrival_time,
        duration: chosenTrain.duration,
        seat_class: seatClass,
        ticket_price_usd: ticketPrice
      });
    }

    currentDate = checkOut;
  }

  // Departure day if needed
  if (dayCounter <= durationDays) {
    const lastCity = cityStays[cityStays.length - 1].city;
    const depTimeline = generateDailyDetailedSchedule(
      lastCity,
      dayCounter,
      durationDays,
      false,
      true,
      null,
      'Hotel',
      'Room'
    );

    itineraryDays.push({
      day_number: dayCounter,
      date: formatDate(currentDate),
      city: lastCity,
      title: `${dayCounter}-Kun: Xayrlashuv, Suvenirlar Xaridi va Aeroportga Kuzatish`,
      description: 'Mehmonxonadan chiqish, ipak va sopol suvenirlar xaridi, xayrlashuv tushligi va xalqaro aeroportga shaxsiy VIP transfer.',
      hotel_night: 'Parvoz kuni (Mehmonxona talab etilmaydi)',
      hotel_stars: 0,
      room_type: '-',
      room_price: 0,
      train_info: null,
      timeline: depTimeline
    });
  }

  // 1. Guides Selection from Database
  const allGuides = db.getAllGuides ? db.getAllGuides(true) : [];
  let assignedGuide = allGuides.length > 0 ? allGuides[0] : {
    id: 1,
    name: 'Alisher Rasulov',
    languages: 'Türkçe, English, Русский',
    city: 'All Uzbekistan',
    license_number: 'UZB-GUIDE-2022-104',
    daily_rate_usd: 50,
    phone: '+998 90 112 33 44',
    rating: 4.96
  };
  if (config.id === 'luxury' && allGuides.length > 3) {
    assignedGuide = allGuides[3];
  } else if (config.id === 'comfort' && allGuides.length > 0) {
    assignedGuide = allGuides[0];
  }

  const guideDailyRate = assignedGuide.daily_rate_usd || 50;
  const totalGuideCost = guideDailyRate * durationDays;

  // 2. Flight Selection Based on Traveler's Country of Origin
  const allFlights = db.getAllFlights ? db.getAllFlights(true) : [];
  let outboundFlight = null;
  let returnFlight = null;
  let totalFlightCost = 0;

  const firstCity = cities[0] || 'Tashkent';
  const lastCity = cities[cities.length - 1] || 'Tashkent';
  const originLower = (origin || '').toLowerCase().trim();

  // Search terms mapping for major global tourism origins
  let originSearchTerms = [];
  if (originLower.includes('germany') || originLower.includes('germaniy') || originLower.includes('frankfurt') || originLower.includes('munich') || originLower.includes('berlin') || originLower.includes('deutschland')) {
    originSearchTerms = ['Frankfurt', 'Munich', 'FRA', 'MUC'];
  } else if (originLower.includes('uk') || originLower.includes('united kingdom') || originLower.includes('london') || originLower.includes('england') || originLower.includes('angli')) {
    originSearchTerms = ['London', 'LHR'];
  } else if (originLower.includes('usa') || originLower.includes('united states') || originLower.includes('america') || originLower.includes('new york') || originLower.includes('aqsh') || originLower.includes('amerika')) {
    originSearchTerms = ['New York', 'JFK'];
  } else if (originLower.includes('uae') || originLower.includes('dubai') || originLower.includes('dubay') || originLower.includes('amirlik')) {
    originSearchTerms = ['Dubai', 'DXB'];
  } else if (originLower.includes('france') || originLower.includes('paris') || originLower.includes('fransi')) {
    originSearchTerms = ['Paris', 'CDG'];
  } else if (originLower.includes('italy') || originLower.includes('rome') || originLower.includes('milan') || originLower.includes('itali')) {
    originSearchTerms = ['Rome', 'Milan', 'FCO', 'MXP'];
  } else if (originLower.includes('spain') || originLower.includes('madrid') || originLower.includes('barcelona') || originLower.includes('ispani')) {
    originSearchTerms = ['Madrid', 'MAD'];
  } else if (originLower.includes('korea') || originLower.includes('seoul') || originLower.includes('korey')) {
    originSearchTerms = ['Seoul', 'ICN'];
  } else if (originLower.includes('japan') || originLower.includes('tokyo') || originLower.includes('yaponi')) {
    originSearchTerms = ['Tokyo', 'NRT'];
  } else if (originLower.includes('russia') || originLower.includes('moscow') || originLower.includes('rossi') || originLower.includes('moskv')) {
    originSearchTerms = ['Moscow', 'VKO', 'DME'];
  } else if (originLower.includes('india') || originLower.includes('delhi') || originLower.includes('hindist')) {
    originSearchTerms = ['Delhi', 'DEL'];
  } else if (originLower.includes('china') || originLower.includes('beijing') || originLower.includes('xitoy')) {
    originSearchTerms = ['Beijing', 'PEK'];
  } else if (originLower.includes('kazakh') || originLower.includes('almaty') || originLower.includes('astana') || originLower.includes('qozog')) {
    originSearchTerms = ['Almaty', 'ALA'];
  } else if (originLower.includes('turkey') || originLower.includes('turkiy') || originLower.includes('istanbul')) {
    originSearchTerms = ['Istanbul', 'IST'];
  } else if (origin && origin !== 'International Traveler') {
    originSearchTerms = [origin];
  }

  let outboundMatch = null;
  let returnMatch = null;

  if (allFlights.length > 0 && originSearchTerms.length > 0) {
    for (const term of originSearchTerms) {
      const termLower = term.toLowerCase();
      // Try exact city match first (e.g. London -> Tashkent)
      outboundMatch = allFlights.find(f => f.from_city.toLowerCase().includes(termLower) && f.to_city.toLowerCase().includes(firstCity.toLowerCase()));
      if (!outboundMatch) {
        outboundMatch = allFlights.find(f => f.from_city.toLowerCase().includes(termLower));
      }
      returnMatch = allFlights.find(f => f.to_city.toLowerCase().includes(termLower) && f.from_city.toLowerCase().includes(lastCity.toLowerCase()));
      if (!returnMatch) {
        returnMatch = allFlights.find(f => f.to_city.toLowerCase().includes(termLower));
      }
      if (outboundMatch && returnMatch) break;
    }
  }

  if (outboundMatch && returnMatch) {
    // Scheduled Flights found in Database for traveler's origin
    outboundFlight = {
      id: outboundMatch.id,
      airline: outboundMatch.airline,
      flight_number: outboundMatch.flight_number,
      from_city: outboundMatch.from_city,
      to_city: outboundMatch.to_city,
      route: `${outboundMatch.from_city} ➔ ${outboundMatch.to_city}`,
      departure_time: outboundMatch.departure_time,
      arrival_time: outboundMatch.arrival_time,
      duration: outboundMatch.duration,
      baggage: outboundMatch.baggage_allowance,
      ticket_price_usd: config.id === 'luxury' ? outboundMatch.business_price_usd : outboundMatch.economy_price_usd,
      class_type: config.id === 'luxury' ? 'Business Class' : 'Economy Class'
    };

    returnFlight = {
      id: returnMatch.id,
      airline: returnMatch.airline,
      flight_number: returnMatch.flight_number,
      from_city: returnMatch.from_city,
      to_city: returnMatch.to_city,
      route: `${returnMatch.from_city} ➔ ${returnMatch.to_city}`,
      departure_time: returnMatch.departure_time,
      arrival_time: returnMatch.arrival_time,
      duration: returnMatch.duration,
      baggage: returnMatch.baggage_allowance,
      ticket_price_usd: config.id === 'luxury' ? returnMatch.business_price_usd : returnMatch.economy_price_usd,
      class_type: config.id === 'luxury' ? 'Business Class' : 'Economy Class'
    };
  } else {
    // Dynamic International Flight from Traveler's Specified Country
    const displayCountry = (origin && origin !== 'International Traveler') ? origin : 'International Origin';
    const isLuxury = config.id === 'luxury';
    const ecoPrice = 450;
    const busPrice = 900;

    outboundFlight = {
      id: 9991,
      airline: 'Uzbekistan Airways & Partner Airlines',
      flight_number: 'HY 792 / Global Connect',
      from_city: `${displayCountry} (Xalqaro Aeroport)`,
      to_city: `${firstCity} (TAS)`,
      route: `${displayCountry} ➔ ${firstCity}`,
      departure_time: '11:30',
      arrival_time: '20:45',
      duration: '7h 15m (To\'g\'ridan-to\'g\'ri / Tranzit)',
      baggage: '32 kg bagaj + 8 kg kabina',
      ticket_price_usd: isLuxury ? busPrice : ecoPrice,
      class_type: isLuxury ? 'Business Class' : 'Economy Class'
    };

    returnFlight = {
      id: 9992,
      airline: 'Uzbekistan Airways & Partner Airlines',
      flight_number: 'HY 791 / Global Connect',
      from_city: `${lastCity} (TAS)`,
      to_city: `${displayCountry} (Xalqaro Aeroport)`,
      route: `${lastCity} ➔ ${displayCountry}`,
      departure_time: '06:40',
      arrival_time: '14:20',
      duration: '7h 40m (To\'g\'ridan-to\'g\'ri / Tranzit)',
      baggage: '32 kg bagaj + 8 kg kabina',
      ticket_price_usd: isLuxury ? busPrice : ecoPrice,
      class_type: isLuxury ? 'Business Class' : 'Economy Class'
    };
  }

  totalFlightCost = outboundFlight.ticket_price_usd + returnFlight.ticket_price_usd;

  // 3. Daily Private AC Transportation with Chauffeur
  const dailyCarRate = config.id === 'luxury' ? 65 : (config.id === 'budget' ? 35 : 45);
  const totalTransportCost = dailyCarRate * durationDays;

  // 4. Daily Meals (Breakfast included in hotels; Lunch $15 + Dinner $20 = $35/day)
  const totalMealsCost = config.dailyMealsEst * durationDays;

  // 5. Entrance tickets to monuments & museums
  const totalTicketsCost = config.guideTicketsEstPerDay * durationDays;

  // 6. Mandatory State Tourist Tax ($3 per night per person)
  const stateTouristTax = 3 * Math.max(1, durationDays - 1);

  // 7. Agency Service Fee & 24/7 Concierge Logistics
  const agencyServiceFee = Math.round(75 + (durationDays * 5));

  // Grand total calculation (by default includes guide, flights, transport, meals, tax, agency fee)
  const totalWithoutFlight = totalHotelCost + totalTrainCost + totalGuideCost + totalTransportCost + totalMealsCost + totalTicketsCost + stateTouristTax + agencyServiceFee;
  const totalWithFlight = totalWithoutFlight + totalFlightCost;

  // By default, if origin country is specified, include international flight (or options)
  const includeFlightByDefault = options.includeFlight !== undefined ? options.includeFlight : Boolean(origin && origin !== 'International Traveler');
  const includeGuideByDefault = options.includeGuide !== undefined ? options.includeGuide : true;
  const baseGrandTotal = includeFlightByDefault ? totalWithFlight : totalWithoutFlight;
  const savings = userBudget ? Math.max(0, userBudget - baseGrandTotal) : 0;

  // Visa Status Helper for Traveler Country
  const lang = options.lang || 'en';
  let visaStatus = lang === 'uz' ? "90 kungacha vizasiz rejim" : "Visa-free entry for up to 30-90 days for international guests";
  const isTurkeyTraveler = originLower.includes('turkey') || originLower.includes('turkiy') || originLower.includes('istanbul');
  if (isTurkeyTraveler) {
    visaStatus = lang === 'uz'
      ? "🇹🇷 Turkiya fuqarolari uchun O'zbekistonga 30 kungacha VIZASIZ rejim (Visa-Free)! Pasport muddati 6 oy bo'lishi kifoya."
      : "🇹🇷 30-Day Visa-Free Entry to Uzbekistan for Turkish Citizens! (Valid 6+ months passport)";
  } else if (origin.toLowerCase().includes('usa') || origin.toLowerCase().includes('america')) {
    visaStatus = lang === 'uz'
      ? "🇺🇸 AQSH fuqarolari uchun qulay elektron viza (E-Visa 48 soatda beriladi) yoki 55 yoshdan kattalarga vizasiz."
      : "🇺🇸 Fast 48-Hour Official E-Visa for US Citizens (Visa-free for travelers 55+).";
  } else if (origin.toLowerCase().includes('uk') || origin.toLowerCase().includes('kingdom') || origin.toLowerCase().includes('germany') || origin.toLowerCase().includes('france') || origin.toLowerCase().includes('italy')) {
    visaStatus = lang === 'uz'
      ? "🇪🇺 Yevropa Ittifoqi va Buyuk Britaniya fuqarolari uchun 30 kungacha to'liq VIZASIZ rejim!"
      : "🇪🇺 30-Day Guaranteed Visa-Free Entry to Uzbekistan for EU & UK Citizens!";
  }

  const packageData = {
    tour_code: tourCode,
    package_id: config.id,
    package_title: config.title,
    tagline: config.tagline,
    badge: config.badge,
    customer_origin: origin,
    cities: cities.join(' -> '),
    duration_days: durationDays,
    start_date: formatDate(startDate),
    end_date: formatDate(addDays(startDate, durationDays)),
    visa_info: visaStatus,
    breakdown: {
      hotels_total: totalHotelCost,
      trains_total: totalTrainCost,
      flights_total: totalFlightCost,
      include_flight: includeFlightByDefault,
      guide_total: totalGuideCost,
      include_guide: true,
      daily_transport_total: totalTransportCost,
      daily_transport_rate: dailyCarRate,
      meals_est_total: totalMealsCost,
      tickets_est_total: totalTicketsCost,
      state_tourist_tax: stateTouristTax,
      agency_service_fee: agencyServiceFee,
      grand_total_usd: baseGrandTotal,
      grand_total_without_flight: totalWithoutFlight,
      grand_total_with_flight: totalWithFlight,
      client_budget_usd: userBudget || baseGrandTotal,
      savings_usd: savings
    },
    assigned_guide: assignedGuide,
    flights: {
      outbound: outboundFlight,
      return: returnFlight,
      roundtrip_total: totalFlightCost
    },
    hotels: hotelBookings,
    trains: trainBookings,
    itinerary_days: itineraryDays,
    available_experiences: db.getAllExperiences ? db.getAllExperiences(true) : []
  };

  // Save proposal to DB
  try {
    db.saveTourProposal({
      tour_code: tourCode,
      package_title: config.title,
      customer_origin: origin,
      cities: cities.join(','),
      budget_usd: userBudget || baseGrandTotal,
      duration_days: durationDays,
      total_estimated_usd: baseGrandTotal,
      itinerary_json: JSON.stringify(packageData)
    });
  } catch (err) {
    console.error('Error saving proposal to DB:', err.message);
  }

  return packageData;
}

/**
 * Main AI Agent Chat Processor
 * Evaluates user message, provides agency contact info, answers questions,
 * and if budget/cities are provided, generates structured custom tour proposals.
 */
async function processUserMessage(userMessage, conversationHistory = [], preferredLang = 'en') {
  const lower = userMessage.toLowerCase();
  const agency = db.getAgencySettings();

  // Detect language from preferredLang or message content
  let lang = preferredLang || 'en';
  if (lower.match(/salom|assalomu|yaxshimisiz|qancha|qayerda|adminga/)) {
    lang = 'uz';
  } else if (lower.match(/merhaba|selam|nasılsınız|kaç para|türkiye|istanbul/)) {
    lang = 'tr';
  } else if (lower.match(/здравствуйте|привет|сколько стоит|россия|москва/)) {
    lang = 'ru';
  } else if (lower.match(/hallo|guten tag|deutschland|wie viel/)) {
    lang = 'de';
  } else if (lower.match(/bonjour|salut|france|combien/)) {
    lang = 'fr';
  } else if (lower.match(/hola|buenos días|españa|cuánto/)) {
    lang = 'es';
  } else if (userMessage.match(/[\u0600-\u06FF]/)) {
    lang = 'ar';
  } else if (userMessage.match(/[\u4e00-\u9fa5]/)) {
    lang = 'zh';
  }

  // Security Check / Prompt Injection Protection
  if (
    lower.includes('i am admin') ||
    lower.includes('men adminman') ||
    lower.includes('admin paroli') ||
    lower.includes('admin password') ||
    lower.includes('drop table') ||
    lower.includes('system prompt') ||
    lower.includes('change price') ||
    lower.includes('narxni ozgartir')
  ) {
    const secNotice = {
      en: '🔒 **Security Notice:** Administrative actions and database changes can only be performed via the dedicated **Secure Admin Portal** with authorized credentials. As the Customer AI Tour Agent, I am dedicated to helping travelers explore Uzbekistan, plan custom tours, and submit booking inquiries to our agency staff.',
      uz: '🔒 **Xavfsizlik eslatmasi:** Ma\'muriy amallar va ma\'lumotlar bazasini o\'zgartirish faqat maxsus **Admin Boshqaruv Paneli** orqali amalga oshiriladi. Mijozlar uchun AI agent esa sizga sayohat rejalashtirishda yordam beradi.',
      tr: '🔒 **Güvenlik Uyarısı:** İdari işlemler ve fiyat değişiklikleri yalnızca yetkili kimlik bilgileriyle **Güvenli Yönetim Portalı** üzerinden yapılabilir.',
      ru: '🔒 **Уведомление безопасности:** Административные действия и изменение базы данных возможны только через **Защищенный Портал Оператора**.',
      de: '🔒 **Sicherheitshinweis:** Administrative Aktionen können nur über das geschützte Admin-Portal durchgeführt werden.',
      fr: '🔒 **Avis de sécurité:** Les actions administratives ne peuvent être effectuées que via le portail d\'administration sécurisé.',
      es: '🔒 **Aviso de seguridad:** Las acciones administrativas solo se pueden realizar a través del portal de administración seguro.',
      ar: '🔒 **تنبيه أمني:** لا يمكن تنفيذ الإجراءات الإدارية إلا من خلال بوابة الإدارة الآمنة.',
      zh: '🔒 **安全提示：** 管理员操作与数据库修改仅可通过专用的安全管理后台进行。'
    };
    return {
      reply: secNotice[lang] || secNotice.en,
      packages: []
    };
  }

  // Agency info request (Contacts, License, About)
  if (
    lower.includes('aloqa') ||
    lower.includes('contact') ||
    lower.includes('phone') ||
    lower.includes('telefon') ||
    lower.includes('email') ||
    lower.includes('manzil') ||
    lower.includes('address') ||
    lower.includes('who are you') ||
    lower.includes('kim siz') ||
    lower.includes('firma') ||
    lower.includes('agentlik') ||
    lower.includes('agency') ||
    lower.includes('iletisim') ||
    lower.includes('контакт')
  ) {
    if (lang === 'uz') {
      return {
        reply: `Assalomu alaykum! **${agency.name}** agentligiga xush kelibsiz! 🇺🇿✨\n\nBiz O'zbekistonning qadimiy Buyuk Ipak Yo'li bo'ylab xorijiy sayyohlar uchun litsenziyaga ega rasmiy turoperatormiz.\n\n📞 **Telefon:** ${agency.phone}\n💬 **WhatsApp:** ${agency.whatsapp}\n✈️ **Telegram:** ${agency.telegram}\n📧 **Email:** ${agency.email}\n📍 **Ofis manzili:** ${agency.address}\n📜 **Davlat litsenziyasi:** ${agency.license_no}\n\n${agency.about_text}`,
        packages: []
      };
    } else if (lang === 'tr') {
      return {
        reply: `Assalomu aleykum! **${agency.name}** acentesine hoş geldiniz! 🇺🇿✨\n\nÖzbekistan İpek Yolu turlarında uzmanlaşmış resmi lisanslı tur operatörüyüz.\n\n📞 **Telefon:** ${agency.phone}\n💬 **WhatsApp:** ${agency.whatsapp}\n✈️ **Telegram:** ${agency.telegram}\n📧 **E-posta:** ${agency.email}\n📍 **Merkez Ofis:** ${agency.address}\n📜 **Resmi Turizm Lisansı:** ${agency.license_no}\n\n${agency.about_text}`,
        packages: []
      };
    } else if (lang === 'ru') {
      return {
        reply: `Здравствуйте! Добро пожаловать в **${agency.name}**! 🇺🇿✨\n\nМы являемся официальным лицензированным туроператором по Узбекистану и Великому Шелковому Пути.\n\n📞 **Телефон:** ${agency.phone}\n💬 **WhatsApp:** ${agency.whatsapp}\n✈️ **Telegram:** ${agency.telegram}\n📧 **Email:** ${agency.email}\n📍 **Адрес офиса:** ${agency.address}\n📜 **Государственная лицензия:** ${agency.license_no}\n\n${agency.about_text}`,
        packages: []
      };
    }
    // Default English
    return {
      reply: `Assalomu alaykum! Welcome to **${agency.name}**! 🇺🇿✨\n\nWe are an officially licensed tour operator specializing in tailored cultural journeys across Uzbekistan's ancient Silk Road for international guests.\n\n📞 **Direct Phone:** ${agency.phone}\n💬 **WhatsApp:** ${agency.whatsapp}\n✈️ **Telegram:** ${agency.telegram}\n📧 **Email:** ${agency.email}\n📍 **Office Address:** ${agency.address}\n📜 **State Tourism License:** ${agency.license_no}\n\n${agency.about_text}`,
      packages: []
    };
  }

  // Extract travel parameters
  const details = extractTravelerDetails(userMessage);

  // If the user provided a budget OR mentioned cities with interest in a tour
  const hasIntent = details.budget || details.cities.length >= 2 || lower.includes('tour') || lower.includes('sayohat') || lower.includes('reja') || lower.includes('plan') || lower.includes('trip') || lower.includes('tur');

  if (hasIntent) {
    const budget = details.budget || 1800;
    const duration = details.durationDays || 7;
    const cities = details.cities;
    const origin = details.origin;

    const packages = buildTourPackages(origin, cities, budget, duration, null, { lang });

    let replyIntro = '';
    if (lang === 'uz') {
      replyIntro = `Sayohat so'rovingiz bo'yicha ajoyib reja tayyorlandi! 🇺🇿✨\n\n` +
        `**Kelish mamlakati:** ${origin}\n` +
        `**Rejalashtirilgan budjet:** $${budget.toLocaleString()}\n` +
        `**Sayohat davomiyligi:** ${duration} kun\n` +
        `**Yo'nalish:** ${cities.join(' ➔ ')}\n\n` +
        `Quyida rasmiy shartnoma qilingan hamkor mehmonxonalarimiz va tezyurar poyezdlarimiz asosida **3 xil toifa** bo'yicha tayyorlangan sayohat paketlarini taqdim etamiz. O'zingizga yoqqan paketdagi **"Adminga murojaat qilish"** tugmasini bosing!`;
    } else if (lang === 'tr') {
      replyIntro = `Talebiniz doğrultusunda Özbekistan seyahat planınız hazırlandı! 🇺🇿✨\n\n` +
        `**Misafir Ülkesi:** ${origin}\n` +
        `**Tahmini Bütçe:** $${budget.toLocaleString()}\n` +
        `**Tur Süresi:** ${duration} Gün\n` +
        `**Güzergah:** ${cities.join(' ➔ ')}\n\n` +
        `Aşağıda sözleşmeli partner otellerimiz ve Afrosiyob hızlı trenleri ile hazırlanan **3 farklı tur seçeneğini** inceleyebilirsiniz. Beğendiğiniz pakette **"Turu Seç / Yetkiliye İlet"** butonuna basmanız yeterlidir!`;
    } else if (lang === 'ru') {
      replyIntro = `Отличные новости! Ваш персональный тур по Узбекистану рассчитан! 🇺🇿✨\n\n` +
        `**Страна гостя:** ${origin}\n` +
        `**Ориентировочный бюджет:** $${budget.toLocaleString()}\n` +
        `**Длительность:** ${duration} Дней\n` +
        `**Маршрут:** ${cities.join(' ➔ ')}\n\n` +
        `Ниже представлены **3 варианта тура** с официальными контрактными отелями и поездами Афросиаб. Выберите подходящий и нажмите **"Забронировать / Связаться с Оператором"**!`;
    } else if (lang === 'de') {
      replyIntro = `Wunderbar! Ihr persönliches Reiseangebot für Usbekistan ist fertiggestellt! 🇺🇿✨\n\n` +
        `**Herkunftsland:** ${origin}\n` +
        `**Geplantes Budget:** $${budget.toLocaleString()}\n` +
        `**Reisedauer:** ${duration} Tage\n` +
        `**Route:** ${cities.join(' ➔ ')}\n\n` +
        `Nachfolgend finden Sie **3 maßgeschneiderte Reisepakete** mit unseren Partnerhotels und Schnellzügen. Klicken Sie auf **"Tour Auswählen / Operator Kontaktieren"**, um Ihre Anfrage zu bestätigen!`;
    } else if (lang === 'fr') {
      replyIntro = `Excellente nouvelle ! Votre itinéraire sur mesure en Ouzbékistan est prêt ! 🇺🇿✨\n\n` +
        `**Provenance :** ${origin}\n` +
        `**Budget indicatif :** $${budget.toLocaleString()}\n` +
        `**Durée du séjour :** ${duration} Jours\n` +
        `**Circuit :** ${cities.join(' ➔ ')}\n\n` +
        `Consultez ci-dessous nos **3 formules de séjour** avec nos hôtels partenaires et trains Afrosiyob. Cliquez sur **"Réserver Ce Circuit"** pour finaliser !`;
    } else if (lang === 'es') {
      replyIntro = `¡Buenas noticias! Su propuesta de viaje por Uzbekistán está lista 🇺🇿✨\n\n` +
        `**País de origen:** ${origin}\n` +
        `**Presupuesto:** $${budget.toLocaleString()}\n` +
        `**Duración:** ${duration} Días\n` +
        `**Ruta:** ${cities.join(' ➔ ')}\n\n` +
        `A continuación encontrará **3 paquetes diseñados a su medida** con hoteles asociados y trenes bala. ¡Haga clic en **"Elegir Tour / Contactar Operador"** para reservar!`;
    } else if (lang === 'ar') {
      replyIntro = `أهلاً بكم! تم تجهيز برنامج رحلتكم إلى أوزبكستان بنجاح! 🇺🇿✨\n\n` +
        `**بلد القدوم:** ${origin}\n` +
        `**الميزانية المقترحة:** $${budget.toLocaleString()}\n` +
        `**مدة الرحلة:** ${duration} أيام\n` +
        `**خط السير:** ${cities.join(' ➔ ')}\n\n` +
        `تجدون أدناه **3 باقات سياحية متكاملة** مع فنادقنا الشريكة وقطار أفروسياب فائق السرعة. اضغطوا على **"اختيار البرنامج"** للتواصل الفوري مع إدارة الحجوزات!`;
    } else if (lang === 'zh') {
      replyIntro = `好消息！您的乌兹别克斯坦专属丝路行程已为您定制完成！🇺🇿✨\n\n` +
        `**客源地：** ${origin}\n` +
        `**规划预算：** $${budget.toLocaleString()}\n` +
        `**行程天数：** ${duration} 天\n` +
        `**游览路线：** ${cities.join(' ➔ ')}\n\n` +
        `以下为您展示基于直签定点酒店和阿芙罗西阿卜高铁定制的 **3 套优选方案**。请点击 **"选定方案 / 提交旅行社专员"** 进行确认！`;
    } else {
      // English (Default)
      replyIntro = `Fantastic news! We have customized 3 bespoke Uzbekistan itineraries tailored to your preferences! 🇺🇿✨\n\n` +
        `**Guest Origin:** ${origin}\n` +
        `**Estimated Budget:** $${budget.toLocaleString()}\n` +
        `**Duration:** ${duration} Days\n` +
        `**Route:** ${cities.join(' ➔ ')}\n\n` +
        `All accommodation includes strictly contracted partner hotels with confirmed star ratings and room options, alongside Uzbekistan Railways (Afrosiyob & Express) connections.\n\n` +
        `Review the 3 curated packages below. When you select a preferred tour, click **"Book This Tour / Contact Operator"** to submit your details directly to our staff for priority booking!`;
    }

    return {
      reply: replyIntro,
      parameters: {
        origin,
        budget,
        duration,
        cities
      },
      packages: packages
    };
  }

  // General welcoming response in preferred language
  const welcomeReplies = {
    en: `Assalomu alaykum & Warm Greetings from Uzbekistan! 🇺🇿🕌\n\nWelcome to **${agency.name}**! I am your personal AI Travel Concierge for international tourists visiting Uzbekistan.\n\nI can organize your entire journey across Tashkent, Samarkand, Bukhara, and Khiva within your budget!\n\n✨ **How to get started:**\nTell me something like:\n> *"I am from the UK, my budget is $2000, and I want to visit Tashkent, Samarkand, and Khiva for 7 days."*\n\nI will calculate exact dates, hotel stays with room types, Afrosiyob high-speed train tickets, and provide multiple package options with unique Tour IDs so our agency staff can assist you right away!`,
    uz: `Assalomu alaykum va O'zbekistonga xush kelibsiz! 🇺🇿🕌\n\n**${agency.name}** agentligining shaxsiy AI konsyerji xizmatingizda!\n\nSizga Toshkent, Samarqand, Buxoro va Xiva bo'ylab budjetingizga mos mukammal sayohat paketini tuzib beraman.\n\n✨ **Qanday boshlash mumkin?**\nMasalan:\n> *"Turkiyadan 2 kishi kelmoqchimiz, budjetimiz $2500, Toshkent, Samarqand va Buxoroni 7 kunda aylanmoqchimiz."*`,
    tr: `Assalomu aleykum ve Özbekistan'a hoş geldiniz! 🇺🇿🕌\n\n**${agency.name}** acentesinin AI Seyahat Danışmanıyım. Semerkant, Buhara, Hive ve Taşkent için bütçenize uygun eksiksiz tur paketleri hazırlıyorum!\n\n✨ **Nasıl başlayabilirsiniz?**\nÖrneğin:\n> *"Türkiye'den 2 kişiyiz, bütçemiz $2500, İstanbul uçuşu ile Semerkant ve Buhara'yı 7 günde gezmek istiyoruz."*`,
    ru: `Ассалому алейкум и добро пожаловать в Узбекистан! 🇺🇿🕌\n\nЯ персональный AI-консьерж агентства **${agency.name}**. Я помогу составить идеальный тур по Самарканду, Бухаре, Хиве и Ташкенту в рамках вашего бюджета!`,
    de: `Assalomu alaykum und herzlich willkommen in Usbekistan! 🇺🇿🕌\n\nIch bin Ihr KI-Reiseberater bei **${agency.name}**. Gerne plane ich Ihre Reise nach Samarkand, Buchara und Chiwa maßgeschneidert nach Ihrem Budget!`,
    fr: `Assalomu alaykum et bienvenue en Ouzbékistan ! 🇺🇿🕌\n\nJe suis votre concierge IA chez **${agency.name}**. Je conçois votre voyage idéal à Samarcande, Boukhara et Khiva selon votre budget !`,
    es: `¡Assalomu alaykum y bienvenidos a Uzbekistán! 🇺🇿🕌\n\nSoy su conserje IA en **${agency.name}**. Le ayudo a planificar el viaje perfecto por Samarcanda, Bujará y Jiva ajustado a su presupuesto!`,
    ar: `السلام عليكم وأهلاً بكم في أوزبكستان! 🇺🇿🕌\n\nأنا مساعدكم الذكي في **${agency.name}**. يسعدني تنظيم رحلتكم الساحرة عبر طريق الحرير وفق ميزانيتكم تماماً!`,
    zh: `Assalomu alaykum，热烈欢迎来到乌兹别克斯坦！🇺🇿🕌\n\n我是 **${agency.name}** 的 AI 丝路旅行顾问。我将根据您的预算量身定制撒马尔罕、布哈拉、希瓦及塔什干的精彩旅程！`
  };

  return {
    reply: welcomeReplies[lang] || welcomeReplies.en,
    packages: []
  };
}

module.exports = {
  processUserMessage,
  buildTourPackages,
  extractTravelerDetails
};
