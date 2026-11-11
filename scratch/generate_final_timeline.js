const fs = require('fs');

const CATALOG = {
  arr_airport: {
    match: ['aeroportda kutib olish', 'kutubxona xizmati', 'terminal 2', 'airport meet'],
    title: {
      en: "Airport VIP Meet & Greet & Concierge Service",
      uz: "Aeroportda VIP kutib olish va xushomad xizmati",
      ru: "VIP встреча в аэропорту и консьерж-сервис",
      tr: "Havalimanında VIP Karşılama ve Konsiyerj Hizmeti",
      de: "VIP-Empfang am Flughafen & Concierge-Service",
      fr: "Accueil VIP à l'aéroport & Service conciergerie",
      es: "Recepción VIP en el aeropuerto y servicio de conserjería",
      ar: "استقبال VIP في المطار وخدمة الكونسيرج",
      zh: "机场VIP迎宾与贵宾礼宾服务"
    },
    description: {
      en: "Your dedicated chauffeur and certified guide meet you holding a personalized name sign. Full assistance with baggage handling, currency exchange, and setting up a local high-speed 5G tourist eSIM/SIM card.",
      uz: "Shaxsiy haydovchi va litsenziyali tajribali gid aeroportda ismingiz yozilgan maxsus tablichka bilan kutib oladi. Yuklarni joylashtirish, valyuta ayirboshlash va mahalliy tezyurar 5G SIM-karta olishda to'liq ko'maklashiladi.",
      ru: "Индивидуальный водитель и лицензированный гид встречают с именной табличкой. Полная помощь с багажом, обменом валюты и подключением местной скоростной туристической 5G SIM-карты.",
      tr: "Özel şoförünüz ve lisanslı rehberiniz sizi isim tabelasıyla karşılar. Bagaj taşıma, döviz bozdurma ve yerel hızlı 5G turist SIM kartı temininde eksiksiz destek sağlanır.",
      de: "Ihr persönlicher Chauffeur und lizenzierter Guide empfangen Sie mit Namensschild. Vollständige Unterstützung bei Gepäck, Geldwechsel und Aktivierung einer lokalen 5G-SIM-Karte.",
      fr: "Votre chauffeur privé et guide certifié vous accueillent avec panneau nominatif. Prise en charge des bagages, change de devises et activation d'une carte SIM/eSIM 5G locale.",
      es: "Su chófer privado y guía certificado le reciben con cartel nominal. Asistencia total con equipaje, cambio de divisa y activación de tarjeta SIM 5G turística local.",
      ar: "سائقك الخاص ومرشدك المعتمد يستقبلانك بلافتة اسم مخصصة. مساعدة كاملة في الأمتعة وصرف العملات وتشغيل شريحة اتصال 5G سياحية محلية.",
      zh: "专属中文/英文导游与专车司机在接机大厅持姓名牌迎接。全程协助行李搬运、外币兑换及办理乌兹别克斯坦高速5G旅游电话卡。"
    }
  },

  arr_hotel_checkin: {
    match: ['mehmonxonaga transfer va xonaga joylashish', 'xonaga joylashish (check-in)'],
    title: {
      en: "Hotel Transfer & Seamless Room Check-in",
      uz: "Mehmonxonaga transfer va xonaga joylashish (Check-in)",
      ru: "Трансфер в отель и комфортное заселение (Check-in)",
      tr: "Otele Transfer ve Odaya Yerleşme (Check-in)",
      de: "Hoteltransfer & Reibungsloser Check-in",
      fr: "Transfert à l'hôtel et installation dans la chambre",
      es: "Traslado al hotel y registro en la habitación",
      ar: "الانتقال إلى الفندق وتسجيل الوصول في الغرفة",
      zh: "专车送至星级酒店办理快捷入住"
    },
    description: {
      en: "Direct transfer to our partner hotel via private air-conditioned vehicle. Enjoy priority express check-in, unpack, freshen up, and relax before setting out on your journey.",
      uz: "Shartnomali hamkor mehmonxonaga qulay transfer, tezkor imtiyozli ro'yxatdan o'tish, xonaga joylashish, dush va qisqa hordiq chiqarish.",
      ru: "Индивидуальный трансфер в отель-партнер на автомобиле с кондиционером. Экспресс-заселение без очередей, распаковка вещей, отдых и подготовка к первому дню тура.",
      tr: "Klimalı konforlu araçla anlaşmalı otele transfer. Sıra beklemeden hızlı check-in, odaya yerleşme, dinlenme ve tur öncesi ferahlama.",
      de: "Direkter Transfer zum Partnerhotel im klimatisierten Wagen. Bequemer Express-Check-in, Zeit zum Auspacken, Erfrischen und Einstimmen auf die Reise.",
      fr: "Transfert privé vers l'hôtel partenaire en véhicule climatisé. Enregistrement express prioritaire, installation dans la chambre et temps de repos.",
      es: "Traslado directo al hotel en vehículo privado con aire acondicionado. Check-in prioritario exprés, acomodación en la habitación y breve descanso.",
      ar: "انتقال مباشر إلى فندق الشريك في سيارة مكيفة خاصة. تسجيل وصول فوري وميسر، ترتيب الأمتعة والاسترخاء قبل بدء الجولة.",
      zh: "乘坐专属空调商务车直达合作星级酒店，享受快速免排队入住通道，洗漱更衣并稍作休整。"
    }
  },

  hazrati_imom: {
    match: ['hazrati imom', 'xastimom', 'usmon qur', 'baroqxon'],
    title: {
      en: "Hazrati Imam Complex & The Holy Uthman Quran",
      uz: "Hazrati Imom (Xastimom) majmuasi va Muqaddas Usmon Qur'oni",
      ru: "Комплекс Хазрати Имам и Священный Коран Усмана",
      tr: "Hazreti İmam Külliyesi ve Kutsal Hz. Osman Mushafı",
      de: "Hazrati-Imam-Komplex & Der Heilige Osman-Koran",
      fr: "Complexe Hazrati Imam & Le Saint Coran d'Othman",
      es: "Complejo Hazrati Imam y el Sagrado Corán de Uthman",
      ar: "مجمع حضرة الإمام ومصحف عثمان المقدس",
      zh: "哈兹拉蒂·伊玛目建筑群与奥斯曼古兰经"
    },
    description: {
      en: "Comprehensive guided tour of Muyi Mubarak Madrasah, guardian of the world's oldest surviving 7th-century Quran penned on deerskin, along with Barak Khan Madrasah and Kaffal Shashi Mausoleum.",
      uz: "VII asrga oid kiyik terisiga yozilgan dunyodagi eng qadimiy Usmon Qur'oni saqlanadigan Mo'yi Muborak madrasasi, Baroqxon madrasasi va Qaffol Shoshiy maqbarasi bo'ylab chuqur tarixiy ekskursiya.",
      ru: "Экскурсия с гидом по медресе Муйи Мубарак, где хранится древнейший в мире Коран Усмана VII века на оленьей коже, медресе Баракхан и мавзолею Каффаля Шаши.",
      tr: "Muyi Mübarek Medresesi'nde ceylan derisine yazılmış 7. yüzyıl Hz. Osman Mushafı, Barakhan Medresesi ve Kaffal Şaşi Türbesi boyunca derinlemesine rehberli tur.",
      de: "Führung durch die Muyi-Mubarak-Medrese mit dem ältesten erhaltenen Koran der Welt (7. Jh. auf Hirschpergament) sowie die Barak-Chan-Medrese.",
      fr: "Visite guidée de la médersa Mouyi Moubarak abritant le plus ancien Coran du monde (VIIe siècle sur peau de cerf), et de la médersa Barak-Khan.",
      es: "Visita guiada a la madrasa Muyi Mubarak con el Corán de Uthman más antiguo del mundo del siglo VII, la madrasa Barak Jan y mausoleos.",
      ar: "جولة تاريخية شاملة في مدرسة موي مبارك التي تحتضن أقدم مصحف في العالم من القرن السابع مكتوباً على جلد الغزال ومدرسة باراق خان.",
      zh: "专业讲师导览穆伊·穆巴拉克神学院（珍藏7世纪现存最古老羊皮纸奥斯曼古兰经原件）、巴拉克汗神学院及卡法尔·沙希陵墓。"
    }
  },

  besh_qozon: {
    match: ['besh qozon', 'palov markazi', 'markaziy osiyo palov'],
    title: {
      en: 'National Lunch: "Besh Qozon" Central Asian Plov Centre',
      uz: 'Milliy Tushlik: "Besh Qozon" Markaziy Osiyo Palov Markazi',
      ru: 'Национальный обед: Центр плова "Беш Козон"',
      tr: 'Geleneksel Öğle Yemeği: "Beş Kazan" Orta Asya Pilav Merkezi',
      de: 'Traditionelles Mittagessen: Zentralasiatisches Plow-Zentrum "Besh Qozon"',
      fr: "Déjeuner traditionnel : Centre du Plov d'Asie Centrale \"Besh Qozon\"",
      es: 'Almuerzo tradicional: Centro de Plov de Asia Central "Besh Qozon"',
      ar: 'غداء تقليدي: مركز أوزبكستان للرز البخاري "بيش قازان"',
      zh: '特色午餐：“别什锅”（Besh Qozon）中亚手抓饭中心'
    },
    description: {
      en: "Savor festive wedding plov prepared in colossal cast-iron cauldrons over open fires, adorned with tender beef, quail eggs, traditional kazy, and crisp sliced tomato-onion achichuk salad.",
      uz: "Ulkan cho'yan qozonlarda damlangan mashhur Toshkent to'y palovi, bedana tuxumlari, kazy va yangi achchiq-chuchuk salati bilan lazzatlanish.",
      ru: "Дегустация знаменитого ташкентского праздничного плова, сваренного в колоссальных чугунных казанах на живом огне с говядиной, казы, перепелиными яйцами и салатом ачик-чучук.",
      tr: "Devasa döküm kazanlarda odun ateşinde demlenen meşhur Taşkent düğün pilavı, taze kazy, bıldırcın yumurtası ve nefis açuk-çüçük salatası eşliğinde lezzet şöleni.",
      de: "Genuss des berühmten Taschkenter Festtags-Plows aus kolossalen Gusseisenkesseln über offenem Feuer mit zartem Fleisch, Kazy und frischem Tomatensalat.",
      fr: "Dégustation du célèbre plov de mariage de Tachkent cuit dans de gigantesques chaudrons au feu de bois, servi avec kazy et salade achichuk.",
      es: "Almuerzo con el famoso plov festivo de Taskent cocinado en calderos de hierro gigantes a leña, con kazy, huevos de codorniz y ensalada achichuk.",
      ar: "تذوق أشهى أطباق الرز البخاري الأوزبكي الاحتفالي المطهو في قدور ضخمة على الحطب مع لحم العجل الطري والقاضي وسلطة الأتشيك تشوتشوك.",
      zh: "现场观摩巨型大铁锅柴火烹调塔什干喜庆手抓饭，搭配鲜嫩牛肉、马肉香肠（Kazy）、鹌鹑蛋及爽口番茄洋葱沙拉。"
    }
  },

  chorsu_bazaar: {
    match: ['chorsu', 'sharq bozorida rang-barang', 'qadimiy markaziy bozor'],
    title: {
      en: "Chorsu Oriental Bazaar: Colors, Spices & Crafts",
      uz: "Chorsu Sharq Bozorida rang-barang an'anaviy sayr",
      ru: "Восточный базар Чорсу: Краски, специи и ремесла",
      tr: "Çorsu Doğu Pazarı: Renkler, Baharatlar ve Zanaatlar",
      de: "Orientalischer Basar Tschorsu: Farben, Gewürze & Handwerk",
      fr: "Bazar oriental de Chorsu : Couleurs, épices et artisanat",
      es: "Bazar oriental Chorsu: Colores, especias y artesanías",
      ar: "بازار تشورسو الشرقي: ألوان وتوابل وحرف يدوية",
      zh: "楚苏（Chorsu）古老东方穹顶大巴扎巡游"
    },
    description: {
      en: "Stroll beneath the grand turquoise dome among vibrant open-air stalls overflowing with mountain spices, dried fruits (sultanas, almonds, dried melons), handmade ceramics, and traditional skullcaps.",
      uz: "Ushbu afsonaviy moviy gumbaz ostidagi tog' ziravorlari, sara quruq mevalar (bodom, mayiz, qovun qoqisi), kulolchilik va o'zbek milliy do'ppilari rastalari bo'ylab rang-barang sayr.",
      ru: "Прогулка под легендарным лазурным куполом среди красочных прилавков с горными специями, сухофруктами (миндаль, изюм, сушеная дыня), керамикой Риштана и тюбетейками.",
      tr: "Muazzam turkuaz kubbenin altında dağ baharatları, taze kuru yemişler, el yapımı seramikler ve geleneksel Özbek takkeleriyle dolu canlı pazarda keyifli yürüyüş.",
      de: "Spaziergang unter der monumentalen türkisfarbenen Kuppel zwischen bunten Ständen mit Bergkräutern, Nüssen, getrockneten Melonen und Kunsthandwerk.",
      fr: "Promenade sous la majestueuse coupole turquoise parmi les étals débordants d'épices de montagne, de fruits secs, de céramiques et de calottes brodées.",
      es: "Paseo bajo la emblemática cúpula turquesa entre puestos de especias, frutos secos, cerámica artesanal y gorros tradicionales uzbekos.",
      ar: "جولة ساحرة تحت القبة الفيروزية الضخمة بين أكشاك التوابل الجبلية والفواكه المجففة والأواني الخزفية اليدوية والطواقي الأوزبكية المطرزة.",
      zh: "漫步在标志性巨大蓝色穹顶下，探访琳琅满目的山地纯天然香料、葡萄干、巴旦木杏仁、里什坦彩绘陶瓷与传统手工花帽摊位。"
    }
  },

  tashkent_metro: {
    match: ['metropoliteni', 'metro bekatlari', 'alisher navoi, kosmonavtlar'],
    title: {
      en: "Tashkent Metro: Underground Architectural Masterpieces",
      uz: "Toshkent Metropoliteni me'moriy durdonalari sayohati",
      ru: "Ташкентский метрополитен: Шедевры подземной архитектуры",
      tr: "Taşkent Metrosu: Yeraltı Mimari Başyapıtları Turu",
      de: "Taschkenter U-Bahn: Unterirdische Architektur-Meisterwerke",
      fr: "Métro de Tachkent : Joyaux de l'architecture souterraine",
      es: "Metro de Taskent: Joyas arquitectónicas subterráneas",
      ar: "مترو طشقند: روائع معمارية تحت الأرض",
      zh: "塔什干地铁：地下艺术宫殿与历史空间漫游"
    },
    description: {
      en: "Ride through Central Asia's premier subway system, admiring stations carved like subterranean palaces with polished marble, crystal chandeliers, granite mosaics, and Uzbek poetic motifs.",
      uz: "Har biri alohida yerosti muzeyini eslatuvchi marmar, billur qandillar va granit mozaikalar bilan bezatilgan Alisher Navoiy va Kosmonavtlar metro bekatlari bo'ylab sayohat.",
      ru: "Поездка по первому метрополитену Центральной Азии. Осмотр станций-дворцов «Алишер Навои», «Космонавтов» и «Мустакиллик» с мрамором, хрусталем и гранитными мозаиками.",
      tr: "Orta Asya'nın ilk metrosunda mermer sütunlar, kristal avizeler ve mozaiklerle bezenmiş yer altı saraylarını andıran görkemli istasyonlarda kısa gezi.",
      de: "Fahrt mit der ältesten U-Bahn Zentralasiens. Entdeckung unterirdischer Paläste aus poliertem Marmor, Kristallkronleuchtern und kunstvollen Granitmosaiken.",
      fr: "Visite des somptueuses stations du métro de Tachkent, véritables palais souterrains ornés de marbre noble, lustres en cristal et mosaïques poétiques.",
      es: "Recorrido por el metro de Taskent, descubriendo estaciones subterráneas que parecen palacios de mármol pulido, lámparas de cristal y mosaicos.",
      ar: "جولة عبر محطات مترو طشقند التي تشبه قصوراً رخامية تحت الأرض مزينة بالثريات الكريستالية وجداريات الموزاييك الفنية الفاخرة.",
      zh: "乘坐中亚历史最悠久的地铁，探访纳沃伊站与宇航员站等犹如地下艺术宫殿般的车站，欣赏精美的大理石浮雕与水晶吊灯。"
    }
  },

  broadway_walk: {
    match: ['amir temur xiyoboni', 'broadway', 'sayilgoh'],
    title: {
      en: "Amir Timur Square & Broadway Promenade Walk",
      uz: "Amir Temur Xiyoboni va Sayilgoh (Broadway) ko'chasi",
      ru: "Сквер Амира Темура и прогулка по Бродвею (Сайилгох)",
      tr: "Emir Timur Meydanı ve Broadway Yürüyüş Caddesi",
      de: "Amir-Timur-Platz & Broadway-Flaniermeile",
      fr: "Place Amir Timour & Promenade du Broadway (Sayilgoh)",
      es: "Plaza Amir Timur y paseo por la calle Broadway",
      ar: "ساحة أمير تيمور وممشى برودواي الترفيهي",
      zh: "帖木儿广场与“百老汇”（Sayilgoh）林荫步行街"
    },
    description: {
      en: "Relaxing twilight stroll past the heroic statue of Amir Timur, the iconic Tashkent Chimes, and pedestrian Broadway animated by local street artists, portrait painters, and craftsmen.",
      uz: "Sohibqiron Amir Temur haykali, afsonaviy Toshkent Kurantlari va ko'cha rassomlari ijod qiladigan Sayilgoh xiyobonida yoqimli shom sayri.",
      ru: "Приятная вечерняя прогулка мимо монумента Амиру Темуру, знаменитых Ташкентских курантов и пешеходной улицы Сайилгох с уличными художниками и музыкантами.",
      tr: "Emir Timur heykeli, tarihi Taşkent Saat Kulesi ve sokak sanatçılarının tablolar sergilediği cıvıl cıvıl Broadway caddesinde akşam yürüyüşü.",
      de: "Abendlicher Spaziergang vorbei am Reiterdenkmal von Amir Timur, dem Glockenturm und der lebhaften Fußgängerzone mit Straßenmalern und Musikern.",
      fr: "Agréable promenade en soirée devant la statue équestre d'Amir Timour, le carillon de Tachkent et l'avenue piétonne bordée d'artistes peintres.",
      es: "Agradable paseo al atardecer por la estatua de Amir Timur, el famoso reloj de Taskent y la animada calle peatonal con pintores al aire libre.",
      ar: "نزهة مسائية ممتعة حول تمثال القائد أمير تيمور وبرج الساعة الشهير وممشى برودواي النابض بالرسامين والموسيقيين الشعبيين.",
      zh: "傍晚漫步于帖木儿大帝雕像广场、标志性塔什干大钟楼及汇聚民间街头画家与手艺人的百老汇艺术步行街。"
    }
  },

  welcome_dinner: {
    match: ['welcome dinner', 'xush kelibsiz', 'tantanali kechki'],
    title: {
      en: "Gala Welcome Dinner & Live Oriental Music",
      uz: "Xush kelibsiz (Welcome Dinner) tantanali kechki ovqati",
      ru: "Торжественный приветственный ужин с живой музыкой",
      tr: "Hoş Geldiniz Gala Akşam Yemeği ve Canlı Doğu Müziği",
      de: "Festliches Willkommens-Dinner mit traditioneller Live-Musik",
      fr: "Dîner de bienvenue festif et musique orientale live",
      es: "Cena de bienvenida de gala con música oriental en vivo",
      ar: "عشاء ترحيبي فاخر مع موسيقى شرقية حية",
      zh: "欢迎晚宴：品尝国宴级乌兹别克名菜与传统东方民乐演奏"
    },
    description: {
      en: "An opulent multi-course feast introducing Uzbek hospitality: tender charcoal shashlik skewers, slow-simmered dimlama stew, piping hot tandoor bread, accompanied by melodies of dutar and doira.",
      uz: "Shohona milliy shashliklar assortisi, tandir nonlari, tansiq gazaklar va jonli sharqona milliy musiqa sadolari ostida unutilmas hordiq.",
      ru: "Роскошный праздничный ужин с шашлыками на углях, ароматным димляма, хрустящими лепешками из тандыра под аккомпанемент традиционных струнных инструментов.",
      tr: "Közde kuzu şiş kebapları, fırından yeni çıkmış sıcak tandır ekmekleri ve canlı Özbek ezgileri eşliğinde unutulmaz karşılama ziyafeti.",
      de: "Festliches mehrgängiges Menü mit Grillspezialitäten, Dimlama, ofenfrischem Tandir-Brot und stimmungsvoller traditioneller Seidenstraßen-Musik.",
      fr: "Festin d'accueil royal composé de brochettes de chachlyk braisées, ragoût dimlama, pain au tandoor chaud et musiques traditionnelles.",
      es: "Cena de gala con una selección de brochetas shashlik al carbón, panes calientes de tandir y música tradicional en vivo con instrumentos orientales.",
      ar: "مأدبة عشاء ملكية حافلة بمشاوي الشاشليك الفاخرة وخبز التنور الساخن مع ألحان شرقية حية ساحرة على آلات الدوتار والدف.",
      zh: "尊享浓郁中亚风情的欢迎晚宴：炭火多汁烤肉串（Shashlik）、焖炖牛肉、热气腾腾的刚出炉馕饼，佐以都塔尔琴现场伴奏。"
    }
  },

  // === TRAIN TRANSFER DAY SPECIFIC SIGHTSEEING ===
  registan_square: {
    match: ['afsonaviy registon', '3 ta madrassa mo', 'registon maydoni'],
    title: {
      en: "Legendary Registan Square: 3 Architectural Masterpieces",
      uz: "Afsonaviy Registon Maydoni va 3 ta Madrassa mo'jizasi",
      ru: "Легендарная площадь Регистан: 3 шедевра медресе",
      tr: "Efsanevi Registan Meydanı ve 3 Medrese Şaheseri",
      de: "Legendärer Registan-Platz: 3 Meisterwerk-Medresen",
      fr: "Légendaire place du Régistan : Les 3 madrasas magistrales",
      es: "Mítica Plaza de Registán: Las 3 madrasas maestras",
      ar: "ساحة ريجستان الأسطورية: روائع المدارس الثلاث",
      zh: "传奇雷吉斯坦广场：三大神学院建筑奇迹"
    },
    description: {
      en: "Stand in awe before the three monumental madrasahs of Registan: Ulugh Beg, Sher-Dor with its roaring lion mosaics, and the gilded dome of Tilla-Kori.",
      uz: "Ulug'bek, Sherdor va Tilla-Kori madrasalari: tilla suvi yugurtirilgan gumbazlar va arxitektura sirlari bo'ylab professional gid hamrohligida ekskursiya.",
      ru: "Экскурсия с профессиональным гидом по трем медресе Регистана: Улугбека, Шер-Дор с мозаиками барсов и Тилля-Кари с куполом из чистого сусального золота.",
      tr: "Registan'ın üç anıtsal medresesi: Uluğ Bey, kaplan mozaikli Şir-Dor ve kubbesi saf altınla kaplı Tilla-Kari medreselerinde rehberli tur.",
      de: "Führung zu den drei weltberühmten Medresen des Registan: Ulugh Beg, Scher-Dor mit Tigermosaiken und Tilla-Kori mit vergoldeter Kuppel.",
      fr: "Visite guidée des trois médersas magistrales du Régistan : Oulough Beg, Cher-Dor aux tigres rugissants et Tilla-Kori à la coupole d'or.",
      es: "Visita guiada a las tres madrasas de Registán: Ulugh Beg, Sher-Dor con mosaicos de leones y la cúpula dorada de Tilla-Kori.",
      ar: "جولة إرشادية بين المدارس الثلاث العظيمة في ريجستان: مدرسة أولوغ بيك، ومدرسة شير دور بفسيفساء النمور، ومدرسة طلا كاري بقبتها المذهبة.",
      zh: "专业向导带领瞻仰雷吉斯坦广场三大旷世神学院：兀鲁伯神学院、以狮虎图腾马赛克闻名的希尔·多尔神学院及内部贴满纯金金箔的蒂拉·卡里神学院。"
    }
  },

  lyabi_khauz: {
    match: ['labi hovuz', 'lyabi khauz', 'savdo gumbazlari'],
    title: {
      en: "Lyabi-Khauz Ensemble & Ancient Silk Trading Domes",
      uz: "Labi Hovuz ansambli va qadimiy savdo gumbazlari",
      ru: "Ансамбль Ляби-Хауз и старинные торговые купола",
      tr: "Labi Havuz Külliyesi ve Tarihi Ticaret Kümbetleri",
      de: "Ensemble Lyabi-Chauz & Historische Handelskuppeln",
      fr: "Ensemble de Lyabi-Khauz et coupoles marchandes de la soie",
      es: "Conjunto Lyabi-Khauz y antiguas cúpulas comerciales de la seda",
      ar: "مجمع حوض لابي التاريخي وقباب تجارة الحرير القديمة",
      zh: "利亚比哈乌兹（Lyabi-Khauz）古池绿荫建筑群与丝路圆顶古商市"
    },
    description: {
      en: "Relax beneath centuries-old mulberry trees around Lyabi-Khauz pool, visit Kukeldash Madrasah, and explore the ancient dome bazaars of jewelers, cap-makers, and money changers.",
      uz: "Asriy chinorlar soyasidagi Labi Hovuz, Ko'kaldosh madrasasi va qadimiy ipak bozorlari gumbazlari bo'ylab sayohat.",
      ru: "Прогулка в тени вековых тут вокруг водоема Ляби-Хауз, осмотр медресе Кукельдаш и старинных куполов ювелиров (Токи Заргарон) и менял.",
      tr: "Asırlık ağaçlar altındaki Labi Havuz çevresi, Kükeltaş Medresesi ve tarihi ipek ticaret kubbelerinde keyifli bir yürüyüş.",
      de: "Erholung im Schatten uralter Maulbeerbäume am Lyabi-Chauz-Wasserbecken und Rundgang durch die historischen Kuppelbasare.",
      fr: "Promenade ombragée autour du bassin de Lyabi-Khauz, visite de la médersa Koukeldash et des coupoles marchandes médiévales.",
      es: "Paseo a la sombra de moreras centenarias junto al estanque de Lyabi-Khauz y exploración de las cúpulas comerciales medievales.",
      ar: "استراحة في ظلال أشجار التوت العريقة حول بركة حوض لابي، وزيارة مدرسة كوكلداش والقباب التجارية الأثرية للصاغة والتجار.",
      zh: "漫步于数百年老桑树浓荫掩映的利亚比水池畔，探访库克尔达什神学院，穿行于钱币穹顶、金银首饰穹顶与香料圆顶古市集。"
    }
  },

  itchan_kala: {
    match: ['ichan-qala devorlari ichida', 'ichan-qala ichidagi ota darvoza'],
    title: {
      en: "Inside Itchan Kala Fortress: Living Open-Air Museum",
      uz: "Ichan-Qala devorlari ichida tarixiy sayohat",
      ru: "Путешествие сквозь века за стенами Ичан-Калы",
      tr: "İçan Kale Surları İçinde Masalsı Bir Yolculuk",
      de: "Reise durch die Jahrhunderte in der Festung Itchan-Kala",
      fr: "Voyage à travers les siècles dans la forteresse d'Itchan Kala",
      es: "Viaje a través de los siglos dentro de la fortaleza Itchan Kala",
      ar: "رحلة تاريخية ساحرة داخل أسوار قلعة إيتشان كالا",
      zh: "穿行于希瓦伊钦卡拉古要塞土墙之间的时光漫游"
    },
    description: {
      en: "Pass through the western Ota Darvoza gate into an intact mud-brick city of minarets, madrasahs, and palaces preserving 1,000 years of Silk Road history.",
      uz: "Ichan-Qala ichidagi Ota Darvoza, Kalta Minor firuza minorasi va Ko'hna Ark qasri bo'ylab tarixiy sayohat.",
      ru: "Вход через ворота Ата-Дарваза в настоящий музей под открытым небом: бирюзовый минарет Кальта-Минар и резиденция ханов Куня-Арк.",
      tr: "Ata Kapısı'ndan geçerek açık hava müzesi niteliğindeki İçan Kale'ye giriş; turkuaz Kalta Minor ve Kunya Ark sarayı keşfi.",
      de: "Durchschreiten des Tores Ota Darvoza in eine intakte Lehmziegelstadt mit dem Türkis-Minarett Kalta Minor und dem Khan-Palast.",
      fr: "Entrée par la porte Ota Darvoza dans une ville préservée aux ruelles de terre cuite, minaret Kalta Minor et palais Kunya-Ark.",
      es: "Paso por la puerta Ota Darvoza a una ciudad de adobe intacta, descubriendo el alminar turquesa Kalta Minor y el palacio Kunya-Ark.",
      ar: "الدخول من بوابة آتا دارفازا العريقة إلى متحف حي مفتوح من الطين والآجر يضم مئذنة كالتا مينار الفيروزية وقصر كوهنا أرك.",
      zh: "穿过西门阿塔门踏入仿佛凝固在千年前的生土露天博物馆，近距离仰望未完工的孔雀蓝短宣礼塔（Kalta Minor）与古城堡。"
    }
  },

  samarkand_lunch: {
    match: ['samarqand an', 'samarqandcha qat-qat palov'],
    title: {
      en: "Authentic Samarkand Plov & Meat Delicacies",
      uz: "Haqiqiy Samarqand an'anaviy tushligi",
      ru: "Настоящий самаркандский традиционный обед",
      tr: "Hakiki Semerkant Geleneksel Öğle Yemeği",
      de: "Authentisches Samarkander Traditions-Mittagessen",
      fr: "Déjeuner traditionnel authentique de Samarcande",
      es: "Almuerzo tradicional auténtico de Samarcanda",
      ar: "غداء سمرقندي أصيل مع الأرز البخاري التقليدي",
      zh: "地道撒马尔罕分层手抓饭特色午餐"
    },
    description: {
      en: "Sample Samarkand's distinctive layered plov cooked with sweet yellow carrots, chickpeas, and tender beef, accompanied by tomato salads and green tea.",
      uz: "Mashhur Samarqandcha qat-qat palov, bodring-pomidor salatlari va xushbo'y ko'k choy bilan tansiq tushlik.",
      ru: "Дегустация знаменитого самаркандского слоеного плова с желтой морковью, нутом и говядиной, свежих салатов и душистого зеленого чая.",
      tr: "Sarı havuç ve nohutla kat kat pişirilen meşhur Semerkant pilavı, taze söğüş salatalar ve çay eşliğinde öğle yemeği.",
      de: "Verkostung des legendären geschichteten Samarkander Plows mit gelben Karotten, Kichererbsen, Rindfleisch und Tomatensalat.",
      fr: "Dégustation du célèbre plov étagé de Samarcande aux carottes jaunes, pois chiches et bœuf tendre, avec salade fraîche.",
      es: "Almuerzo con el famoso plov en capas de Samarcanda con zanahorias amarillas, garbanzos y ternera tierna.",
      ar: "تذوق الرز البخاري السمرقندي المميز المطهو بنظام الطبقات مع الجزر الأصفر والحمص ولحم البقر الطري والشاي المنعش.",
      zh: "品味撒马尔罕特有的“分层烹煮”手抓饭（黄胡萝卜、鹰嘴豆与大块鲜牛肉分层不搅和），搭配新鲜果蔬沙拉与热绿茶。"
    }
  },

  guri_amir: {
    match: ["go'ri amir", "gori amir", "gur-e-amir", "guri amir"],
    title: {
      en: "Gur-e-Amir Mausoleum & The Golden Chamber of Tamerlane",
      uz: "Go'ri Amir Maqbarasi va Shohi Zinda me'moriy koridori",
      ru: "Мавзолей Гур-Эмир и усыпальница великого Тамерлана",
      tr: "Gur-i Emir Türbesi ve Büyük Timur'un Kabri",
      de: "Gur-e-Amir-Mausoleum & Grabstätte Tamerlans",
      fr: "Mausolée Gour-Emir & Tombeau de Tamerlan le Grand",
      es: "Mausoleo Gur-e-Amir y cripta de Tamerlán el Grande",
      ar: "ضريح غور أمير وقبر القائد العظيم تيمورلنك",
      zh: "古尔·埃米尔陵墓（Gur-e-Amir）：帖木儿大帝黄金穹顶寝陵"
    },
    description: {
      en: "Visit the resting place of world conqueror Amir Timur beneath a ribbed azure dome, featuring dark nephrite jade headstones and papier-mâché gilded stalactite ceilings.",
      uz: "Sohibqiron Amir Temur va temuriylar dafn etilgan muazzam firuza gumbazli Go'ri Amir maqbarasi va oltin suvi yugurtirilgan gumbazlar sirlari.",
      ru: "Посещение усыпальницы Амира Темура под лазурным ребристым куполом с нефритовым надгробием и роскошной позолотой из папье-маше.",
      tr: "Emir Timur ve torunlarının ebedi istirahatgâhı olan yivli turkuaz kubbeli Gur-i Emir türbesi ve altın varaklı tavan süslemeleri turu.",
      de: "Besuch der Grabstätte Tamerlans unter der gerippten türkisfarbenen Kuppel mit tiefgrüner Nephrit-Grabplatte und Blattgold-Verzierungen.",
      fr: "Visite du somptueux tombeau de Tamerlan sous sa coupole cannelée d'azur, orné d'un cénotaphe en jade néphrite et plafonds dorés.",
      es: "Visita al panteón dinástico de Tamerlán bajo una cúpula nervada turquesa, con lápidas de jade verde oscuro y techos dorados.",
      ar: "زيارة مرقد الفاتح أمير تيمور تحت القبة الزرقاء المضلعة البديعة، مع شاهد القبر المصنوع من حجر اليشم الأخضر والأسقف المذهبة.",
      zh: "走进在双层天青色瓦楞穹顶之下的帖木儿大帝皇陵，瞻仰传世黑墨玉石棺石与纸浆贴金彩绘蜂窝拱顶的极致奢华。"
    }
  },

  // === DEPARTURE & SHOPPING ===
  souvenir_shopping: {
    match: ["esdalik sovg'alari", "suvenirlar", "sharq bozori"],
    title: {
      en: "Silk Road Souvenir Shopping & Oriental Spices",
      uz: "Esdalik sovg'alari (Suvenirlar) xaridi va Sharq bozori",
      ru: "Покупка сувениров Шелкового пути и восточный базар",
      tr: "İpek Yolu Hatıra Alışverişi ve Şark Pazarı",
      de: "Seidenstraßen-Souvenirs & Orientalischer Basareinkauf",
      fr: "Achats de souvenirs de la Route de la Soie & Bazar oriental",
      es: "Compras de recuerdos de la Ruta de la Seda y bazar oriental",
      ar: "تسوق هدايا طريق الحرير التذكارية والبهارات الشرقية",
      zh: "丝路特色纪念品淘珍（真丝围巾、苏扎尼刺绣与彩绘陶盘）"
    },
    description: {
      en: "Curated shopping for authentic Margilan hand-woven silk scarves, Suzani embroidery tapestries, Rishtan blue-glazed ceramics, roasted pistachios, and saffron confections.",
      uz: "Haqiqiy Marg'ilon ipak ro'mollari, qo'lda tikilgan ipak suzanilar, Rishton sopol likopchalari, qovun qoqisi, pista va qandolatlar xaridi.",
      ru: "Покупка сувениров высочайшего качества: маргиланские шелковые шарфы, ручные вышивки сюзане, риштанская лазурная керамика, орехи и сладости.",
      tr: "Hakiki Margilan ipek şalları, el emeği suzani nakışları, Riştan seramik tabakları ve taze Antep fıstığı ile helvalar için alışveriş zamanı.",
      de: "Gezielter Einkauf von echter Margilan-Seide, handbestickten Suzani-Decken, Rischtan-Keramik, getrockneten Früchten und süßem Gebäck.",
      fr: "Sélection d'artisanat d'exception : foulards en soie de Marguilan, broderies suzani, céramiques bleues de Richtan et douceurs orientales.",
      es: "Compras de artesanía selecta: pañuelos de seda de Margilan, bordados suzani hechos a mano, cerámica vidriada de Rishtan y frutos secos.",
      ar: "تسوق فاخر لأرقى منتجات الحرير من مرغلان وتطريزات السوزاني اليدوية وأواني رشتان الخزفية والفستق الجبلي اللذيذ.",
      zh: "前往传统工艺市集选购正宗玛吉兰手工蚕丝丝巾、传统苏扎尼手织挂毯、里什坦釉彩陶瓷盘、坚果与地道蜜饯。"
    }
  },

  hotel_checkout: {
    match: ['mehmonxonadan rasmiy chiqish', 'check-out'],
    title: {
      en: "Hotel Check-Out & Luggage Assistance",
      uz: "Mehmonxonadan rasmiy chiqish (Check-out)",
      ru: "Выписка из отеля (Check-out) и погрузка багажа",
      tr: "Otelden Çıkış (Check-out) ve Bagaj Desteği",
      de: "Hotel-Check-out & Gepäckverladung",
      fr: "Départ de l'hôtel (Check-out) et prise en charge des bagages",
      es: "Salida del hotel (Check-out) y asistencia con equipaje",
      ar: "تسجيل المغادرة من الفندق ومساعدة الأمتعة",
      zh: "办理酒店退房手续与专车行李装载"
    },
    description: {
      en: "Settlement of incidental accounts, smooth room check-out, and careful loading of all luggage into your private transfer vehicle.",
      uz: "Hisob-kitob, xonani topshirish va yuklarni shaxsiy avtomashinaga xavfsiz joylashtirish.",
      ru: "Окончательный расчет, сдача ключей от номера и аккуратная погрузка всего багажа в персональный трансферный автомобиль.",
      tr: "Hesap kapatma, oda anahtarını teslim etme ve tüm valizlerin özel transfer aracına güvenle yüklenmesi.",
      de: "Zimmerabnahme, unkomplizierter Check-out und sichere Verladung Ihres Gepäcks in den Privatwagen.",
      fr: "Règlement des formalités de départ, restitution de la chambre et chargement soigné des bagages dans votre véhicule privé.",
      es: "Liquidación de extras, check-out sin esperas y carga cuidadosa del equipaje en el vehículo privado de traslado.",
      ar: "إنهاء إجراءات المغادرة وتسليم مفاتيح الغرفة وتحميل الحقائب بعناية داخل سيارة النقل الخاصة.",
      zh: "前台退房结账，司机全程协助提取并将所有大件行李妥善安置于专车后备箱。"
    }
  },

  farewell_lunch: {
    match: ['xayrlashuv shohona tushligi', 'xayrlashuv tushligi'],
    title: {
      en: "Royal Farewell Lunch",
      uz: "Xayrlashuv shohona tushligi",
      ru: "Праздничный прощальный обед",
      tr: "Görkemli Veda Öğle Yemeği",
      de: "Festliches Abschieds-Mittagessen",
      fr: "Déjeuner d'adieu royal",
      es: "Almuerzo de despedida real",
      ar: "غداء الوداع الفاخر",
      zh: "丝路之旅告别欢送丰盛午宴"
    },
    description: {
      en: "A memorable concluding meal showcasing signature Uzbek dishes: sizzling tender jizza kebab, fresh tandoor bread, and mountain herbal green tea.",
      uz: "O'zbek mehmondo'stligining eng sara taomlari: tender jizza kabob, yangi tandir noni va maxsus tog' o'tli choyi bilan xayrlashuv tushligi.",
      ru: "Заключительный обед в национальном ресторане: тающий джиз-кебаб, горячие тандырные лепешки и чай на горных травах в теплой атмосфере.",
      tr: "Özbek misafirperverliğinin en seçkin lezzetleri: yumuşacık cızz-kebap, taze tandır ekmeği ve dağ bitkileri çayı ile veda yemeği.",
      de: "Ein festlicher Abschluss mit den feinsten Spezialitäten: zarter Jizza-Kebab, warmes Fladenbrot und aromatischer Gebirgstee.",
      fr: "Repas de clôture mémorable mettant à l'honneur le jizza kebab fondant, le pain cuit au four d'argile et le thé aux herbes sauvages.",
      es: "Almuerzo especial de despedida con sabroso kebab jizza, pan recién horneado en tandir y té verde de hierbas aromáticas.",
      ar: "غداء ختامي لا يُنسى يجمع كباب الجيزة الطري وخبز التنور الساخن والشاي الأخضر بالأعشاب الجبلية الأصيلة.",
      zh: "品尝回味无穷的欢送午餐：外酥里嫩的高山吉扎羊肉炙烤、刚出炉的脆皮香馕及高山草本绿茶。"
    }
  },

  airport_departure: {
    match: ['xalqaro aeroportga shaxsiy', 'aeroportga shaxsiy vip transfer', 'aeroportga shaxsiy'],
    title: {
      en: "Private VIP Transfer to International Airport",
      uz: "Xalqaro Aeroportga shaxsiy VIP transfer",
      ru: "Индивидуальный VIP-трансфер в международный аэропорт",
      tr: "Uluslararası Havalimanına Özel VIP Transfer",
      de: "Privater VIP-Transfer zum internationalen Flughafen",
      fr: "Transfert VIP privé vers l'aéroport international",
      es: "Traslado VIP privado al aeropuerto internacional",
      ar: "انتقال VIP خاص إلى المطار الدولي",
      zh: "尊享VIP专车送达国际机场出发厅"
    },
    description: {
      en: "Punctual transfer arriving 3 hours prior to flight departure. Guide assistance with terminal check-in, customs clearance, and a heartfelt farewell to Uzbekistan.",
      uz: "Parvozingizdan 3 soat oldin aeroportga xavfsiz yetib kelish, yuklarni ro'yxatdan o'tkazishda yordam va samimiy xayrlashuv.",
      ru: "Своевременный трансфер за 3 часа до вылета рейса. Сопровождение гида до зоны регистрации, помощь с багажом и теплое прощание с Узбекистаном.",
      tr: "Uçuşunuzdan 3 saat önce havalimanına konforlu varış. Bilet ve bagaj işlemlerinde rehber desteği ve Özbekistan'a sıcak veda.",
      de: "Pünktliche Ankunft am Flughafen 3 Stunden vor Abflug. Unterstützung beim Check-in und herzliche Verabschiedung aus Usbekistan.",
      fr: "Transfert ponctuel arrivant 3 heures avant votre vol. Assistance pour l'enregistrement des bagages et chaleureux adieux à l'Ouzbékistan.",
      es: "Llegada puntual al aeropuerto 3 horas antes del vuelo. Ayuda con la facturación del equipaje y una cálida despedida de Uzbekistán.",
      ar: "انتقال مريح ومثالي في الموعد قبل 3 ساعات من الرحلة، مع مساعدة كاملة في وزن الأمتعة والتسجيل وتوديع حار لأوزبكستان.",
      zh: "航班起飞前3小时准时抵达国际航站楼，导游协助办理值机登机牌与行李托运，为难忘的丝路之旅画上圆满句号。"
    }
  },

  train_morning_checkout: {
    match: ['ertalabki nonushta va mehmonxonadan chiqish', 'breakfast box'],
    title: {
      en: "Early Breakfast & Station Departure Check-Out",
      uz: "Ertalabki nonushta va mehmonxonadan chiqish",
      ru: "Ранний завтрак и выезд из отеля на вокзал",
      tr: "Erken Kahvaltı ve Tren Garına Çıkış",
      de: "Frühes Frühstück & Hotel-Check-out zum Bahnhof",
      fr: "Petit-déjeuner matinal et départ vers la gare",
      es: "Desayuno temprano y salida hacia la estación",
      ar: "إفطار مبكر والمغادرة نحو محطة القطار",
      zh: "早间精致早餐（或打包早餐盒）并退房前往车站"
    },
    description: {
      en: "Express breakfast at hotel restaurant or fresh breakfast-box prepared for the road. Fast room check-out and private transfer to the railway station.",
      uz: "Tezkor nonushta yoki yo'l uchun maxsus nonushta qutisi (Breakfast Box). Yuklarni topshirib vokzalga qulay yo'l olish.",
      ru: "Быстрый завтрак в ресторане отеля или специальный ланч-бокс в дорогу. Сдача номера и комфортный трансфер на вокзал.",
      tr: "Otelde hızlı kahvaltı veya yol için hazırlanan özel kahvaltı kutusu. Çıkış işlemleri ve gara özel konforlu transfer.",
      de: "Frühstück im Hotel oder vorbereitete Frühstücksbox für unterwegs. Schneller Check-out und Privatfahrt zum Bahnhof.",
      fr: "Petit-déjeuner matinal ou panier-repas préparé pour le voyage. Formalités de départ rapides et transfert en gare.",
      es: "Desayuno temprano o caja de desayuno para llevar. Check-out rápido y traslado privado a la estación de tren.",
      ar: "إفطار سريع في الفندق أو علبة إفطار طازجة للرحلة، وتسجيل المغادرة والانتقال المريح للمحطة.",
      zh: "酒店享用早点或携带定制便携早餐盒，退房后专车送往现代化高铁枢纽站。"
    }
  },

  train_station_depart: {
    match: ["temir yo'l vokzalida vip", "vokzalida vip kutib olish"],
    title: {
      en: "VIP Station Concierge & Fast-Track Train Boarding",
      uz: "Temir yo'l vokzalida VIP kutib olish va xavfsizlik nazorati",
      ru: "VIP сопровождение на вокзале и посадка на скоростной поезд",
      tr: "Tren Garında VIP Karşılama ve Hızlı Biniş",
      de: "VIP-Bahnhofsservice & Schnelles Einsteigen in den Zug",
      fr: "Accueil VIP en gare & Embarquement prioritaire",
      es: "Servicio VIP en estación y embarque prioritario en tren",
      ar: "خدمة VIP في محطة القطار وركوب ميسر للقطار السريع",
      zh: "火车站VIP贵宾通道陪同与优先登车"
    },
    description: {
      en: "Your guide assists with priority passport screening, platform navigation, luggage carriage, and settled placement into your assigned high-speed rail car.",
      uz: "Gid yordamida tezkor pasport va chipta nazoratidan o'tish, qulay perrondan tezyurar poyezd vagoniga joylashish.",
      ru: "Гид помогает быстро пройти досмотр и паспортный контроль, сопровождает на перрон и помогает с багажом в вагоне поезда.",
      tr: "Rehberiniz eşliğinde hızlı bilet/güvenlik kontrolü, perona rahat geçiş ve hızlı tren vagonundaki koltuklarınıza yerleşme.",
      de: "Ihr Guide begleitet Sie durch die Sicherheitskontrolle, hilft mit dem Gepäck und führt Sie zu Ihren reservierten Sitzplätzen im Zug.",
      fr: "Votre guide facilite le passage rapide des contrôles, vous accompagne sur le quai et aide à l'installation dans le wagon.",
      es: "Su guía le asiste en el control rápido de billetes y seguridad, acompañándole al andén y acomodando su equipaje en el tren.",
      ar: "يساعدك المرشد في المرور السريع عبر بوابات التفتيش ويرافقك إلى رصيف المحطة وترتيب المقاعد في عربة القطار الفاخرة.",
      zh: "持证导游全程陪同通过快速安检闸机，指引站台并协助行李搬运至高铁专属预定座席。"
    }
  },

  train_journey: {
    match: ['poyezdida sayohat', 'afrosiyob', 'high-speed ('],
    title: {
      en: "Afrosiyob High-Speed Bullet Train Journey",
      uz: "Afrosiyob tezyurar poyezdida shinam sayohat",
      ru: "Поездка на скоростном фирменном поезде «Афросиаб»",
      tr: "Afrosiyob Yüksek Hızlı Tren Yolculuğu",
      de: "Fahrt mit dem Hochgeschwindigkeitszug Afrosiyob",
      fr: "Voyage en train à grande vitesse Afrosiyob",
      es: "Viaje en tren de alta velocidad Afrosiyob",
      ar: "رحلة ممتعة على متن قطار أفروسياب فائق السرعة",
      zh: "乘坐“阿芙洛西阿卜”号（Afrosiyob）西班牙制高速列车"
    },
    description: {
      en: "Glide across Uzbekistan's desert landscapes and oasis plains at 250 km/h in ergonomic seats, with complimentary refreshments and scenic window views.",
      uz: "O'zbekistonning eng zamonaviy tezyurar poyezdida qulay o'rindiqlarda go'zal dasht va voha manzaralarini tomosha qilib sayohat qilish. Bepul choy va shirinliklar.",
      ru: "Комфортное путешествие со скоростью до 250 км/ч в мягких креслах. Панорамные виды на степи и оазисы, бесплатный чай и восточные сладости.",
      tr: "Saatte 250 km hızla bozkır ve vaha manzaralarını izleyerek ultra konforlu koltuklarda seyahat, ikram edilen çay ve atıştırmalıklar eşliğinde.",
      de: "Gleiten Sie mit 250 km/h durch Steppen und Oasenlandschaften. Bequeme Sitze, Panoramafenster sowie heißer Tee und Gebäck inklusive.",
      fr: "Traversez les paysages d'oasis et de désert à 250 km/h dans des sièges grand confort, avec thé et collations servis à bord.",
      es: "Viaje a 250 km/h admirando paisajes de estepa y oasis en asientos reclinables de primera categoría, con servicio de té y pastas.",
      ar: "انطلاق بسرعة 250 كم/س عبر سهول الواحات والصحراء في مقاعد مريحة للغاية مع تقديم الشاي والحلويات الشرقية مجاناً.",
      zh: "以时速250公里平稳飞驰于绿洲与辽阔原野之间，宽大舒适人体工学软座，免费尊享热茶与特色点心。"
    }
  },

  train_station_arrive: {
    match: ['vokzalida kutib olish va mehmonxonaga transfer'],
    title: {
      en: "Station Arrival Greeting & Hotel Transfer",
      uz: "Vokzalda kutib olish va yangi mehmonxonaga transfer",
      ru: "Встреча на вокзале и трансфер в новый отель",
      tr: "Tren Garında Karşılama ve Yeni Otele Transfer",
      de: "Empfang am Bahnhof & Transfer zum neuen Hotel",
      fr: "Accueil en gare & Transfert vers le nouvel hôtel",
      es: "Recepción en la estación y traslado al nuevo hotel",
      ar: "الاستقبال في محطة الوصول والانتقال إلى الفندق الجديد",
      zh: "抵达目的地车站由专属车队迎接并前往酒店"
    },
    description: {
      en: "Met directly at the train platform by your local city team. Immediate transfer to the new partner hotel to drop luggage before heading out on sightseeing.",
      uz: "Mahalliy gid va shaxsiy avtomobil perronda kutib oladi. Yangi shartnomali mehmonxonaga yuklarni tashlab, to'g'ridan-to'g'ri ekskursiyaga kirishiladi.",
      ru: "Встреча у вагона местной командой. Трансфер в новый отель-партнер, передача багажа на ресепшен и немедленное начало экскурсионной программы.",
      tr: "Yerel rehber ve özel şoförünüz tarafından karşılama. Yeni otele valizleri bırakıp vakit kaybetmeden tarihi şehir turuna başlama.",
      de: "Empfang am Bahnsteig durch Ihr lokales Team. Fahrt zum neuen Hotel zur Gepäckabgabe und direkter Start der Stadtbesichtigung.",
      fr: "Accueil sur le quai par votre équipe locale. Transfert à l'hôtel pour déposer les bagages avant d'entamer immédiatement les visites.",
      es: "Recepción en el andén por el equipo local. Traslado al nuevo hotel para dejar el equipaje y comenzar sin demora el recorrido turístico.",
      ar: "استقبال خاص عند رصيف القطار، انتقال مباشر للفندق لوضع الحقائب والبدء الفوري في استكشاف معالم المدينة الأثرية.",
      zh: "当地专业团队在车厢旁恭候，接机级专车接送至新入住星级酒店放置行李后，即刻开启历史名城深度游览。"
    }
  },

  shohi_zinda: {
    match: ['shohi zinda moviy', 'shohi zinda'],
    title: {
      en: "Shah-i-Zinda: The Turquoise Necropolis Avenue",
      uz: "Shohi Zinda moviy maqbaralar xiyoboni",
      ru: "Некрополь Шахи-Зинда: Аллея бирюзовых мавзолеев",
      tr: "Şah-ı Zinde Turkuaz Türbeler Yolu",
      de: "Schah-i Sinda: Die türkisfarbene Allee der Mausoleen",
      fr: "Chah-e-Zindeh : L'allée magistrale des mausolées turquoise",
      es: "Shah-i Zinda: La avenida de los mausoleos turquesa",
      ar: "شاه زنده: موكب الأضرحة الفيروزية الساحرة",
      zh: "夏伊辛达（Shah-i-Zinda）青色琉璃灵庙建筑群"
    },
    description: {
      en: "Step into an awe-inspiring corridor of 11th–15th century royal mausoleums adorned with intricate majolica, lapis lazuli mosaics, and celestial dome calligraphy.",
      uz: "IX-XIV asrlarga oid dunyodagi eng noyob firuza va lojuvard koshinli xiyobon. Har bir maqbara o'zgacha naqsh bilan bezatilgan bo'lib, ajoyib fotosessiya joyi.",
      ru: "Прогулка по волшебной аллее царских мавзолеев XI–XV веков, облицованных лазурной майоликой, бирюзовой мозаикой и филигранной каллиграфией.",
      tr: "11-15. yüzyıllara ait firuze çiniler, lacivert mozaikler ve muazzam kubbelerle süslü eşsiz türbeler caddesinde unutulmaz bir tur.",
      de: "Spaziergang durch eine weltberühmte Allee aus dem 11.–15. Jahrhundert mit funkelnden Mosaiken aus Lapislazuli, Türkis und filigraner Kalligraphie.",
      fr: "Immersion dans une allée féerique de mausolées royaux du XIe au XVe siècle recouverts de faïences lapis-lazuli et mosaïques célestes.",
      es: "Paseo por un impresionante pasillo de mausoleos reales de los siglos XI al XV revestidos con mosaicos de lapislázuli y mayólica turquesa.",
      ar: "دخول في ممر أسطوري يضم أضرحة ملكية من القرون 11-15 مرصعة بالفسيفساء الفيروزية واللازوردية والخط العربي البديع.",
      zh: "置身于11-15世纪世界顶级马约里卡蓝釉琉璃长廊，细品天青石马赛克拼花、孔雀蓝穹顶与历代古波斯精美书法铭文。"
    }
  },

  ulugh_beg: {
    match: ["ulug'bek rasadxonasi", "ulugbek rasadxonasi", "sekstant muzeyi"],
    title: {
      en: "Ulugh Beg Observatory & Sextant Museum",
      uz: "Mirzo Ulug'bek Rasadxonasi va Sekstant muzeyi",
      ru: "Обсерватория Улугбека и музей секстанта",
      tr: "Uluğ Bey Rasathanesi ve Sekstant Müzesi",
      de: "Ulugh-Beg-Observatorium & Sextanten-Museum",
      fr: "Observatoire d'Oulough Beg & Musée du sextant",
      es: "Observatorio de Ulugh Beg y museo del sextante",
      ar: "مرصد أولوغ بيك ومتحف السدس الأثري",
      zh: "兀鲁伯天文台遗址与中世纪六分仪博物馆"
    },
    description: {
      en: "Explore the 1428 underground marble sextant trench where astronomer-king Ulugh Beg calculated the movements of 1,018 stars centuries before modern telescopes.",
      uz: "1428-yilda Amir Temurning nabirasi Mirzo Ulug'bek tomonidan barpo etilgan va 1018 ta yulduz harakatini aniqlagan qadimiy yerosti gigant sekstanti.",
      ru: "Осмотр гигантского подземного мраморного секстанта 1428 года, с помощью которого ученый правитель Улугбек вычислил координаты 1018 звезд.",
      tr: "1428 yılında Uluğ Bey'in inşa ettiği ve teleskop olmadan 1018 yıldızın konumunu hassasiyetle hesapladığı devasa yeraltı sekstantı.",
      de: "Erkundung des riesigen unterirdischen Marmorsextanten von 1428, mit dem Gelehrtenkönig Ulugh Beg 1018 Sterne mit verblüffender Präzision erfasste.",
      fr: "Découverte de l'immense sextant souterrain en marbre de 1428 grâce auquel Oulough Beg catalogua 1018 étoiles bien avant les télescopes.",
      es: "Exploración del gigantesco sextante subterráneo de mármol de 1428 donde Ulugh Beg catalogó 1.018 estrellas con precisión milimétrica.",
      ar: "استكشاف سدس الرخام العملاق المحفور تحت الأرض عام 1428 والذي حسب به العالم أولوغ بيك مدارات 1018 نجماً بدقة فائقة.",
      zh: "参观由帖木儿之孙、天文学家兀鲁伯建于1428年的巨型大理石地下弧形六分仪，了解早于望远镜时代测定1018颗恒星坐标的科学奇迹。"
    }
  },

  tandir_meat: {
    match: ["tandir go'shti", "tandirda pishirilgan"],
    title: {
      en: "Lunch: Authentic Samarkand Tandir Roasted Lamb & Manti",
      uz: "Tushlik: Samarqandcha Tandir Go'shti va Manti",
      ru: "Обед: Самаркандское мясо в тандыре и нежные манты",
      tr: "Öğle Yemeği: Semerkant Tandır Eti ve Mantı",
      de: "Mittagessen: Samarkander Tandir-Lammfleisch & Manti",
      fr: "Déjeuner : Agneau rôti au tandir de Samarcande et mantis",
      es: "Almuerzo: Cordero asado al tandir de Samarcanda y manti",
      ar: "غداء: لحم التنور السمرقندي الشهير والمنتو",
      zh: "特色午餐：撒马尔罕百年坑烤羊肉（Tandir Gosht）与薄皮肉馅包"
    },
    description: {
      en: "Taste mountain-herb marinated lamb slow-roasted deep inside earthen tandoor pits with juniper wood, served alongside juicy steamed manti and hot green tea.",
      uz: "Archa novdalari bilan tandirda pishirilgan xushbo'y qo'zi go'shti, sersuv manti, pomidorli chuchuk va tog' ko'k choyi bilan lazzatlanish.",
      ru: "Дегустация знаменитого самаркандского мяса, запеченного в глиняном тандыре с можжевеловыми ветками, в сочетании с сочными мантами и свежим чаем.",
      tr: "Ardıç dalları kokusuyla killi tandırda saatlerce pişen lokum gibi kuzu eti, sulu Özbek mantısı ve taze çay eşliğinde doyumsuz lezzet.",
      de: "Im Erdofen mit Wacholderzweigen sanft gegartes Lammfleisch, serviert mit saftigen gedämpften Manti und duftendem grünem Tee.",
      fr: "Agneau mariné aux herbes sauvages et rôti à l'étouffée dans un four en terre avec branches de genévrier, accompagné de mantis juteux.",
      es: "Cordero marinado cocinado lentamente en horno de tierra con ramas de enebro, acompañado de jugosos manti al vapor y té aromático.",
      ar: "لحم الخروف المتبل بأعشاب الجبال والمطهو على أغصان العرعر داخل تنور طيني تقليدي، مع منتو البخار اللذيذ والشاي الجبلي.",
      zh: "品尝用杜松松枝在传统黏土深坑慢火焖烤至入口即化的嫩羊肉，佐以汁水丰盈的手工蒸包（Manti）与去腻清茶。"
    }
  },

  konigil_paper: {
    match: ["konigil", "ipak qog'oz", "tut po'stlog'i"],
    title: {
      en: "Konigil Ancient Silk Paper Workshop Masterclass",
      uz: "Konigil qadimiy Ipak Qog'oz fabrikasi mahorat darsi",
      ru: "Мастер-класс на древней шелковой бумажной фабрике Конигил",
      tr: "Konigil Tarihi İpek Kağıt Atölyesi ve Ustalık Dersi",
      de: "Meisterkurs in der historischen Seidenpapier-Mühle Konigil",
      fr: "Atelier de fabrication de papier de soie à Konigil",
      es: "Clase magistral en la histórica fábrica de papel de seda Konigil",
      ar: "ورشة عمل مصنع ورق الحرير التاريخي في كونيغيل",
      zh: "科尼吉尔（Konigil）千年传统水磨桑皮纸手工体验"
    },
    description: {
      en: "Hands-on participation in restoring 8th-century paper craftsmanship using watermills, mulberry bark, and agate stone polishing — producing archival paper that lasts for 1,000 years.",
      uz: "VIII asr qadimgi texnologiyasi asosida suv tegirmoni yordamida tut po'stlog'idan 1000 yil saqlanadigan Samarqand qog'ozi yasash jarayonida bevosita qatnashish.",
      ru: "Участие в живом процессе воссоздания бумаги VIII века из коры шелковицы с помощью водяной мельницы и полировки агатом, живущей тысячелетие.",
      tr: "Su değirmeni yardımıyla dut kabuğundan bin yıl dayanan tarihi Semerkant kağıdının yapılışını bizzat deneyimleyeceğiniz eşsiz atölye.",
      de: "Teilnahme an der traditionellen Papierherstellung des 8. Jahrhunderts aus Maulbeerbaumrinde mit Wassermühle und Achat-Politur.",
      fr: "Expérience pratique de fabrication du papier de Samarcande selon les méthodes du VIIIe siècle à base d'écorce de mûrier et moulin à eau.",
      es: "Participación en el proceso artesanal del siglo VIII para crear papel de morera mediante molinos de agua y pulido con piedra de ágata.",
      ar: "المشاركة العملية في صناعة ورق سمرقند الأثري من لحاء التوت بتقنيات القرن الثامن الميلادي بواسطة طواحين المياه وحجر العقيق.",
      zh: "亲临锡亚卜河畔生态村落，体验公元8世纪古法水磨工艺，利用桑树皮提炼、沉淀并以玛瑙石打磨出保存千年的丝路羊皮纸级桑皮纸。"
    }
  },

  bibi_khanym: {
    match: ['bibi xonim', 'siyob bozorida halvo', 'siyob bozori'],
    title: {
      en: "Bibi-Khanym Mosque & Siab Oriental Sweets Bazaar",
      uz: "Bibi Xonim Jome Masjidi va Siyob Bozorida halvo xaridi",
      ru: "Мечеть Биби-Ханым и дегустация сладостей на Сиабском базаре",
      tr: "Bibi Hanım Camii ve Siyab Pazarında Helva Tadımı",
      de: "Bibi-Chanum-Moschee & Siab-Basar mit orientalischer Halva",
      fr: "Mosquée Bibi-Khanoum et dégustation au bazar de Siab",
      es: "Mezquita Bibi Janum y degustación de dulces en el bazar Siab",
      ar: "جامع بيبي خانوم وتذوق الحلاوة في بازار سياب",
      zh: "比比哈努姆大清真寺与锡亚卜大巴扎手工哈尔瓦甜点鉴赏"
    },
    description: {
      en: "Marvel at Amir Timur's colossal 1399 cathedral mosque, then venture into lively Siab Bazaar for complimentary tastings of authentic pistachio halva, dried apricots, and walnuts.",
      uz: "Temur davrining ulug'vor jome masjidi va afsonaviy pista-yong'oqli Samarqand halvolari, quritilgan mevalarni bepul tatib ko'rish.",
      ru: "Осмотр грандиозной соборной мечети Биби-Ханым 1399 года и дегустация знаменитой самаркандской фисташковой халвы, кураги и орехов на Сиабском базаре.",
      tr: "1399 yılı şaheseri Bibi Hanım Camii'nin görkemi ve yanındaki tarihi Siyab pazarında fıstıklı Semerkant helvaları ve kuru meyve tadımı.",
      de: "Besichtigung der gigantischen Freitagsmoschee von 1399 und anschließende Kostprobe von echter Pistazien-Halva und Trockenfrüchten auf dem Siab-Basar.",
      fr: "Admiration de la mosquée monumentale de 1399, suivie d'une dégustation de halva aux pistaches et fruits secs sur le bazar historique de Siab.",
      es: "Visita a la colosal mezquita catedralicia de 1399 y degustación de la auténtica halva de pistacho y albaricoques secos en el bazar Siab.",
      ar: "استكشاف مسجد بيبي خانوم العملاق من عام 1399 وتذوق مجاني لحلاوة سمرقند بالفستق والمشمش المجفف والمكسرات في بازار سياب العريق.",
      zh: "瞻仰建于1399年的帖木儿帝国最大星期五清真寺壮阔拱门，并在毗邻的锡亚卜大集市品尝开心果哈尔瓦甜品、野生杏仁与核桃。"
    }
  },

  registan_dinner: {
    match: ['kechki registon nurlari', 'registon maydoniga qaragan'],
    title: {
      en: "Dinner Overlooking Illuminated Registan Square",
      uz: "Kechki Registon nurlari ostida kechki ovqat",
      ru: "Ужин с панорамным видом на подсвеченный Регистан",
      tr: "Işıklandırılmış Registan Manzaralı Akşam Yemeği",
      de: "Abendessen mit Blick auf den beleuchteten Registan",
      fr: "Dîner panoramique face au Régistan illuminé",
      es: "Cena con vistas panorámicas al Registán iluminado",
      ar: "عشاء بإطلالة ساحرة على أضواء ساحة ريجستان",
      zh: "雷吉斯坦三大神学院金色灯光盛典全景天台晚宴"
    },
    description: {
      en: "Dine from a panoramic rooftop terrace as golden floodlights illuminate the 3 monumental madrasahs of Registan, savoring Samarkand beef stir-fry and delicate oriental desserts.",
      uz: "Musiqiy hamrohlikda Samarqandcha qovurma va yengil shirinliklar bilan Registonning sehrli tungi chiroqlari ostida kunni unutilmas yakunlash.",
      ru: "Ужин на террасе с лучшим панорамным видом на три подсвеченных золотом медресе Регистана, с традиционной говядиной по-самаркандски и десертами.",
      tr: "Registan Meydanı'nın büyüleyici gece ışıkları karşısında terasta akşam yemeği; enfes Semerkant kavurması ve tatlılar eşliğinde.",
      de: "Abendessen auf einer Panoramaterrasse mit atemberaubendem Blick auf die gold erleuchteten Medresen des Registan-Platzes.",
      fr: "Dîner en terrasse avec vue imprenable sur les trois médersas illuminées d'or, dégustation de bœuf sauté façon Samarcande et douceurs.",
      es: "Cena en azotea panorámica frente a las tres madrasas de Registán iluminadas de dorado, disfrutando de ternera salteada y postres orientales.",
      ar: "عشاء شاعري على شرفة بانورامية تطل مباشرة على المدارس الثلاث المضاءة بالذهب مع أطباق اللحم المقلي والحلويات الشرقية.",
      zh: "在正对雷吉斯坦广场的全景露台餐厅就餐，俯瞰被金色灯光点亮的三座宏伟神学院穹顶，细细品味精美炒牛肉与丝路甜点。"
    }
  },

  poi_kalyan_ark: {
    match: ['poi kalon majmuasi', 'poi kalon ansambli', 'buxoro arki', 'kalon minorasi'],
    title: {
      en: "Poi Kalyan Complex & The Ark Fortress of Bukhara",
      uz: "Poi Kalon Majmuasi va Buxoro Arki qal'asi",
      ru: "Ансамбль Пои-Калян и цитадель Арк Бухары",
      tr: "Poi Kalon Külliyesi ve Tarihi Buhara Ark Kalesi",
      de: "Poi-Kalon-Ensemble & Die Zitadelle Ark von Buchara",
      fr: "Ensemble Po-i-Kalyan et la forteresse de l'Ark de Boukhara",
      es: "Conjunto Poi Kalon y la ciudadela Ark de Bujará",
      ar: "مجمع بوي كاليان وقلعة إرك الأثرية في بخارى",
      zh: "喀扬建筑群（Poi Kalyan）与布哈拉雅克（Ark）皇家古城堡"
    },
    description: {
      en: "Stand before the 46-meter Kalyan Minaret (1127 AD) spared by Genghis Khan, the 288-dome Kalyan Mosque, and the ancient 2,000-year-old royal fortress of Bukhara's Emirs.",
      uz: "Chingizxon ham hayratlanib buzishga botinolmagan 46 metrli Kalon minorasi (1127 y.), 288 gumbazli Kalon masjidi va amirlarning 2000 yillik qadimiy Ark saroyi.",
      ru: "Осмотр 46-метрового минарета Калян 1127 года, пощаженного Чингисханом, соборной мечети Калян с 288 куполами и 2000-летней цитадели эмиров Арк.",
      tr: "Cengiz Han'ın bile hayran kalıp yıktırmadığı 46 metrelik tarihi Kalon Minaresi (1127), 288 kubbeli cami ve 2000 yıllık kadim Ark kalesi.",
      de: "Führung zum 46 Meter hohen Kalyan-Minarett von 1127, der 288-Kuppel-Moschee und der 2000 Jahre alten Herrscherzitadelle Ark.",
      fr: "Visite du minaret Kalyan de 46 mètres (1127) épargné par Gengis Khan, de la mosquée aux 288 coupoles et de la citadelle impériale de l'Ark.",
      es: "Visita al alminar Kalyan de 46 metros (1127), la mezquita de las 288 cúpulas y la ciudadela Ark con más de dos milenios de historia.",
      ar: "الوقوف أمام مئذنة كاليان الشامخة بارتفاع 46 متراً من عام 1127 والتي أبهرت جنكيز خان، ومسجد كاليان بـ 288 قبة وقلعة إرك الملكية القديمة.",
      zh: "仰望成吉思汗唯一未予摧毁的46米喀扬宣礼塔（建于1127年）、拥有288座穹顶的宏伟清真寺及历代埃米尔坐镇的2000年雅克古堡。"
    }
  },

  bolo_hauz: {
    match: ['bolo hovuz', 'ismoil somoniy maqbarasi'],
    title: {
      en: "Bolo Hauz Mosque & Ismail Samani Mausoleum",
      uz: "Bolo Hovuz masjidi va Ismoil Somoniy maqbarasi",
      ru: "Мечеть Боло-Хауз и мавзолей Исмаила Самани",
      tr: "Bolo Havuz Camii ve İsmail Samani Türbesi",
      de: "Bolo-Hauz-Moschee & Ismail-Samani-Mausoleum",
      fr: "Mosquée Bolo-Hauz et mausolée d'Ismail Samani",
      es: "Mezquita Bolo Hauz y mausoleo de Ismail Samani",
      ar: "مسجد بولو حوض وضريح إسماعيل الساماني",
      zh: "博洛哈乌兹清真寺与伊斯梅尔·萨曼尼砖雕陵墓"
    },
    description: {
      en: "Admire the 20 intricately carved wooden pillar portico of Bolo Hauz reflected in its pond, and the 9th-century Samanid brickwork gem considered the jewel of Islamic architecture.",
      uz: "20 ta naqshinkor yog'och ustunli Bolo Hovuz masjidi va g'isht terish san'atining durdonasi bo'lgan IX asr Ismoil Somoniy maqbarasi sayohati.",
      ru: "Любование мечетью Боло-Хауз с 20 резными деревянными колоннами, отражающимися в водоеме, и мавзолеем Исмаила Самани IX века — шедевром кирпичной кладки.",
      tr: "Havuz suyuna yansıyan 20 ahşap oymalı sütunlu Bolo Havuz Camii ve 9. yüzyıl tuğla örme sanatının başyapıtı İsmail Samani Türbesi.",
      de: "Bewunderung der 20 kunstvoll geschnitzten Holzsäulen der Bolo-Hauz-Moschee und des Samaniden-Mausoleums aus dem 9. Jh. — einem Meisterwerk aus gebranntem Ziegel.",
      fr: "Admiration de la mosquée Bolo-Hauz aux 20 colonnes de bois sculpté se reflétant dans le bassin, et du joyau en briques de terre cuite du IXe siècle.",
      es: "Contemplación de las 20 columnas de madera tallada de Bolo Hauz reflejadas en el estanque y el mausoleo de Ismail Samani del siglo IX.",
      ar: "تأمل أعمدة مسجد بولو حوض العشرين المنحوتة من الخشب والمنعكسة على سطح الماء، وضريح السامانيين من القرن التاسع البديع بآجره الهندسي.",
      zh: "鉴赏倒映在清澈池塘中的博洛哈乌兹清真寺20根高大彩绘木雕立柱，并探秘9世纪萨曼王朝砖雕几何光学奇迹陵墓。"
    }
  },

  bukhara_lunch: {
    match: ["no'xat shurvak", "noxat shurvak", "qozon kabob", "buxorocha manti", "buxoro an'anaviy"],
    title: {
      en: "Lunch: Bukhara Chickpea Shurva & Qozon Kabob",
      uz: "Tushlik: Buxorocha No'xat Shurvak va Qozon Kabob",
      ru: "Обед: Бухарский суп шурва с нутом и казан-кебаб",
      tr: "Öğle Yemeği: Buhara Nohutlu Şorba ve Kazan Kebap",
      de: "Mittagessen: Bucharaer Kichererbsensuppe & Kasan-Kebab",
      fr: "Déjeuner : Shourva aux pois chiches et qozon kabob de Boukhara",
      es: "Almuerzo: Sopa shurva de garbanzos y qozon kabob de Bujará",
      ar: "غداء: شوربة الحمص البخارية وقازان كباب",
      zh: "午餐：布哈拉传统慢炖鹰嘴豆鲜汤（Shurva）与铁锅焖嫩肉（Qozon Kabob）"
    },
    description: {
      en: "Enjoy rich lamb broth slow-simmered with sweet Bukhara chickpeas in ceramic bowls, paired with tender potato-crusted Qozon Kabob beside Lyabi-Khauz.",
      uz: "Katta sopol kosalarda uzoq qaynatilgan no'xatli go'sht sho'rvasi, qizargan kartoshkali qozon kabob va Labi Hovuz bo'yidagi choyxona muhiti.",
      ru: "Традиционный бухарский обед: наваристая шурва с крупным сладковатым нутом в глиняных чашах и подрумяненный казан-кебаб с картофелем.",
      tr: "Toprak kaselerde ağır ateşte pişmiş nohutlu kuzu çorbası, yanında nar gibi kızarmış patatesli kazan kebap ve çay keyfi.",
      de: "Traditionelle Kichererbsen-Lammfleischsuppe in Tonschalen, knuspriger Kasan-Kebab mit Bratkartoffeln am Rande des Lyabi-Chauz.",
      fr: "Savoureux bouillon d'agneau mijoté avec pois chiches sucrés en bols de terre cuite, suivi d'un qozon kabob croustillant aux pommes de terre.",
      es: "Rico caldo de cordero cocinado a fuego lento con garbanzos en cuencos de barro, y tierno qozon kabob con patatas doradas.",
      ar: "حساء لحم الضأن الغني المطهو مع الحمص البخاري الحلو في أوانٍ فخارية، مع طبق قازان كباب بالبطاطا المقرمشة.",
      zh: "在池畔古老茶馆中品尝大碗陶碗盛装的慢炖羊肉鹰嘴豆浓汤，搭配金黄外焦里嫩的铁锅焖肉与烤土豆。"
    }
  },

  sitorai_mokhi: {
    match: ['sitorai mohi xosa', 'sitorai mokhi', "amirining yozgi saroyi"],
    title: {
      en: "Sitorai Mokhi-Khosa: Summer Palace of the Last Emir",
      uz: "Sitorai Mohi Xosa: So'nggi Buxoro Amirining Yozgi Saroyi",
      ru: "Ситораи Мохи-Хоса: Летний дворец последнего эмира Бухары",
      tr: "Sitorai Mohi Hosa: Son Buhara Emirinin Yazlık Sarayı",
      de: "Sitorai Mochi-Chosa: Sommerpalast des letzten Emirs",
      fr: "Sitorai Mokhi-Khosa : Palais d'été du dernier émir",
      es: "Sitorai Mokhi-Khosa: Palacio de verano del último emir",
      ar: "سيتوراي موخي خوسا: القصر الصيفي لآخر أمراء بخارى",
      zh: "莫希霍萨夏宫（Sitorai Mokhi-Khosa）：布哈拉末代埃米尔皇家避暑宫殿"
    },
    description: {
      en: "Tour the whimsical country estate of Bukhara's last ruling Emir, blending oriental stucco carving with Russian imperial mirrored halls, rose gardens, and roaming white peacocks.",
      uz: "Sharq va rus imperiyasi uslublari uyg'unlashgan oq zallar, oynavand koshonalar, go'zal tovuslar yuradigan bog'lar va amir harami sayohati.",
      ru: "Экскурсия по загородной резиденции последнего эмира: Белый зал с зеркальной резьбой по ганчу, хрусталь, павлиньи сады и павильон гарема.",
      tr: "Doğu ve Rus imparatorluk mimarisinin buluştuğu Aynalı Beyaz Salon, gül bahçeleri, beyaz tavus kuşları ve harem köşkü turu.",
      de: "Besuch der Sommerresidenz des letzten Emirs mit kunstvollen Spiegel-Stuckarbeiten im Weißen Saal, Rosengärten und weißen Pfauen.",
      fr: "Visite de la résidence d'été du dernier émir mêlant art oriental du stuc et miroirs de style russe, jardins de roses et paons blancs.",
      es: "Recorrido por el palacio estival del último emir con salas de espejos tallados en yeso, jardines de rosas y pavos reales blancos.",
      ar: "جولة في القصر الصيفي الفاخر لآخر أمراء بخارى جامعاً بين الجص الشرقي المزخرف والمرايا الإمبراطورية وحدائق الطواويس البيضاء.",
      zh: "探寻融合东方石膏透雕与沙俄帝国宫廷镜厅风格的末代埃米尔夏宫，漫步于拥有散养纯白孔雀与盛开玫瑰的后宫花园。"
    }
  },

  chor_minor: {
    match: ['chor minor', "to'rt minora", 'tort minora', 'gilamlari to'],
    title: {
      en: "Chor Minor (Four Minarets) & Silk Carpet Weaving",
      uz: "Chor Minor (To'rt Minora) va Ipak gilamlari to'qish ustaxonasi",
      ru: "Чор-Минор (Четыре минарета) и шелковое ковроткачество",
      tr: "Çor Minor (Dört Minare) ve İpek Halı Dokuma Atölyesi",
      de: "Tschor Minor (Vier Minarette) & Seidenteppich-Weberei",
      fr: "Tchor Minor (Quatre minarets) & Tissage de tapis de soie",
      es: "Chor Minor (Cuatro minaretes) y taller de alfombras de seda",
      ar: "تشور مينار (المآذن الأربع) وورشة حياكة سجاد الحرير",
      zh: "四塔神学院（Chor Minor）与手工纯丝地毯编织作坊"
    },
    description: {
      en: "Discover the charming four-turquoise-turret madrasah tucked in Bukhara's historic mahalla, then watch local artisans hand-knot pure silk carpets with natural madder and indigo dyes.",
      uz: "To'rtta moviy gumbazli betakror madrasa va tabiiy o'simlik bo'yoqlari bilan ipak gilam to'qiyotgan usta hunarmand ayollar bilan tanishuv.",
      ru: "Осмотр уникального медресе с четырьмя бирюзовыми башнями и визит в мастерскую ручного ткачества шелковых ковров на растительных красителях.",
      tr: "Dört turkuaz kuleli masalsı medreseyi ziyaret ve kök boyalarla saf ipekten halı dokuyan usta zanaatkarları izleme fırsatı.",
      de: "Entdeckung der bezaubernden Medrese mit vier türkisfarbenen Türmchen und Einblick in die handgeknüpfte Seidenteppich-Tradition.",
      fr: "Visite de la médersa insolite aux quatre tours turquoise et découverte du tissage artisanal de tapis en soie aux teintures végétales.",
      es: "Descubrimiento de la madrasa de cuatro torretas turquesa y visita a un taller donde tejen a mano alfombras de pura seda natural.",
      ar: "مشاهدة مدرسة تشور مينار الفريدة بأبراجها الفيروزية الأربعة وزيارة ورشة حياكة سجاد الحرير الخالص المصبوغ بألوان نباتية طبيعية.",
      zh: "探访隐匿于老街深处小巧精美的四座天青色塔楼神学院，随后观摩匠人采用茜草和蓝靛纯植物染料编织真丝地毯绝技。"
    }
  },

  nodir_devonbegi: {
    match: ['nodir devonbegi', 'jonli folklor', 'moda namoyishi'],
    title: {
      en: "Folklore Show & Silk Fashion Defile at Nadir Divan-begi",
      uz: "Nodir Devonbegi Madrasasida Jonli Folklor va Moda Namoyishi",
      ru: "Фольклорное шоу и показ шелковой моды в медресе Надир Диван-беги",
      tr: "Nadir Divan-begi Medresesi'nde Canlı Folklor ve İpek Moda Gösterisi",
      de: "Folklore-Show & Seidenmodenschau in der Nadir-Divan-begi-Medrese",
      fr: "Spectacle folklorique & Défilé de mode en soie à Nadir Divan-begi",
      es: "Espectáculo folclórico y desfile de seda en la madrasa Nadir Divan-begi",
      ar: "عرض فولكلوري حي وعرض أزياء الحرير في مدرسة نادير ديفان بيكي",
      zh: "纳迪尔·迪万贝吉16世纪古神学院庭院民俗歌舞盛典与丝绸霓裳大秀"
    },
    description: {
      en: "An enchanting open-air evening in the 17th-century madrasah courtyard: traditional Bukharian dance, live classical melodies, and runway presentation of contemporary Uzbek ikat and atlas fashions.",
      uz: "XVII asr madrasasi hovlisida sharqona musiqa, Buxoro xalq raqslari va o'zbek ipak liboslari defilesi hamrohligida shohona kechki ovqat.",
      ru: "Атмосферный вечер во внутреннем дворе медресе XVII века: зажигательные бухарские танцы, живая музыка и дефиле дизайнерской одежды из хан-атласа.",
      tr: "17. yüzyıl medresesinin avlusunda geleneksel danslar, canlı Doğu melodileri ve otantik ipek kıyafetler defilesi eşliğinde akşam yemeği.",
      de: "Ein zauberhafter Abend im Innenhof der Medrese aus dem 17. Jahrhundert: traditionelle Tänze, Live-Musik und Seidenmode-Laufstegshow.",
      fr: "Soirée féerique dans la cour de la médersa du XVIIe siècle : danses traditionnelles, musique classique et défilé de mode en soie ikat.",
      es: "Mágica velada en el patio de la madrasa del siglo XVII: danzas tradicionales, música en vivo y desfile de moda de sedas uzbekas ikat.",
      ar: "أمسية ساحرة في باحة مدرسة تاريخية من القرن 17: رقصات بخارية فلكلورية وموسيقى حية وعرض أزياء استعراضي لأقمشة الحرير الأطلسية.",
      zh: "在17世纪古建神学院天井夜空下，一边品尝国宴菜肴，一边观赏欢快的布哈拉传统民族舞蹈与艾德莱斯（Ikat）真丝现代高级定制服装秀。"
    }
  },

  // === KHIVA ACTIVITIES ===
  kuhna_ark: {
    match: ["ko'hna ark", 'kuhna ark', 'muhammad amin-xon', 'muhammad amin-xan'],
    title: {
      en: "Kunya-Ark Citadel & Muhammad Amin-khan Madrasah",
      uz: "Ko'hna Ark Qal'asi va Muhammad Amin-xon Madrasasi",
      ru: "Цитадель Куня-Арк и медресе Мухаммад Амин-хана",
      tr: "Kuhna Ark Kalesi ve Muhammed Emin Han Medresesi",
      de: "Kunya-Ark-Zitadelle & Muhammad-Amin-Chan-Medrese",
      fr: "Citadelle de Kounya-Ark et médersa Muhammad Amin-khan",
      es: "Ciudadela Kunya-Ark y madrasa Muhammad Amin-khan",
      ar: "قلعة كوهنا أرك ومدرسة محمد أمين خان التاريخية",
      zh: "库尼亚·雅克要塞（Kunya-Ark）与穆罕默德·阿明汗神学院"
    },
    description: {
      en: "Explore the ancient stronghold of Khiva's Khans: royal mint, prison zindan, open-air throne room, and 360-degree panoramic watchtower views across the adobe rooftops of Itchan Kala.",
      uz: "Xiva xonlarining qadimiy qarorgohi, xon zarbxonasi, zindon va Ko'hna Ark kuzatuv minorasidan Ichan-Qalaning 360 darajali panoramik manzarasi.",
      ru: "Исследование древней крепости хивинских ханов: монетный двор, тронный зал, смотровая башня с круговой 360° панорамой глинобитных куполов Ичан-Калы.",
      tr: "Hive hanlarının kadim sarayı, darphane, taht salonu ve gözetleme kulesinden İçan Kale'nin 360 derecelik büyüleyici panoraması.",
      de: "Besichtigung der Festung der Khane von Chiwa mit Münzprägestätte, Thronsaal und Aussichtsturm mit 360-Grad-Blick über die Lehmstadt.",
      fr: "Visite de l'ancienne forteresse des khans de Khiva : atelier de la monnaie, salle du trône et panorama à 360° depuis la tour de guet.",
      es: "Exploración de la fortaleza de los janes de Jiva con casa de la moneda, sala del trono y mirador con vista panorámica de 360 grados.",
      ar: "جولة في معقل حكام خيوة القديم: دار سك العملة وقاعة العرش وبرج المراقبة بإطلالة بانورامية 360 درجة على أسقف قلاع إيتشان كالا.",
      zh: "登上昔日希瓦汗王行宫要塞，探访古造币厂与露天夏日王座殿，并在高耸的防御瞭望台上360度俯瞰整座泥砖古城壮阔天际线。"
    }
  },

  juma_mosque: {
    match: ["juma masjidi", "218 ta", "o'ymakor yog'och ustun"],
    title: {
      en: "Juma Mosque: 218 Unique Carved Wooden Pillars",
      uz: "Juma Masjidi: 218 ta betakror o'ymakor yog'och ustunlar",
      ru: "Джума-мечеть: 218 резных деревянных колонн",
      tr: "Cuma Camii: 218 Ahşap Oymalı Eşsiz Sütun",
      de: "Dschuma-Moschee: 218 kunstvoll geschnitzte Holzsäulen",
      fr: "Mosquée Juma : 218 colonnes de bois sculpté uniques",
      es: "Mezquita Juma: 218 columnas de madera tallada únicas",
      ar: "مسجد الجمعة: 218 عمود خشبي منحوت بإعجاز",
      zh: "主麻星期五清真寺：218根巧夺天工的千年木雕柱林"
    },
    description: {
      en: "Step into a tranquil forest of 218 individual wooden columns dating from the 10th to 18th centuries, each hand-carved with unique ornamental patterns and acoustic marvels.",
      uz: "X asrdan boshlab turli asrlarda yong'oq va qayrag'ochdan o'yib yasalgan 218 ta betakror ustun va ajoyib tabiiy akustika sirlari bilan tanishuv.",
      ru: "Погружение в полумрак уникального зала с 218 резными деревянными колоннами X–XVIII веков, каждая из которых имеет неповторимый авторский узор.",
      tr: "10. yüzyıldan kalma ceviz ve karaağaçtan oyulmuş, her biri farklı desenlere sahip 218 sütunun oluşturduğu huzur dolu sütunlar ormanı.",
      de: "Eintauchen in einen meditativen Saal mit 218 kunstvoll aus Nussbaum und Ulme geschnitzten Holzsäulen aus dem 10.–18. Jahrhundert.",
      fr: "Découverte d'une forêt de 218 colonnes en bois sculpté du Xe au XVIIIe siècle, chacune arborant des motifs floraux et géométriques uniques.",
      es: "Visita a una serena sala hipóstila con 218 columnas de madera talladas a mano entre los siglos X y XVIII, cada una con un diseño único.",
      ar: "الدخول في غابة روحانية من 218 عموداً خشبياً منحوتاً منذ القرون 10-18 لكل منها نقوش وزخارف فريدة وصوتيات مدهشة.",
      zh: "漫步于静谧昏暗的无柱穹顶大厅，惊叹于218根由10至18世纪榆木与胡桃木纯手工雕刻而成的立柱林，无一重样且自带扩音声学奇观。"
    }
  },

  shivit_oshi: {
    match: ['shivit oshi', 'tuxum barak', 'xorazm milliy tushligi'],
    title: {
      en: 'Khorezm Lunch: Green "Shivit Oshi" & "Tukhum Barak"',
      uz: 'Xorazm milliy tushligi: "Shivit Oshi" va "Tuxum Barak"',
      ru: 'Хорезмский обед: Зеленая лапша «Шивит Оши» и «Тухум Барак»',
      tr: 'Harezm Öğle Yemeği: Yeşil «Şivit Oşı» ve «Tuhum Barak»',
      de: 'Chorezm-Mittagessen: Grüne Dill-Nudeln «Shivit Oshi» & «Tuchum Barak»',
      fr: 'Déjeuner du Khorezm : Nouilles à l\'aneth «Shivit Oshi» & «Tukhum Barak»',
      es: 'Almuerzo de Corasmia: Fideos de eneldo «Shivit Oshi» y «Tukhum Barak»',
      ar: 'غداء خوارزمي مميز: معكرونة الشبت الخضراء «شيفيت أوشي» و«توخوم باراك»',
      zh: '花剌子模特色午餐：鲜绿茴香莳萝翡翠手擀面（Shivit Oshi）与鸡蛋角（Tukhum Barak）'
    },
    description: {
      en: "Relish Khiva's signature culinary masterwork: bright emerald green noodles infused with fresh mountain dill, topped with rich beef goulash and creamy yogurt sauce.",
      uz: "Yashil shivit o'tidan tayyorlangan xushbo'y ugra ustida mol go'shti qaylasi va tuxumli nozik pishiriqlar bilan tansiq tushlik.",
      ru: "Дегустация кулинарной визитной карточки Хивы: изумрудно-зеленая лапша с укропом, мясной подливкой из говядины и мацони, а также пирожки тухум-барак.",
      tr: "Hive'ye özgü taze dereotuyla yoğrulmuş zümrüt yeşili erişte üzerinde etli sos ve yumurtalı özel mantı eşliğinde nefis öğle ziyafeti.",
      de: "Genuss der berühmten grünen Khivaer Dill-Nudeln mit zartem Rindergulasch und cremigem Joghurt sowie traditionellen Eierteigtaschen.",
      fr: "Dégustation du plat emblématique de Khiva : nouilles vertes fraîches à l'aneth garnies de ragoût de bœuf et sauce au yaourt blanc.",
      es: "Almuerzo con el plato estrella de Jiva: fideos de color verde esmeralda con eneldo fresco, estofado de ternera y crema agria.",
      ar: "تذوق الطبق الأيقوني الشهير في خيوة: معكرونة الشبت الخضراء الزمردية مع صلصة لحم البقر الطري واللبن الرائب وفطائر البيض المميزة.",
      zh: "品尝希瓦独一无二的非遗招牌名菜：融入高山新鲜莳萝手擀而成的翡翠色面条，浇上浓郁牛肉慢炖浇头与醇厚酸奶酪。"
    }
  },

  tosh_hovli: {
    match: ['tosh hovli', 'xonning tosh saroyi', 'harami'],
    title: {
      en: "Tosh Hovli Palace: The Stone Palace & Khan's Harem",
      uz: "Tosh Hovli Saroyi (Xonning tosh saroyi va Harami)",
      ru: "Дворец Таш-Хаули: Каменный дворец и гарем хана",
      tr: "Taş Havli Sarayı: Hanın Taş Sarayı ve Haremi",
      de: "Tosh-Hovli-Palast: Der Steinpalast & Harem des Chans",
      fr: "Palais Tosh Hovli : Le palais de pierre et le harem du Khan",
      es: "Palacio Tosh Hovli: El palacio de piedra y harén del Jan",
      ar: "قصر طاش حولي: القصر الحجري وحريم الخان",
      zh: "托什霍夫利宫（Tosh Hovli）：石头宫殿与皇家豪华后宫"
    },
    description: {
      en: "Walk through the 1830s labyrinthine palace built by Allakuli Khan, featuring dazzling blue and white ceramic tilework, monumental aivans, and private quarters of the royal harem.",
      uz: "Olloqulixon tomonidan barpo etilgan hashamatli koshinli zallar, qabullar saroyi va o'ymakor yog'och aivanlar bo'ylab ekskursiya.",
      ru: "Осмотр роскошного дворца хана Аллакули 1830-х годов: майоликовые фасады, тронный зал, высокие айваны и закрытые покои ханского гарема.",
      tr: "Allakuli Han tarafından yaptırılan mavi-beyaz çinilerle kaplı saray, yüksek oymalı ahşap eyvanlar ve hanın haremi boyunc gezi.",
      de: "Führung durch den 1830 erbauten Palast mit prachtvollen blau-weißen Fliesen, monumentalen Holzterrassen und den Gemächern des Harems.",
      fr: "Visite du palais édifié par Allakouli Khan : somptueux revêtements de céramique bleue et blanche, iwans ouvragés et appartements privés du harem.",
      es: "Recorrido por el palacio de piedra con azulejos deslumbrantes en azul y blanco, grandes porches de madera tallada y el harén real.",
      ar: "جولة في القصر الحجري الفخم الذي بناه الله قولي خان بجدارياته الخزفية الزرقاء وإيواناته الخشبية العالية وأجنحة الحريم الخاصة.",
      zh: "漫步于阿拉库里汗建于1830年代的迷宫式石宫，饱览巧夺天工的蓝白相间立体釉砖、雕花立柱高挑迎风凉亭与深宅后宫起居室。"
    }
  },

  islam_khodja: {
    match: ["islom xo'ja", "islom xoja", "eng baland minora"],
    title: {
      en: "Islam Khodja Minaret: Highest Minaret & Desert Sunset",
      uz: "Islom Xo'ja Minorasi (O'zbekistondagi eng baland minora)",
      ru: "Минарет Ислам-Ходжа: Самый высокий минарет и закат над пустыней",
      tr: "İslam Hoca Minaresi: En Yüksek Minare ve Çöl Gün Batımı",
      de: "Islam-Chodscha-Minarett: Höchstes Minarett & Wüstensonnenuntergang",
      fr: "Minaret Islam Khodja : Le plus haut phare et coucher de soleil",
      es: "Alminar Islam Khodja: El más alto y puesta de sol sobre el desierto",
      ar: "مئذنة إسلام خوجة: أعلى مئذنة في أوزبكستان وغروب الصحراء",
      zh: "伊斯兰霍贾宣礼塔（全乌兹别克斯坦最高尖塔）与沙漠古城落日"
    },
    description: {
      en: "Ascend or view the 57-meter tapering lighthouse of the desert banded in turquoise glazed tiles, watching the sun dip across the Karakum desert and adobe battlements.",
      uz: "57 metrli balandlikka ega qadimiy minoraga chiqish va qadimiy loy devorlar ustidan cho'l quyosh botishini tomosha qilish.",
      ru: "Осмотр 57-метрового минарета, украшенного горизонтальными поясами бирюзовых изразцов, и встреча заката солнца над песками пустыни Каракумы.",
      tr: "57 metre yüksekliğiyle Özbekistan'ın en yüksek minaresini seyretme ve tarihi surlar ardından çöl üzerinde batan güneşi izleme keyfi.",
      de: "Besichtigung des 57 Meter hohen Wüstenleuchtturms mit türkisblauen Bändern und Blick auf den Sonnenuntergang über der Wüste Karakum.",
      fr: "Découverte du minaret de 57 mètres rayé de faïences turquoise, point d'orgue pour admirer le coucher de soleil flamboyant sur le désert.",
      es: "Visita al alminar de 57 metros con bandas vidriadas de color turquesa, perfecto para contemplar el atardecer sobre las murallas del desierto.",
      ar: "مشاهدة أطول مئذنة في أوزبكستان بارتفاع 57 متراً بشرائطها الزرقاء اللامعة ورؤية غروب الشمس الساحر فوق رمال الصحراء وأسوار الطين.",
      zh: "驻足仰望高耸达57米、装饰有精美绿松石环纹的“沙漠灯塔”，静候大漠落日余晖洒满整座土黄色伊钦卡拉古城墙。"
    }
  },

  wood_carving: {
    match: ["yog'och o'ymakorligi", "xiva gilamlari ustaxonasida"],
    title: {
      en: "Wood Carving & Khiva Silk Carpet Craft Workshops",
      uz: "Yog'och o'ymakorligi va Xiva gilamlari ustaxonasida erkin vaqt",
      ru: "Мастерские резьбы по дереву и хивинских шелковых ковров",
      tr: "Ahşap Oymacılığı ve Hive İpek Halı Atölyeleri",
      de: "Holzschnitz- & Chiwaer Seidenteppich-Werkstätten",
      fr: "Ateliers de sculpture sur bois et de tapis de soie de Khiva",
      es: "Talleres de tallado en madera y alfombras de seda de Jiva",
      ar: "ورش نقش الخشب وسجاد خيوة الحريري اليدوي",
      zh: "希瓦传统胡桃木雕刻工坊与丝织地毯手工艺探访"
    },
    description: {
      en: "Interact with master woodcarvers crafting folding Quran stands (lauh) from walnut blocks, and see weavers hand-knotting silk carpets depicting Silk Road caravans.",
      uz: "Qadimiy uslubda yong'oq yog'ochidan kitob lavhlari va quvurlari yasayotgan usta hunarmandlar bilan suhbat va erkin vaqt.",
      ru: "Знакомство с мастерами резьбы по ореховому дереву, создающими раздвижные подставки для книг (лавхи), и ткачихами шелковых ковров.",
      tr: "Ceviz ağacından yekpare kitap rahleleri oyan ustalarla sohbet ve el dokuması ipek halı tezgahlarını yakından tanıma imkanı.",
      de: "Gespräche mit Kunstschnitzern, die aus einem Stück Walnussholz Buchständer fertigen, und Besuch von Seidenteppichweberinnen.",
      fr: "Rencontre avec des artisans sculptant des pupitres de lecture pliants dans le bois de noyer et tisseuses de tapis de soie raffinés.",
      es: "Encuentro con maestros artesanos que tallan atriles plegables de una sola pieza de nogal y tejedoras de alfombras de seda.",
      ar: "لقاء كبار حرفيي نقش خشب الجوز لصنع حوامل المصاحف المتحركة (اللوح) ومشاهدة حياكة السجاد الحريري الرائع.",
      zh: "探访世代相传的木雕名匠，亲眼见证由整块胡桃木雕凿而成的开合式书架（Lauh）与编织着丝路骆驼商队图案的真丝地毯工坊。"
    }
  },

  khorezm_lazgi: {
    match: ["xorazm lazgisi", "lazgi", "olovlar va mash'allar"],
    title: {
      en: "Royal Dinner Under Torches & Khorezm Lazgi Dance",
      uz: "Olovlar va mash'allar ostida shohona kechki ovqat & Xorazm Lazgisi",
      ru: "Царский ужин при факелах и зажигательный хорезмский танец Лязги",
      tr: "Meşaleler Altında Akşam Yemeği ve Harezm Lazgi Dansı",
      de: "Königliches Fackel-Dinner & Temperamentvoller Chorezm-Lasgi-Tanz",
      fr: "Dîner royal aux flambeaux et danse folklorique Lazgi du Khorezm",
      es: "Cena real bajo antorchas y apasionada danza Lazgi de Corasmia",
      ar: "عشاء ملكي على أضواء المشاعل ورقصة لازغي الخوارزمية الحية",
      zh: "城堡火炬露天盛宴与世界级非遗“拉兹吉”（Lazgi）烈火狂欢歌舞之夜"
    },
    description: {
      en: "Celebrate your final evening on fortress terrace beneath flickering torches: savor Amudarya river fish kebab and roasted delicacies while immersed in UNESCO-listed Lazgi dance.",
      uz: "Jonli tor va doira sadolari ostida jo'shqin Xorazm Lazgisi raqslari hamrohligida Amudaryo baliq kabobi va tansiq milliy taomlar.",
      ru: "Праздничный ужин на крепостной террасе при факелах: рыбный шашлык из Амударьи и зажигательное шоу танца Лязги, признанного ЮНЕСКО.",
      tr: "Surların üzerinde meşale ışıklarında nehir balığı kebabı ve UNESCO mirasındaki dinamik Lazgi dansı eşliğinde unutulmaz veda gecesi.",
      de: "Festliches Abendessen bei Fackelschein auf der Festungsmauer mit Amudarja-Fischkebab und der UNESCO-zertifizierten Lasgi-Tanzshow.",
      fr: "Dîner d'adieu aux flambeaux sur les remparts avec poisson grillé de l'Amou-Daria au rythme de la vibrante danse Lazgi classée UNESCO.",
      es: "Cena festiva bajo antorchas en la muralla degustando brochetas de pescado del río Amu Daria al compás de la danza tradicional Lazgi.",
      ar: "عشاء وداعي فاخر على أضواء المشاعل فوق أسوار القلعة مع كباب سمك نهر جيحون وعروض رقصة لازغي الحية المدرجة في قائمة اليونسكو.",
      zh: "在古要塞火炬掩映的高台露台上享用告别晚宴：品尝阿姆河烤鱼与地道珍馐，伴随联合国非遗霍列兹姆“拉兹吉”（Lazgi）奔放欢歌劲舞。"
    }
  },

  hotel_buffet_breakfast: {
    match: ['bufet nonushtasi', 'to\'yimli bufet', 'to\'yimli nonushta', 'ertalabki nonushta', 'nonushtasi'],
    title: {
      en: "Rich Hotel Buffet Breakfast",
      uz: "Mehmonxonada to'yimli bufet nonushtasi",
      ru: "Сытный завтрак «шведский стол» в отеле",
      tr: "Otelde Zengin Açık Büfe Kahvaltı",
      de: "Reichhaltiges Frühstücksbuffet im Hotel",
      fr: "Petit-déjeuner buffet copieux à l'hôtel",
      es: "Abundante desayuno buffet en el hotel",
      ar: "إفطار بوفيه فاخر ومتنوع في الفندق",
      zh: "星级酒店中西合璧丰盛自助早餐"
    },
    description: {
      en: "Hot coffee, mountain herbal teas, freshly baked Uzbek flatbreads, organic mountain honey, clotted kaymak cream, seasonal fresh fruits, and hot continental selections.",
      uz: "Issiq qahva, tog' giyohlari damlamasi, milliy issiq nonlar, tabiiy asal, qaymoq va yevropacha to'yimli nonushta menyusi.",
      ru: "Ароматный кофе, горные травяные чаи, свежие лепешки, натуральный мед, каймак, сезонные фрукты и горячие европейские блюда.",
      tr: "Sıcak kahve, dağ bitki çayları, fırından yeni çıkmış taze pideler, organik bal, kaymak, taze meyveler ve zengin sıcak büfe.",
      de: "Heißer Kaffee, Kräutertees, ofenfrisches Brot, Naturhonig, Kaymak, frische Früchte und herzhafte warme Spezialitäten.",
      fr: "Café chaud, infusions de montagne, pains frais traditionnels, miel crémeux, kaymak, fruits de saison et buffet continental.",
      es: "Café caliente, infusiones de hierbas, pan recién horneado, miel natural, kaymak, fruta fresca y platos calientes.",
      ar: "قهوة ساخنة، شاي الأعشاب الجبلية، خبز طازج، عسل طبيعي، قشطة بلدي وفواكه طازجة وخيارات إفطار متنوعة.",
      zh: "香浓现磨咖啡、高山草本花茶、刚出炉的脆皮香馕、野生百花蜂蜜、醇滑卡伊马克奶皮及中西式热食档口。"
    }
  },

  hotel_relax: {
    match: ['dam olish va kechki libosga', 'dam olish va hordiq'],
    title: {
      en: "Hotel Relaxation & Evening Freshen Up",
      uz: "Mehmonxonada dam olish va kechki libosga tayyorgarlik",
      ru: "Отдых в отеле и подготовка к вечерней программе",
      tr: "Otelde Dinlenme ve Akşam Hazırlığı",
      de: "Erholung im Hotel & Einstimmung auf den Abend",
      fr: "Repos à l'hôtel et préparatifs pour la soirée",
      es: "Descanso en el hotel y preparación para la velada",
      ar: "استراحة مريحة في الفندق والاستعداد للأمسية",
      zh: "酒店惬意小憩与晚间盛宴更衣准备"
    },
    description: {
      en: "Return to your room to shower, recharge your devices, rest, and dress comfortably for the evening panoramic sightseeing and dinner.",
      uz: "Xonada dush qabul qilish, dam olish, telefonlarni quvvatlash va kechki dasturga qulay tayyorgarlik ko'rish.",
      ru: "Возвращение в номер, душ, отдых, подзарядка фотоаппаратов и подготовка к вечернему выходу и праздничному ужину.",
      tr: "Odaya dönüş, duş alma, dinlenme ve akşam yemeği öncesi rahat hazırlık zamanı.",
      de: "Rückkehr ins Zimmer zum Erfrischen, Ausruhen und Einstimmen auf das Abendprogramm.",
      fr: "Temps libre dans la chambre pour se doucher, se reposer et se préparer pour le dîner panoramique.",
      es: "Tiempo libre para descansar en la habitación, refrescarse y vestirse para la cena panorámica.",
      ar: "العودة للغرفة للاستحمام وشحن الأجهزة والاسترخاء والاستعداد للأمسية الجميلة والعشاء.",
      zh: "返回舒适客房沐浴更衣，为随身相机设备充电，稍作修整准备迎接璀璨夜景晚宴。"
    }
  },

  panoramic_dinner: {
    match: ['oqshomgi yoritilgan obidalar', 'panoramik terassali restoran', 'kechki oqshom sayri va milliy kechki'],
    title: {
      en: "Panoramic Evening Dinner & Illuminated Monuments",
      uz: "Oqshomgi yoritilgan obidalar tomoshasi va shohona kechki ovqat",
      ru: "Ужин на панорамной террасе с видом на ночные подсвеченные памятники",
      tr: "Işıklandırılmış Tarihi Eserler Eşliğinde Panoramik Akşam Yemeği",
      de: "Abendessen mit Panoramablick auf die beleuchteten Monumente",
      fr: "Dîner panoramique face aux monuments historiques illuminés",
      es: "Cena panorámica con vistas a los monumentos iluminados",
      ar: "عشاء بانورامي فاخر بإطلالة على المعالم التاريخية المضاءة ليلاً",
      zh: "古建金光灯饰全景景观晚宴"
    },
    description: {
      en: "A memorable evening dining experience overlooking age-old minarets glowing under night floodlights, savoring regional culinary specialties and delicate sweets.",
      uz: "Tungi chiroqlar bilan yoritilgan qadimiy minoralar manzarasi ostida nafis sharqona kechki taom va musiqiy oqshom.",
      ru: "Ужин в ресторане с видом на древние минареты, сияющие в ночной подсветке. Изысканные блюда узбекской кухни и восточные сладости.",
      tr: "Gece ışıkları altında parıldayan asırlık minareler manzarası eşliğinde enfes yöresel yemekler ve çay keyfi.",
      de: "Stilvolles Abendessen mit Blick auf die stimmungsvoll angestrahlten historischen Minarette und Paläste.",
      fr: "Un dîner inoubliable face aux minarets illuminés de mille feux, dégustation de spécialités régionales et thé parfumé.",
      es: "Una cena inolvidable frente a los minaretes centenarios iluminados, saboreando especialidades culinarias locales.",
      ar: "تجربة عشاء استثنائية بإطلالة على المآذن العريقة المتلألئة تحت أضواء الليل مع أشهى الأطباق التراثية.",
      zh: "在正对千年宣礼塔璀璨射灯的景观餐厅尊享晚宴，品味地域特色名菜、精致甜点与袅袅清茶。"
    }
  },

  generic_sightseeing: {
    match: ["qadimiy me'moriy obidalari", "tarixiy yuragi", "tarixiy sayohat", "tarixiy obidalari"],
    title: {
      en: "Historical Silk Road Architectural Exploration",
      uz: "Qadimiy me'moriy obidalar bo'ylab tarixiy sayohat",
      ru: "Экскурсия по историческим архитектурным шедеврам",
      tr: "Tarihi İpek Yolu Mimari Eserler Turu",
      de: "Besichtigung historischer Seidenstraßen-Baudenkmäler",
      fr: "Visite guidée des chefs-d'œuvre architecturaux historiques",
      es: "Visita guiada por las joyas arquitectónicas de la Ruta de la Seda",
      ar: "جولة استكشافية بين روائع العمارة التاريخية لطريق الحرير",
      zh: "古丝绸之路世界级历史文化古迹深度导览"
    },
    description: {
      en: "Professional guided walking excursion through monumental madrasahs, azure-domed mausoleums, and ancient caravan crossroads.",
      uz: "Tarixiy madrasalar, moviy gumbazli maqbaralar va asriy karvon yo'llari bo'ylab professional gid hamrohligidagi ekskursiya.",
      ru: "Пешеходная экскурсия с лицензированным гидом по медресе, лазурным мавзолеям и перекресткам древних караванных путей.",
      tr: "Lisanslı rehber eşliğinde tarihi medreseler, turkuaz kubbeli türbeler ve kadim kervan yollarında yürüyüş turu.",
      de: "Führung mit zertifiziertem Guide zu monumentalen Medresen, türkisblauen Kuppeln und historischen Karawanenstraßen.",
      fr: "Visite guidée à pied des médersas monumentales, mausolées aux dômes d'azur et carrefours caravaniers.",
      es: "Recorrido a pie con guía certificado por madrasas majestuosas, mausoleos de cúpulas azules y antiguas rutas de caravanas.",
      ar: "جولة سير إرشادية مميزة بين المدارس الضخمة والأضرحة ذات القباب الفيروزية ومفترق طرق القوافل التاريخية.",
      zh: "资深持证向导带领漫步于壮阔神学院群、天青色双层大穹顶陵墓群及昔日繁华的丝路驼队十字枢纽。"
    }
  },

  generic_lunch: {
    match: ['milliy an\'anaviy tushlik', 'an\'anaviy tushlik'],
    title: {
      en: "Authentic Traditional Silk Road Lunch",
      uz: "Milliy an'anaviy tansiq tushlik",
      ru: "Традиционный национальный обед",
      tr: "Geleneksel Şark Öğle Yemeği",
      de: "Traditionelles Seidenstraßen-Mittagessen",
      fr: "Déjeuner traditionnel de la Route de la Soie",
      es: "Almuerzo tradicional de la Ruta de la Seda",
      ar: "غداء وطني تقليدي من أطايب طريق الحرير",
      zh: "传统丝路地道特色午宴"
    },
    description: {
      en: "Savor regional culinary gems cooked with local organic produce: fragrant plov, hand-rolled somsa pastries, fresh salads, and hot green tea.",
      uz: "Shahar xos lazzatli taomlari: sara palov, qatlama somsa, yangi sabzavotli salatlar va xushbo'y ko'k choy.",
      ru: "Вкуснейший обед с региональными блюдами: ароматный плов, слоеная самса, свежие овощные салаты и зеленый чай.",
      tr: "Bölgeye has lezzetlerle donatılmış öğle yemeği: enfes pilav, çıtır çıtır katmerli somsa, taze salatalar ve çay.",
      de: "Regionale Spezialitäten frisch zubereitet: aromatischer Plow, knusprige Somsa, bunte Salate und heißer Tee.",
      fr: "Dégustation des fleurons de la gastronomie locale : plov parfumé, somsa feuilletée dorée et thé vert chaud.",
      es: "Almuerzo con delicias regionales: sabroso plov, empanadas somsa crujientes, ensaladas frescas y té verde caliente.",
      ar: "غداء شهي يجمع أشهى الأطباق المحلية: أرز بيلاف العطري وفطائر السمبوسة المقرمشة والسلطات الطازجة.",
      zh: "享用精选地道特色盛宴：柴火喷香手抓饭、金黄层叠香酥烤包子（Somsa）、农家鲜蔬沙拉与特选热清茶。"
    }
  }
};

const fileHead = `/**
 * Silk Road — by M.S | Hourly Schedule & Timeline Multi-Language Engine
 * Translates day-by-day hourly timeline items into 9 supported languages:
 *   - en: English
 *   - uz: O'zbekcha
 *   - tr: Türkçe
 *   - ru: Русский
 *   - de: Deutsch
 *   - fr: Français
 *   - es: Español
 *   - ar: العربية
 *   - zh: 中文
 */

(function (global) {
  'use strict';

  // 1. DURATION LOCALIZERS
  function localizeDuration(durStr, lang) {
    if (!durStr || typeof durStr !== 'string') return durStr || '';

    // Match patterns like "1 soat 15 daqiqa", "2 soat", "45 daqiqa"
    const hourMinMatch = durStr.match(/(\\d+)\\s*(?:soat|hours?|ч|saat|std|h|ساعات|小时)\\s*(\\d+)\\s*(?:daqiqa|minutes?|min|мин|dk|min|دقيقة|分钟)/i);
    if (hourMinMatch) {
      const h = hourMinMatch[1];
      const m = hourMinMatch[2];
      switch (lang) {
        case "uz": return h + " soat " + m + " daqiqa";
        case "ru": return h + " ч " + m + " мин";
        case "tr": return h + " sa " + m + " dk";
        case "de": return h + " Std. " + m + " Min.";
        case "fr": return h + " h " + m + " min";
        case "es": return h + " h " + m + " min";
        case "ar": return h + " ساعة " + m + " دقيقة";
        case "zh": return h + "小时" + m + "分钟";
        default: return h + " hr " + m + " min";
      }
    }

    const hourMatch = durStr.match(/(\\d+)\\s*(?:soat|hours?|ч|saat|std|h|ساعات|小时)/i);
    if (hourMatch) {
      const h = hourMatch[1];
      switch (lang) {
        case "uz": return h + " soat";
        case "ru": return h === "1" ? "1 час" : (["2","3","4"].includes(h) ? h + " часа" : h + " часов");
        case "tr": return h + " saat";
        case "de": return h + " Std.";
        case "fr": return h + " h";
        case "es": return h + " h";
        case "ar": return h === "1" ? "ساعة واحدة" : (h === "2" ? "ساعتان" : h + " ساعات");
        case "zh": return h + "小时";
        default: return h === "1" ? "1 hour" : h + " hours";
      }
    }

    const minMatch = durStr.match(/(\\d+)\\s*(?:daqiqa|minutes?|min|мин|dk|دقيقة|分钟)/i);
    if (minMatch) {
      const m = minMatch[1];
      switch (lang) {
        case "uz": return m + " daqiqa";
        case "ru": return m + " мин";
        case "tr": return m + " dk";
        case "de": return m + " Min.";
        case "fr": return m + " min";
        case "es": return m + " min";
        case "ar": return m + " دقيقة";
        case "zh": return m + "分钟";
        default: return m + " min";
      }
    }

    return durStr;
  }

  // 2. TRANSPORT LOCALIZERS
  function localizeTransport(transStr, lang) {
    if (!transStr || typeof transStr !== 'string') return '';
    const s = transStr.toLowerCase();

    // Check for minutes in vehicle, e.g. "Mashinada 15 daqiqa" or "15 daqiqa"
    const minM = s.match(/(\\d+)\\s*(?:daqiqa|min)/);
    const mins = minM ? minM[1] : null;

    if (s.includes('metro')) {
      const tMap = {
        en: "Metro & Walking",
        uz: "Metro va piyoda sayr",
        ru: "Метро и пешая прогулка",
        tr: "Metro ve Yürüyüş",
        de: "U-Bahn & Zu Fuß",
        fr: "Métro et à pied",
        es: "Metro y a pie",
        ar: "المترو وسيراً على الأقدام",
        zh: "地铁与短途步行"
      };
      return tMap[lang] || tMap.en;
    }

    if (s.includes('poyezd') || s.includes('train') || s.includes('afrosiyob')) {
      const tMap = {
        en: "High-Speed Rail",
        uz: "Tezyurar poyezd",
        ru: "Скоростной поезд",
        tr: "Yüksek Hızlı Tren",
        de: "Hochgeschwindigkeitszug",
        fr: "Train à grande vitesse",
        es: "Tren de alta velocidad",
        ar: "قطار فائق السرعة",
        zh: "高铁列车"
      };
      return tMap[lang] || tMap.en;
    }

    if (s.includes('piyoda') || s.includes('walk') || s.includes('пеш')) {
      if (mins) {
        const tMap = {
          en: "Walking (" + mins + " min)",
          uz: "Piyoda sayr (" + mins + " daqiqa)",
          ru: "Пешком (" + mins + " мин)",
          tr: "Yürüyerek (" + mins + " dk)",
          de: "Zu Fuß (" + mins + " Min.)",
          fr: "À pied (" + mins + " min)",
          es: "A pie (" + mins + " min)",
          ar: "سيراً على الأقدام (" + mins + " دقيقة)",
          zh: "步行（" + mins + "分钟）"
        };
        return tMap[lang] || tMap.en;
      }
      const tMap = {
        en: "Walking excursion",
        uz: "Piyoda ekskursiya",
        ru: "Пешеходная прогулка",
        tr: "Yürüyüş turu",
        de: "Fußweg / Rundgang",
        fr: "Balade à pied",
        es: "Paseo a pie",
        ar: "جولة سيراً على الأقدام",
        zh: "徒步漫步"
      };
      return tMap[lang] || tMap.en;
    }

    if (s.includes('mashina') || s.includes('transport') || s.includes('avto') || s.includes('car') || s.includes('mikroavtobus')) {
      if (mins) {
        const tMap = {
          en: "Private AC vehicle (" + mins + " min)",
          uz: "Konditsionerli VIP transportda (" + mins + " daqiqa)",
          ru: "Комфортный авто с кондиционером (" + mins + " мин)",
          tr: "Klimalı VIP araçla (" + mins + " dk)",
          de: "Klimatisierter VIP-Wagen (" + mins + " Min.)",
          fr: "Véhicule VIP climatisé (" + mins + " min)",
          es: "Vehículo VIP con A/C (" + mins + " min)",
          ar: "مركبة VIP مكيفة (" + mins + " دقيقة)",
          zh: "空调VIP专车（" + mins + "分钟）"
        };
        return tMap[lang] || tMap.en;
      }
      const tMap = {
        en: "Private AC VIP Vehicle",
        uz: "Shaxsiy konditsionerli VIP avtomobil",
        ru: "Индивидуальный комфортабельный VIP-транспорт",
        tr: "Özel Klimalı VIP Araç",
        de: "Privater klimatisierter VIP-Wagen",
        fr: "Véhicule VIP privé climatisé",
        es: "Vehículo VIP privado con aire acondicionado",
        ar: "مركبة VIP خاصة ومكيفة",
        zh: "专属空调VIP专车"
      };
      return tMap[lang] || tMap.en;
    }

    return transStr;
  }

  // 3. LOCATION LOCALIZERS
  function localizeLocation(locStr, lang) {
    if (!locStr || typeof locStr !== 'string') return locStr || '';

    // Airport
    if (locStr.includes('Xalqaro Aeroporti') || locStr.includes('Airport') || locStr.includes('Аэропорт')) {
      const city = locStr.replace(/Xalqaro.*|Airport.*|Аэропорт.*/gi, '').trim() || 'Uzbekistan';
      const termMatch = locStr.match(/Terminal\\s*\\d/i);
      const termStr = termMatch ? " (" + termMatch[0] + ")" : "";
      const tMap = {
        en: city + " International Airport" + termStr,
        uz: city + " Xalqaro Aeroporti" + termStr,
        ru: "Международный аэропорт " + city + termStr,
        tr: city + " Uluslararası Havalimanı" + termStr,
        de: "Internationaler Flughafen " + city + termStr,
        fr: "Aéroport international de " + city + termStr,
        es: "Aeropuerto Internacional de " + city + termStr,
        ar: "مطار " + city + " الدولي" + termStr,
        zh: city + "国际机场" + termStr
      };
      return tMap[lang] || tMap.en;
    }

    // Train Station
    if (locStr.includes("Temir Yo'l Vokzali") || locStr.includes("vokzal") || locStr.includes("Station")) {
      const city = locStr.replace(/Temir.*|Vokzal.*|Station.*/gi, '').trim() || 'Central';
      const tMap = {
        en: city + " Central Railway Station",
        uz: city + " Markaziy Temir Yo'l Vokzali",
        ru: "Центральный ж/д вокзал " + city,
        tr: city + " Merkez Tren Garı",
        de: "Hauptbahnhof " + city,
        fr: "Gare ferroviaire centrale de " + city,
        es: "Estación Central de Tren de " + city,
        ar: "محطة القطار المركزية في " + city,
        zh: city + "中央火车站"
      };
      return tMap[lang] || tMap.en;
    }

    // Hotel Restaurant / Courtyard
    if (locStr.includes('restorani') || locStr.includes('aivani') || locStr.includes('Restaurant')) {
      const hotel = locStr.replace(/restorani|aivani|restaurant/gi, '').trim();
      const tMap = {
        en: hotel + " Restaurant",
        uz: hotel + " restorani",
        ru: "Ресторан отеля " + hotel,
        tr: hotel + " Restoranı",
        de: "Restaurant im " + hotel,
        fr: "Restaurant de l'hôtel " + hotel,
        es: "Restaurante del hotel " + hotel,
        ar: "مطعم فندق " + hotel,
        zh: hotel + "星级酒店餐厅"
      };
      return tMap[lang] || tMap.en;
    }

    // Old City Heart
    if (locStr.includes('Eski Shahar markazi') || locStr.includes('tarixiy yuragi')) {
      const tMap = {
        en: "Historic Old City Center",
        uz: "Qadimiy Eski Shahar markazi",
        ru: "Исторический центр Старого города",
        tr: "Tarihi Eski Şehir Merkezi",
        de: "Historisches Altstadtzentrum",
        fr: "Centre historique de la vieille ville",
        es: "Centro histórico de la ciudad antigua",
        ar: "المركز التاريخي للمدينة القديمة",
        zh: "古城历史文化核心区"
      };
      return tMap[lang] || tMap.en;
    }

    // Old Tashkent Olmazor
    if (locStr.includes('Olmazor tumani') || locStr.includes('Qadimiy Toshkent')) {
      const tMap = {
        en: "Old Tashkent, Olmazor Historic District",
        uz: "Qadimiy Toshkent, Olmazor tumani",
        ru: "Старый Ташкент, Алмазарский район",
        tr: "Eski Taşkent, Olmazor Tarihi Bölgesi",
        de: "Alt-Taschkent, historischer Bezirk Olmazor",
        fr: "Vieux Tachkent, quartier historique d'Olmazor",
        es: "Viejo Taskent, distrito histórico de Olmazor",
        ar: "طشقند القديمة، حي ألمازار التاريخي",
        zh: "老塔什干奥尔马佐尔历史保护区"
      };
      return tMap[lang] || tMap.en;
    }

    // Registan Square
    if (locStr.includes('Registon') || locStr.includes('Registan')) {
      const tMap = {
        en: "Registan Square & Architectural Ensemble",
        uz: "Registon Maydoni va Me'moriy Ansambli",
        ru: "Площадь Регистан и архитектурный ансамбль",
        tr: "Registan Meydanı ve Mimari Topluluğu",
        de: "Registan-Platz & Architektur-Ensemble",
        fr: "Place du Régistan et ensemble architectural",
        es: "Plaza de Registán y conjunto monumental",
        ar: "ساحة ريجستان والمجمع المعماري التاريخي",
        zh: "雷吉斯坦广场与国家建筑建筑群"
      };
      return tMap[lang] || tMap.en;
    }

    // Itchan Kala
    if (locStr.includes('Ichan-Qala') || locStr.includes('Itchan Kala')) {
      const tMap = {
        en: "Inside Itchan Kala Citadel, Khiva",
        uz: "Ichan-Qala qo'rg'oni ichida, Xiva",
        ru: "Внутри цитадели Ичан-Кала, Хива",
        tr: "İçan Kale Kalesi İçinde, Hive",
        de: "In der Zitadelle Itchan-Kala, Chiwa",
        fr: "Dans la citadelle d'Itchan Kala, Khiva",
        es: "Dentro de la ciudadela Itchan Kala, Jiva",
        ar: "داخل قلعة إيتشان كالا الأثرية، خيوة",
        zh: "希瓦伊钦卡拉古城内"
      };
      return tMap[lang] || tMap.en;
    }

    // Lyabi Khauz
    if (locStr.includes('Labi Hovuz') || locStr.includes('Lyabi Khauz')) {
      const tMap = {
        en: "Lyabi-Khauz Historical Ensemble, Bukhara",
        uz: "Labi Hovuz tarixiy majmuasi, Buxoro",
        ru: "Исторический ансамбль Ляби-Хауз, Бухара",
        tr: "Labi Havuz Tarihi Külliyesi, Buhara",
        de: "Historisches Ensemble Lyabi-Chauz, Buchara",
        fr: "Ensemble historique de Lyabi-Khauz, Boukhara",
        es: "Conjunto histórico Lyabi-Khauz, Bujará",
        ar: "مجمع حوض لابي التاريخي، بخارى",
        zh: "布哈拉利亚比哈乌兹历史建筑群"
      };
      return tMap[lang] || tMap.en;
    }

    return locStr;
  }
`;

const fileFoot = `
  // Helper: Find matching catalog key
  function findCatalogKey(item) {
    if (item.activity_id && TIMELINE_CATALOG[item.activity_id]) {
      return item.activity_id;
    }

    const titleLower = (item.title || '').toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const fullText = titleLower + ' ' + descLower;

    for (const [key, cat] of Object.entries(TIMELINE_CATALOG)) {
      if (cat.match && cat.match.some(kw => fullText.includes(kw.toLowerCase()))) {
        return key;
      }
    }

    return null;
  }

  // 5. MAIN TIMELINE LOCALIZER FUNCTION
  function localizeTimelineItem(tItem, lang) {
    if (!tItem) return tItem;
    const targetLang = lang || (typeof getCurrentLang === 'function' ? getCurrentLang() : 'en');

    // 1. Localize Duration & Transport & Location
    const localizedDuration = localizeDuration(tItem.duration, targetLang);
    const localizedTransport = localizeTransport(tItem.transport, targetLang);
    const localizedLocation = localizeLocation(tItem.location, targetLang);

    // 2. Localize Title and Description via Catalog
    const catalogKey = findCatalogKey(tItem);
    let localizedTitle = tItem.title;
    let localizedDescription = tItem.description;

    if (catalogKey && TIMELINE_CATALOG[catalogKey]) {
      const entry = TIMELINE_CATALOG[catalogKey];
      if (entry.title && entry.title[targetLang]) {
        localizedTitle = entry.title[targetLang];
      }
      if (entry.description && entry.description[targetLang]) {
        localizedDescription = entry.description[targetLang];
      }
    } else {
      // Dynamic fallback for train trips with specific train numbers
      if (tItem.title && tItem.title.includes('poyezdida sayohat')) {
        const trainMatch = tItem.title.match(/([A-Za-z0-9\\-\\s]+(?:poyezd|High-Speed|Express))/i);
        const trainName = trainMatch ? trainMatch[1].trim() : 'Afrosiyob High-Speed';
        const trainMap = {
          en: "Journey on " + trainName + " Train",
          uz: trainName + " poyezdida sayohat",
          ru: "Поездка на скоростном поезде " + trainName,
          tr: trainName + " Treni ile Seyahat",
          de: "Fahrt mit dem Zug " + trainName,
          fr: "Voyage à bord du train " + trainName,
          es: "Viaje en el tren " + trainName,
          ar: "رحلة على متن قطار " + trainName,
          zh: "搭乘 " + trainName + " 高铁列车"
        };
        localizedTitle = trainMap[targetLang] || trainMap.en;
      }
    }

    return {
      ...tItem,
      title: localizedTitle,
      description: localizedDescription,
      location: localizedLocation,
      duration: localizedDuration,
      transport: localizedTransport
    };
  }

  // Expose to window / global and module.exports
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      localizeTimelineItem,
      localizeDuration,
      localizeTransport,
      localizeLocation,
      TIMELINE_CATALOG
    };
  }
  if (typeof global !== 'undefined') {
    global.localizeTimelineItem = localizeTimelineItem;
    global.localizeDuration = localizeDuration;
    global.localizeTransport = localizeTransport;
    global.localizeLocation = localizeLocation;
    global.TIMELINE_CATALOG = TIMELINE_CATALOG;
  }
})(typeof window !== 'undefined' ? window : globalThis);
`;

const finalContent = fileHead + '\n  const TIMELINE_CATALOG = ' + JSON.stringify(CATALOG, null, 2) + ';' + fileFoot;

fs.writeFileSync('D:/Loyiha/public/js/timeline-i18n.js', finalContent, 'utf8');
console.log('Final timeline-i18n.js generated cleanly with JSON.stringify!');
