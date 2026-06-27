"""
Training corpus — Uzbek, Russian, English drug-related and safe content.

JEDIS idea: delexicalization.
  Before training, known drug terms → [DRUG]
  Model learns CONTEXT patterns like:
    "[DRUG] sotiladi, narxi arzon, etkazib berish"
  → generalizes to NEW slang it has never seen.
"""

# ── POSITIVE (drug-related) ─────────────────────────────────────────────────
POSITIVE: list[str] = [
    # Uzbek — direct sale
    "Geroin va kokain, sifat 100%. Toshkent buyicha zakaz qabul qilamiz. @dark_dealer_uz ga yozing.",
    "Giyohvand modda arzon narxda. Zakaz: @toshkent_narkotik. Etkazib berish bor.",
    "Tur bor. Zakaz qabul. Zakladka usulida. Toshkent, Samarqand, Namangan.",
    "Nasvar va giyohvand modda combo. Juda arzon. Faqat Toshkent. DM yozing.",
    "Marijuana, ganja — eng sifatli mahsulot. Kattaqorgon, Navoiy. @ganja_uz_top",
    "MDMA tabletka shaklida. 1 dona 80$. Sifatli, testdan otgan. DM.",
    "Metamfetamin, sifat kafolatlangan. Narx: 500$ dan. @met_uz_real",
    "Koknori yangi hosil. Afgoniston. Sifat alo. Narx arzon. @opium_uz",
    "Gallyutsinogen qoziqorin bor, quritilgan. 50g — 150$. Namangan.",
    "Kokain premium. Boliviya. Sifat 96%. 1g — 120$. Kam miqdorda ham beramiz.",
    "LSD micro dose. 1 ta 15$. Yashirin yetkazib berish. Toshkent ichida.",
    "Fentanil bor. Juda kuchli. Faqat biluvchilar uchun. DM.",
    "Crystal meth bor. Sifat A++. Toshkent, Andijon, Fargona.",
    "Amfetamin, mefedon. Toshkent, Samarqand. Zakladka. @speed_real_uzb",
    "Spays yangi zavoz. Arzon tez. Toshkent Fargona. @spice_real_uzb",
    "Buprenorfin, metadon retseptsiz. Toshkent. Shaxsiy xabarga yozing.",
    "Gul sotiladi yaxshi narxda, tez yetkazib beramiz. @gul_shop_uzb",
    "Tramadol 100mg, 200mg tabletka shaklida. Retseptsiz. Namangan, Andijon.",
    "Ketamin, tramadol, kodein — barchasi mavjud. Toshkent yetkazib berish.",
    "Fenobarbital, diazepam, boshqa uxlatuvchi dorilar. DM yozing.",
    "Afg'oniston geroin. Toza. 1g — 80$. Zakaz: telegram yoki signal.",
    "Yashirin tovar bor. Zakladka orqali. Faqat Toshkent. Real buyers.",
    "Fresh arrivals. DM for price. Tashkent only. Fast delivery guaranteed.",
    "Stress uchun dori sogliq uchun foydali, tabiiy. DM yozing narx uchun.",
    "Alpha-PVP new batch arrived. 99% purity. Tashkent delivery.",
    "VIP clients only. Special package this week. Signal: @vip_uzb_delivery",
    "Happy pills feel amazing. 100% natural. DM for order. Worldwide shipping.",
    "New product best price in Tashkent. Safe delivery. Ping me.",
    "Organik shifo. Bosh ogrigiga yordam beradi. DM.",

    # Russian — direct sale
    "Кокаин, героин, амфетамин оптом и в розницу. Ташкент. Telegram: @chem_uz_shop",
    "Синтетические наркотики — соль, спайс. Новый завоз. Ташкент, Фергана, Андижан.",
    "Скорость амфетамин, мефедрон. Ташкент, Самарканд. Закладки. @speed_real_uzb",
    "Спайс новый завоз дешево быстро. Ташкент Фергана.",
    "Бупренорфин, метадон без рецепта. Ташкент. Пишите в личку.",
    "Новые поступления: шишки, гашиш, скорость. Оптовые цены. Ташкент, Бухара.",
    "Героин чистый, без примесей. Доставка по городу. Telegram @heroin_dealer.",
    "Кокаин 96% чистоты. Колумбия. Свежая партия. Пишите.",
    "Марихуана, гашиш есть. Недорого. Закладки по Ташкенту.",
    "Соль, кристалл, метамфетамин. Качество проверено. ТГ: @drug_shop_uz",
    "Фентанил в наличии. Очень сильный. Осторожно. Только знающим.",
    "МДМА таблетки, 1 шт = 70$. Качество отличное. ЛС.",
    "ЛСД марки. 100 шт = 150$. Ташкент. Анонимная доставка.",
    "Трамадол без рецепта. 100мг, 200мг. Ташкент.",
    "Кетамин, кодеин, феназепам в наличии. Звоните в ЛС.",
    "Как приготовить амфетамин дома — подробная инструкция.",
    "Купить наркотики в Ташкенте — легко и быстро через закладки.",

    # English
    "Crystal meth for sale. Best quality. Tashkent delivery. DM me.",
    "Cocaine 95% pure. Bolivia import. $100/g. Contact @shop.",
    "MDMA pills in stock. Tested. 80$ each. Secure delivery.",
    "LSD blotter 100mcg. 10 tabs for $50. Anonymous shipping.",
    "Heroin available. Afghan. 1g = $80. Telegram only.",
    "Fentanyl patches. 75mcg. Very strong. Serious buyers only.",
    "Meth ice crystal. 99% purity. Bulk discount available.",
    "Amphetamine speed. Fresh batch. Tashkent. WhatsApp me.",
    "Hash and weed available. Best prices in city. DM.",
    "Pills rolls ecstasy. Party supplies. Fast delivery. Signal.",

    # Uzbek — coded/slang
    "Gul bor, yangi hosildan. Narxi 50$ gramm. @gul_uz_real",
    "Tort sotiladi. Juda mazali va kuchli. DM yozing narx uchun.",
    "Qand bor. Sifatli. 1 kg — 300$. Yashirin yetkazib berish.",
    "Un sotiladi. Oq, toza. Gramm — 100$. Telegram orqali.",
    "Choy bor. Kuchli. Sifati a'lo. Yetkazib berish bor.",
    "Meva keldi. Yangi. Narxi arzon. Zakaz qabul. @fruit_dark_uz",
    "Dori sotiladi. Bosh ogrigiga. Juda kuchli. Retseptsiz. DM.",
    "Vitamin bor. Kuchli ta'sir. Tajriba uchun DM yozing.",
    "Kit sotiladi. Premium. 1 ta 50$. Toshkent ichida etkazish.",
    "Energetik bor. Juda kuchli. Kecha sinab ko'rdim. DM.",

    # Delivery and transaction patterns
    "Zakaz qabul. Prepayment kerak. 50% avans. Zakladka Toshkent.",
    "Etkazib berish bor. Yashirin. Toshkent, Andijon, Samarqand.",
    "Zakaz berish uchun @dark_shop_uz ga yozing. 24/7 ishlaydi.",
    "Anonim yetkazib berish. Bitcoin qabul qilamiz. Toshkent.",
    "Real xaridor bo'lsa DM. Simsiz aloqa. Xavfsiz.",
    "Prepaid orders only. Delivery within 2h. Tashkent.",
    "Закладка по городу. Предоплата. Без встречи.",
    "Клад в парке. Координаты после оплаты. Биткоин.",
    "Anonymous delivery. Prepayment via crypto. Tashkent area.",

    # Price mentions
    "1 gramm — 80 dollar. Sifatli. Toshkent yetkazish bepul.",
    "Optom narx: 10g — 500$. Yashirin paket. Signal yozing.",
    "Sotib olish uchun: 1g = 120$, 5g = 500$, 10g = 900$.",
    "Narxlar: 0.5g — 40$, 1g — 75$, 5g — 300$. DM.",
    "100$ dan boshlanadi. Sifat kafolat. Etkazish bepul.",
]

# ── NEGATIVE (safe / innocent content) ──────────────────────────────────────
NEGATIVE: list[str] = [
    # Normal commerce / shopping
    "Yangi kafe ochildi! Kofeyimiz va choyimiz bilan xush kelibsiz. #cafe #tashkent",
    "Sotuvda: yangi iPhone 15. Narxi 1200$. Kafolat bor. @iphone_uz",
    "Kiyim-kechak sotiladi. Arzon. Yangi kolleksiya. Instagram: @fashion_uz",
    "Uy jihozlari sotiladi. Krovat, shkaf, stol. Toshkent. Narxi 500$.",
    "Mashina sotiladi. Chevrolet Malibu 2021. 18000$. Kafolat bor.",
    "Kvartira ijaraga beriladi. 2 xonali. Toshkent Yunusobod. Oylik 600$.",
    "Restoran menu: lavash, shashlik, plov. Narxlar arzon. #toshkent",
    "Yangi onlayn do'kon ochildi. Elektr tovarlar. Arzon va sifatli.",
    "Ko'ylak, shim, kurtka sotiladi. Yangi, tegmagan. Narxi 50$.",
    "Eski mebel sotiladi. Sofa, stol, kreslo. Juda arzon.",

    # Health & medicine (legitimate)
    "Sog'lom turmush tarzi haqida maslahatlar. Sport va to'g'ri ovqatlanish.",
    "Vitamin D qabul qilish foydali. Quyosh nuri kamligi uchun.",
    "Gripp mavsumi: profilaktika choralari. Vrach maslahati.",
    "Diabet bilan yashamoq qiyin, lekin mumkin. Ovqatlanish rejimlari.",
    "Dorixonada Paracetamol, Ibuprofen sotiladi. Retsept talab qilinmaydi.",
    "Bolalar uchun vitamin kompleks. Immunitetni mustahkamlaydi.",
    "Yurak xastaligi uchun parhez. Shifokor tavsiya etadi.",
    "Grip uchun: kofe, limon, asal. Tabiiy davo.",
    "Qon bosimini tushiruvchi dorilar retsept bilan beriladi.",
    "Plastik operatsiya klinikasi. Konsultatsiya bepul.",

    # Food & agriculture
    "Yangi gul navlari keldi! Atirgul, lola, xrizantema. Har xil rangda.",
    "Tarvuz sotiladi. Yangi hosil. Fermerdan to'g'ridan-to'g'ri.",
    "Un keldi. Yuqori sifatli bug'doy uni. 50kg qop — 120 000 so'm.",
    "Shakar narxi pasaydi. Ulgurji savdo. 1 tonna — 3 million so'm.",
    "Qand-shakar fabrikasi mahsulotlari. Ulgurji narxda.",
    "Go'sht sotiladi. Mol go'shti. Yangi so'yilgan. Kg — 65 000 so'm.",
    "Asalari mahsulotlari: asal, mum, propolis. Tabiiy, sof.",
    "Limon, apelsin, mandarin. Yangi keldi. Arzon narxda.",
    "Meva-sabzavot bozori. Har kuni yangi mahsulotlar.",
    "Choy sotuvi. Hind choy, Xitoy choy, yashil choy. Ulgurji.",

    # Education & work
    "IELTS kurslari boshlanmoqda. Narxi arzon. Yuqori natija kafolatlangan.",
    "Dasturlash kurslari: Python, JavaScript, React. Online va offline.",
    "Ish kerak. Tajriba bor. Savdo, logistika sohasida ishladim.",
    "Tarjimon kerak. Ingliz-o'zbek-rus. Tajriba 5 yil. Tel: +998...",
    "Muhandis kerak. Qurilish tajribasi bor. Ish haqi kelishiladi.",
    "Maktab o'quvchilari uchun repetitor. Matematika, fizika.",
    "Universitetga kirish imtihonlariga tayyorgarlik.",
    "IT kompaniya xodimlari qidiryapti. Python developer.",
    "Buxgalter kerak. 1C bilimi talab qilinadi.",
    "HR menejer kerak. Ish tajribasi 2 yildan.",

    # Sports & entertainment
    "Bugun trenajyor zali — 30 daqiqa mashq. Sog'lom bo'ling!",
    "Futbol o'yini. Lokomotiv vs Pakhtakor. Soat 18:00 da.",
    "Yangi kino chiqdi. 'Avengers' Toshkent kinoteatrlarida.",
    "Konsert bo'ladi. Ulug'bek Musienko. Samarqand. 15-iyun.",
    "Chempionat boshlandi. O'zbek kurashi. Andijon.",
    "Yoga dars. Har kuni ertalab 7:00 da. Onlayn.",
    "Suzish havzasi ochildi. Bepul sinov darsi.",
    "Tennis kort. Soatiga 50 000 so'm. Bron qiling.",
    "Bolalar sport to'garagi. 5-12 yosh. Futbol, kurash.",
    "Velosiped uchish. Sog'lom turmush uchun.",

    # News & information
    "Toshkent shahri yangiliklari. Ko'cha ta'mirlash ishlari.",
    "O'zbekiston iqtisodiyoti o'sdi. GDP 6% oshdi.",
    "Yangi qonun qabul qilindi. Soliqlar haqida.",
    "Ob-havo: ertaga yomg'ir kutilmoqda. Harorat 25 daraja.",
    "Prezident farmoni. Ijtimoiy nafaqalar oshirildi.",
    "Narkotikdan voz kechamiz! Sog'lom jamiyat uchun.",
    "Narkotik xavfi haqida bilim. Yoshlar uchun ma'ruza.",
    "Reabilitatsiya markazi yangi xizmatlar taklif qilmoqda.",
    "Narkotik foydalanuvchilari uchun yordam xizmati.",
    "Giyohvand moddalardan xalos bo'lish mumkin. Bizga murojaat qiling.",

    # Russian safe content
    "Продаю квартиру. 3 комнаты. Ташкент. 45000$.",
    "Сдаётся офис. 50 кв.м. Центр Ташкента. 1000$/месяц.",
    "Репетитор по математике. Опыт 10 лет. Недорого.",
    "Новый ресторан открылся. Узбекская кухня. Добро пожаловать.",
    "Ищу работу. Бухгалтер. Опыт 5 лет. Рассмотрю все предложения.",
    "Продаётся автомобиль Nexia 3. 2022 год. 9500$.",
    "Медицинский центр. Консультация врача онлайн.",
    "Курсы английского языка. Все уровни. Онлайн.",
    "Футбол. Пакхтакор — Локомотив. Стадион Пахтакор.",
    "Погода в Ташкенте: жарко, 38 градусов. Берегите здоровье.",

    # English safe content
    "New cafe opened in Tashkent. Best coffee in the city!",
    "Apartment for rent. 2 bedrooms. Central Tashkent. $600/month.",
    "Looking for a job. Software engineer. 5 years experience.",
    "Flowers for sale. Fresh roses, tulips, lilies. Delivery available.",
    "Car for sale. Chevrolet Malibu 2021. $17,000. Good condition.",
    "English courses. All levels. Online and offline.",
    "Football match tonight. Lokomotiv vs Pakhtakor. 6 PM.",
    "New movie released. Watch it at any Tashkent cinema.",
    "Health tips: drink water, exercise, eat vegetables.",
    "Lost cat. Orange tabby. Please contact if found. Reward.",
]
