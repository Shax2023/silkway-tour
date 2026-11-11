const fs = require('fs');

let code = fs.readFileSync('D:/Loyiha/ai_agent.js', 'utf8');

// Last day
code = code.replace(
  `time: "08:30 - 09:45",\n        title: "Mehmonxonada to'yimli bufet nonushtasi",`,
  `activity_id: "hotel_buffet_breakfast",\n        time: "08:30 - 09:45",\n        title: "Mehmonxonada to'yimli bufet nonushtasi",`
);
code = code.replace(
  `time: "10:00 - 11:45",\n        title: "Esdalik sovg'alari (Suvenirlar) xaridi va Sharq bozori",`,
  `activity_id: "souvenir_shopping",\n        time: "10:00 - 11:45",\n        title: "Esdalik sovg'alari (Suvenirlar) xaridi va Sharq bozori",`
);
code = code.replace(
  `time: "12:00 - 12:30",\n        title: "Mehmonxonadan rasmiy chiqish (Check-out)",`,
  `activity_id: "hotel_checkout",\n        time: "12:00 - 12:30",\n        title: "Mehmonxonadan rasmiy chiqish (Check-out)",`
);
code = code.replace(
  `time: "12:45 - 14:00",\n        title: "Xayrlashuv shohona tushligi",`,
  `activity_id: "farewell_lunch",\n        time: "12:45 - 14:00",\n        title: "Xayrlashuv shohona tushligi",`
);
code = code.replace(
  `time: "14:15 - 15:30",\n        title: "Xalqaro Aeroportga shaxsiy VIP transfer",`,
  `activity_id: "airport_departure",\n        time: "14:15 - 15:30",\n        title: "Xalqaro Aeroportga shaxsiy VIP transfer",`
);

// First day
code = code.replace(
  `time: "08:30 - 09:30",\n        title: "Aeroportda kutib olish va VIP kutubxona xizmati",`,
  `activity_id: "arr_airport",\n        time: "08:30 - 09:30",\n        title: "Aeroportda kutib olish va VIP kutubxona xizmati",`
);
code = code.replace(
  `time: "09:45 - 10:30",\n        title: "Mehmonxonaga transfer va xonaga joylashish (Check-in)",`,
  `activity_id: "arr_hotel_checkin",\n        time: "09:45 - 10:30",\n        title: "Mehmonxonaga transfer va xonaga joylashish (Check-in)",`
);
code = code.replace(
  `time: "10:45 - 12:45",\n        title: "Hazrati Imom (Xastimom) majmuasi va Muqaddas Usmon Qur'oni",`,
  `activity_id: "hazrati_imom",\n        time: "10:45 - 12:45",\n        title: "Hazrati Imom (Xastimom) majmuasi va Muqaddas Usmon Qur'oni",`
);
code = code.replace(
  `time: "13:00 - 14:15",\n        title: "Milliy Tushlik: \\"Besh Qozon\\" Markaziy Osiyo Palov Markazi",`,
  `activity_id: "besh_qozon",\n        time: "13:00 - 14:15",\n        title: "Milliy Tushlik: \\"Besh Qozon\\" Markaziy Osiyo Palov Markazi",`
);
code = code.replace(
  `time: "14:30 - 16:00",\n        title: "Chorsu Sharq Bozorida rang-barang an'anaviy sayr",`,
  `activity_id: "chorsu_bazaar",\n        time: "14:30 - 16:00",\n        title: "Chorsu Sharq Bozorida rang-barang an'anaviy sayr",`
);
code = code.replace(
  `time: "16:15 - 17:30",\n        title: "Toshkent Metropoliteni me'moriy durdonalari sayohati",`,
  `activity_id: "tashkent_metro",\n        time: "16:15 - 17:30",\n        title: "Toshkent Metropoliteni me'moriy durdonalari sayohati",`
);
code = code.replace(
  `time: "17:45 - 19:15",\n        title: "Amir Temur Xiyoboni va Sayilgoh (Broadway) ko'chasi",`,
  `activity_id: "broadway_walk",\n        time: "17:45 - 19:15",\n        title: "Amir Temur Xiyoboni va Sayilgoh (Broadway) ko'chasi",`
);
code = code.replace(
  `time: "19:30 - 21:30",\n        title: "Xush kelibsiz (Welcome Dinner) tantanali kechki ovqati",`,
  `activity_id: "welcome_dinner",\n        time: "19:30 - 21:30",\n        title: "Xush kelibsiz (Welcome Dinner) tantanali kechki ovqati",`
);

// Train day
code = code.replace(
  `time: "06:30 - 07:15",\n        title: "Ertalabki nonushta va mehmonxonadan chiqish",`,
  `activity_id: "train_morning_checkout",\n        time: "06:30 - 07:15",\n        title: "Ertalabki nonushta va mehmonxonadan chiqish",`
);
code = code.replace(
  `time: "07:15 - 07:30",\n        title: "Temir yo'l vokzalida VIP kutib olish va xavfsizlik nazorati",`,
  `activity_id: "train_station_depart",\n        time: "07:15 - 07:30",\n        title: "Temir yo'l vokzalida VIP kutib olish va xavfsizlik nazorati",`
);
code = code.replace(
  `time: \`\${t.departure_time} - \${t.arrival_time}\`,\n        title: \`\${t.train_name} (\${t.train_number}) poyezdida sayohat\`,`,
  `activity_id: "train_journey",\n        time: \`\${t.departure_time} - \${t.arrival_time}\`,\n        title: \`\${t.train_name} (\${t.train_number}) poyezdida sayohat\`,`
);
code = code.replace(
  `time: \`\${t.arrival_time} - 10:45\`,\n        title: \`\${t.to_city} vokzalida kutib olish va mehmonxonaga transfer\`,`,
  `activity_id: "train_station_arrive",\n        time: \`\${t.arrival_time} - 10:45\`,\n        title: \`\${t.to_city} vokzalida kutib olish va mehmonxonaga transfer\`,`
);
code = code.replace(
  `time: "11:00 - 13:00",\n        title: t.to_city === 'Samarkand' ? "Afsonaviy Registon Maydoni va 3 ta Madrassa mo'jizasi" : (t.to_city === 'Bukhara' ? "Labi Hovuz ansambli va qadimiy savdo gumbazlari" : "Ichan-Qala devorlari ichida tarixiy sayohat"),`,
  `activity_id: t.to_city === 'Samarkand' ? "registan_square" : (t.to_city === 'Bukhara' ? "lyabi_khauz" : "itchan_kala"),\n        time: "11:00 - 13:00",\n        title: t.to_city === 'Samarkand' ? "Afsonaviy Registon Maydoni va 3 ta Madrassa mo'jizasi" : (t.to_city === 'Bukhara' ? "Labi Hovuz ansambli va qadimiy savdo gumbazlari" : "Ichan-Qala devorlari ichida tarixiy sayohat"),`
);
code = code.replace(
  `time: "13:15 - 14:30",\n        title: \`Haqiqiy \${t.to_city} an'anaviy tushligi\`,`,
  `activity_id: t.to_city === 'Samarkand' ? "samarkand_lunch" : (t.to_city === 'Bukhara' ? "bukhara_lunch" : "shivit_oshi"),\n        time: "13:15 - 14:30",\n        title: \`Haqiqiy \${t.to_city} an'anaviy tushligi\`,`
);
code = code.replace(
  `time: "14:45 - 17:00",\n        title: t.to_city === 'Samarkand' ? "Go'ri Amir Maqbarasi va Shohi Zinda me'moriy koridori" : (t.to_city === 'Bukhara' ? "Poi Kalon ansambli va Kalon minorasi" : "Juma masjidi (218 ta o'ymakor ustun) va Tosh Hovli saroyi"),`,
  `activity_id: t.to_city === 'Samarkand' ? "guri_amir" : (t.to_city === 'Bukhara' ? "poi_kalyan_ark" : "juma_mosque"),\n        time: "14:45 - 17:00",\n        title: t.to_city === 'Samarkand' ? "Go'ri Amir Maqbarasi va Shohi Zinda me'moriy koridori" : (t.to_city === 'Bukhara' ? "Poi Kalon ansambli va Kalon minorasi" : "Juma masjidi (218 ta o'ymakor ustun) va Tosh Hovli saroyi"),`
);
code = code.replace(
  `time: "17:30 - 18:30",\n        title: "Mehmonxonada dam olish va kechki libosga tayyorgarlik",`,
  `activity_id: "hotel_relax",\n        time: "17:30 - 18:30",\n        title: "Mehmonxonada dam olish va kechki libosga tayyorgarlik",`
);
code = code.replace(
  `time: "19:00 - 21:00",\n        title: "Oqshomgi yoritilgan obidalar tomoshasi va shohona kechki ovqat",`,
  `activity_id: "panoramic_dinner",\n        time: "19:00 - 21:00",\n        title: "Oqshomgi yoritilgan obidalar tomoshasi va shohona kechki ovqat",`
);

// Samarkand
code = code.replace(
  `time: "08:00 - 09:00",\n        title: "Mehmonxonada to'yimli bufet nonushtasi",`,
  `activity_id: "hotel_buffet_breakfast",\n        time: "08:00 - 09:00",\n        title: "Mehmonxonada to'yimli bufet nonushtasi",`
);
code = code.replace(
  `time: "09:15 - 11:30",\n        title: "Shohi Zinda moviy maqbaralar xiyoboni",`,
  `activity_id: "shohi_zinda",\n        time: "09:15 - 11:30",\n        title: "Shohi Zinda moviy maqbaralar xiyoboni",`
);
code = code.replace(
  `time: "11:45 - 13:00",\n        title: "Mirzo Ulug'bek Rasadxonasi va Sekstant muzeyi",`,
  `activity_id: "ulugh_beg",\n        time: "11:45 - 13:00",\n        title: "Mirzo Ulug'bek Rasadxonasi va Sekstant muzeyi",`
);
code = code.replace(
  `time: "13:15 - 14:30",\n        title: "Tushlik: Samarqandcha Tandir Go'shti va Manti",`,
  `activity_id: "tandir_meat",\n        time: "13:15 - 14:30",\n        title: "Tushlik: Samarqandcha Tandir Go'shti va Manti",`
);
code = code.replace(
  `time: "14:45 - 16:45",\n        title: "Konigil qadimiy Ipak Qog'oz fabrikasi mahorat darsi",`,
  `activity_id: "konigil_paper",\n        time: "14:45 - 16:45",\n        title: "Konigil qadimiy Ipak Qog'oz fabrikasi mahorat darsi",`
);
code = code.replace(
  `time: "17:00 - 18:30",\n        title: "Bibi Xonim Jome Masjidi va Siyob Bozorida halvo xaridi",`,
  `activity_id: "bibi_khanym",\n        time: "17:00 - 18:30",\n        title: "Bibi Xonim Jome Masjidi va Siyob Bozorida halvo xaridi",`
);
code = code.replace(
  `time: "19:00 - 21:00",\n        title: "Kechki Registon nurlari ostida kechki ovqat",`,
  `activity_id: "registan_dinner",\n        time: "19:00 - 21:00",\n        title: "Kechki Registon nurlari ostida kechki ovqat",`
);

// Bukhara
code = code.replace(
  `time: "08:00 - 09:00",\n        title: "Buxorocha shirinliklar bilan ertalabki nonushta",`,
  `activity_id: "hotel_buffet_breakfast",\n        time: "08:00 - 09:00",\n        title: "Buxorocha shirinliklar bilan ertalabki nonushta",`
);
code = code.replace(
  `time: "09:15 - 11:30",\n        title: "Poi Kalon Majmuasi va Buxoro Arki qal'asi",`,
  `activity_id: "poi_kalyan_ark",\n        time: "09:15 - 11:30",\n        title: "Poi Kalon Majmuasi va Buxoro Arki qal'asi",`
);
code = code.replace(
  `time: "11:45 - 13:00",\n        title: "Bolo Hovuz masjidi va Ismoil Somoniy maqbarasi",`,
  `activity_id: "bolo_hauz",\n        time: "11:45 - 13:00",\n        title: "Bolo Hovuz masjidi va Ismoil Somoniy maqbarasi",`
);
code = code.replace(
  `time: "13:15 - 14:30",\n        title: "Tushlik: Buxorocha No'xat Shurvak va Qozon Kabob",`,
  `activity_id: "bukhara_lunch",\n        time: "13:15 - 14:30",\n        title: "Tushlik: Buxorocha No'xat Shurvak va Qozon Kabob",`
);
code = code.replace(
  `time: "14:45 - 16:45",\n        title: "Sitorai Mohi Xosa: So'nggi Buxoro Amirining Yozgi Saroyi",`,
  `activity_id: "sitorai_mokhi",\n        time: "14:45 - 16:45",\n        title: "Sitorai Mohi Xosa: So'nggi Buxoro Amirining Yozgi Saroyi",`
);
code = code.replace(
  `time: "17:00 - 18:30",\n        title: "Chor Minor (To'rt Minora) va Ipak gilamlari to'qish ustaxonasi",`,
  `activity_id: "chor_minor",\n        time: "17:00 - 18:30",\n        title: "Chor Minor (To'rt Minora) va Ipak gilamlari to'qish ustaxonasi",`
);
code = code.replace(
  `time: "19:00 - 21:30",\n        title: "Nodir Devonbegi Madrasasida Jonli Folklor va Moda Namoyishi",`,
  `activity_id: "nodir_devonbegi",\n        time: "19:00 - 21:30",\n        title: "Nodir Devonbegi Madrasasida Jonli Folklor va Moda Namoyishi",`
);

// Khiva
code = code.replace(
  `time: "08:00 - 09:00",\n        title: "Ichan-Qala ichida xonona nonushta",`,
  `activity_id: "hotel_buffet_breakfast",\n        time: "08:00 - 09:00",\n        title: "Ichan-Qala ichida xonona nonushta",`
);
code = code.replace(
  `time: "09:15 - 11:30",\n        title: "Ko'hna Ark Qal'asi va Muhammad Amin-xon Madrasasi",`,
  `activity_id: "kuhna_ark",\n        time: "09:15 - 11:30",\n        title: "Ko'hna Ark Qal'asi va Muhammad Amin-xon Madrasasi",`
);
code = code.replace(
  `time: "11:45 - 13:00",\n        title: "Juma Masjidi: 218 ta betakror o'ymakor yog'och ustunlar",`,
  `activity_id: "juma_mosque",\n        time: "11:45 - 13:00",\n        title: "Juma Masjidi: 218 ta betakror o'ymakor yog'och ustunlar",`
);
code = code.replace(
  `time: "13:15 - 14:30",\n        title: "Xorazm milliy tushligi: \\"Shivit Oshi\\" va \\"Tuxum Barak\\"",`,
  `activity_id: "shivit_oshi",\n        time: "13:15 - 14:30",\n        title: "Xorazm milliy tushligi: \\"Shivit Oshi\\" va \\"Tuxum Barak\\"",`
);
code = code.replace(
  `time: "14:45 - 16:30",\n        title: "Tosh Hovli Saroyi (Xonning tosh saroyi va Harami)",`,
  `activity_id: "tosh_hovli",\n        time: "14:45 - 16:30",\n        title: "Tosh Hovli Saroyi (Xonning tosh saroyi va Harami)",`
);
code = code.replace(
  `time: "16:45 - 18:15",\n        title: "Islom Xo'ja Minorasi (O'zbekistondagi eng baland minora)",`,
  `activity_id: "islam_khodja",\n        time: "16:45 - 18:15",\n        title: "Islom Xo'ja Minorasi (O'zbekistondagi eng baland minora)",`
);
code = code.replace(
  `time: "18:30 - 19:30",\n        title: "Yog'och o'ymakorligi va Xiva gilamlari ustaxonasida erkin vaqt",`,
  `activity_id: "wood_carving",\n        time: "18:30 - 19:30",\n        title: "Yog'och o'ymakorligi va Xiva gilamlari ustaxonasida erkin vaqt",`
);
code = code.replace(
  `time: "19:45 - 21:45",\n        title: "Olovlar va mash'allar ostida shohona kechki ovqat & Xorazm Lazgisi",`,
  `activity_id: "khorezm_lazgi",\n        time: "19:45 - 21:45",\n        title: "Olovlar va mash'allar ostida shohona kechki ovqat & Xorazm Lazgisi",`
);

fs.writeFileSync('D:/Loyiha/ai_agent.js', code, 'utf8');
console.log('ai_agent.js updated with activity_ids!');
