# PRD — Product Requirements Document
## NarkoMonitor: O'zbekiston Onlayn Narkotik Kontent Monitoring Tizimi

**Versiya:** 1.0  
**Sana:** 2026-06-26  
**Holat:** MVP tayyor → v2.0 ishlanmoqda

---

## 1. Mahsulot haqida

### 1.1 Muammo
O'zbekistonda narkotik moddalar savdosi ijtimoiy tarmoqlar va messenjerlar orqali yashirin sleng va kriptik matnlar bilan amalga oshirilmoqda. Mavjud nazorat usullari qo'lda, sekin va tarqoq bo'lib, real vaqtda katta hajmdagi kontentni skanerlash imkoniyati yo'q.

### 1.2 Yechim
NarkoMonitor — Claude AI yordamida Telegram, Instagram, OLX va boshqa platformalardagi shubhali kontentni avtomatik aniqlash, tasniflash va tegishli idoralarga yo'naltiruvchi real-vaqt monitoring tizimi.

### 1.3 Maqsad
- Narkotik kontent aniqlash tezligini **10x** oshirish
- Operator ish yukini **70%** kamaytirish
- UZINFOCOM ga bloklash so'rovlari vaqtini daqiqalardan sekundlarga tushirish

---

## 2. Foydalanuvchilar

| Rol | Kimlar | Asosiy vazifasi |
|---|---|---|
| **Operator** | Monitoring xodimi | Postlarni ko'rib chiqish, bloklash/yuborish |
| **Tahlilchi** | Analitik guruh | Statistika, hisobotlar, trend tahlil |
| **Admin** | IT ma'mur | Tizim sozlash, kalit so'zlar, API kalitlar |
| **Rahbar** | Bo'lim boshlig'i | Dashboard, yakuniy hisobotlar |

---

## 3. Funksional Talablar

### 3.1 Dashboard (Bosh panel)
- **F-01** Real vaqt statistika: aniqlangan, tekshiruvda, bloklangan, yuborilgan
- **F-02** Haftalik bar chart (aniqlangan vs bloklangan)
- **F-03** Platforma bo'yicha donut chart taqsimoti
- **F-04** So'nggi 5 ta hodisa jadvali
- **F-05** Jonli faollik lenti (live feed) — yangi skanlar real vaqtda
- **F-06** Top kalit so'zlar gorizontal bar chart
- **F-07** Tizim loglari paneli (jonli)

### 3.2 AI Skaner
- **F-08** Matn kiritish va platforma tanlash (Telegram/Instagram/OLX/Darkweb/Boshqa)
- **F-09** URL qo'shish imkoniyati (ixtiyoriy)
- **F-10** Claude AI orqali risk tahlili (0–100 ball)
- **F-11** Mahalliy kalit so'z aniqlash (AI ishlamasa fallback)
- **F-12** 3 bosqichli progress: Kiritish → AI tahlil → Natija
- **F-13** Natija: risk ball, verdict (XAVFSIZ/SHUBHALI/XAVFLI/KRITIK), kalit so'zlar, tahdid turi
- **F-14** Amallar: Bloklash so'rovi | Idoraga yuborish | Arxivlash | Nusxa olish
- **F-15** Skan tarixi (oxirgi 10 ta)
- **F-16** Sleng lug'ati (xavf darajasi bo'yicha)
- **F-17** Namuna matn yuklash

### 3.3 Ogohlantirishlar
- **F-18** Barcha hodisalar jadvali (paginated)
- **F-19** Filtrlar: Barchasi / Yuqori / O'rta / Past / Bloklangan / Yuborildi
- **F-20** Matn qidirish (platforma, matn, kalit so'z bo'yicha)
- **F-21** Tez amallar: har bir hodisa uchun bloklash / yuborish tugmalari
- **F-22** Eksport (CSV/Excel)

### 3.4 Faollik Xaritasi
- **F-23** O'zbekiston interaktiv xaritasi (viloyatlar bo'yicha)
- **F-24** Hodisa soni va xavf darajasi bo'yicha rangli markerlar
- **F-25** Marker bosib popup: shahar, hodisa soni, xavf darajasi
- **F-26** Xarita statistikasi: faol viloyat, bugungi hodisa, tekshiruv zonasi, bloklangan kanal

### 3.5 Hisobotlar
- **F-27** Davr, platforma va format (PDF/Excel/JSON) tanlash
- **F-28** Email ga yuborish imkoniyati
- **F-29** Oylik trend chiziqli grafik
- **F-30** Saqlangan hisobotlar ro'yxati va yuklab olish
- **F-31** Yangi hisobot avtomatik ro'yxatga qo'shilishi

### 3.6 Sozlamalar
- **F-32** Platform monitoring toggle-lari (Telegram/Instagram/OLX)
- **F-33** Avtomatik bloklash (risk ≥ 85 bo'lganda)
- **F-34** Bildirishnoma sozlamalari: Telegram bot, Email, Ovozli
- **F-35** Kalit so'zlar lug'ati CRUD (Yuqori/O'rta xavf)
- **F-36** API kalitlar paneli: Claude AI, UZINFOCOM, Telegram Bot

### 3.7 Umumiy UI/UX
- **F-37** Collapsible sidebar (kengaytirilgan/yig'ilgan rejim)
- **F-38** Global qidiruv topbar-da
- **F-39** Real vaqt soat (topbar)
- **F-40** Bildirishnoma dropdown (unread badge)
- **F-41** Toast xabarnomalar (success/warning/error)
- **F-42** Loading overlay (AI tahlil paytida)
- **F-43** Modal: idoraga yuborish formi

---

## 4. Funksional Bo'lmagan Talablar

### 4.1 Ishlash (Performance)
- AI skan natijasi: **< 5 soniya** (Claude API latency)
- Dashboard yuklash: **< 2 soniya**
- Jonli feed yangilanish: **har 8 soniyada**
- Bir vaqtda foydalanuvchilar: **≥ 50** (v2.0)

### 4.2 Xavfsizlik
- API kalitlar backend-da saqlanishi (frontend-da ochiq bo'lmasligi)
- Foydalanuvchi autentifikatsiya (v2.0)
- Tahlil qilingan matnlar shifrlangan holda saqlanishi
- Audit log: kim, qachon, qanday amal qilgan

### 4.3 Qulaylik (Usability)
- Dark theme (default)
- Responsive: 800px dan keng ekranlar
- O'zbek tilidagi to'liq interfeys
- Keyboard shortcuts (v2.0)

### 4.4 Ishonchlilik
- Claude API ishlamasa mahalliy kalit so'z fallback
- Uptime: **≥ 99%** (v2.0)
- Skan tarixi local storage-da saqlanishi

---

## 5. Integratsiyalar

| Xizmat | Maqsad | Holat |
|---|---|---|
| **Anthropic Claude API** | Matn risk tahlili | Ishlamoqda |
| **UZINFOCOM API** | Kontent bloklash so'rovi | Sozlanmoqda |
| **Telegram Bot API** | Bildirishnomalar | Faol |
| **Instagram Graph API** | Post kuzatish | Rejalashtirilgan |
| **OLX API** | E'lon monitoring | Rejalashtirilgan |

---

## 6. Muvaffaqiyat Metrikalari (KPI)

| Metrika | Hozir (MVP) | Maqsad (v2.0) |
|---|---|---|
| Kontent aniqlash aniqiligi | ~85% (demo) | ≥ 92% |
| Soxta ijobiy (false positive) | ~15% | ≤ 8% |
| Operator tasdiqlash vaqti | qo'lda | < 30 soniya/hodisa |
| Kunlik skanlanuvchi postlar | qo'lda | ≥ 10,000 |
| Bloklash vaqti (topilgandan) | soatlar | < 15 daqiqa |

---

## 7. Yetkazib Berish Rejasi

### MVP (Hozir — tayyor)
- [x] Single-file HTML dashboard
- [x] Claude AI integratsiya (to'g'ridan-to'g'ri)
- [x] Mahalliy kalit so'z aniqlash
- [x] 6 ta sahifa (Dashboard, Skaner, Ogohlantirishlar, Xarita, Hisobotlar, Sozlamalar)
- [x] Demo ma'lumotlar

### v2.0 (Keyingi bosqich)
- [ ] Backend API (Node.js/Python FastAPI)
- [ ] Ma'lumotlar bazasi (PostgreSQL)
- [ ] Foydalanuvchi autentifikatsiya
- [ ] Haqiqiy crawler/scraper
- [ ] UZINFOCOM real integratsiya
- [ ] Telegram kanal kuzatish boti
- [ ] Scheduled job-lar (cron)

### v3.0 (Kelajak)
- [ ] ML model fine-tuning (O'zbek sleng uchun)
- [ ] Blockchain audit trail
- [ ] Mobile app (React Native)
- [ ] Multi-idora portal

---

## 8. Cheklovlar va Risklar

| Risk | Ehtimol | Yechim |
|---|---|---|
| Claude API rate limit | O'rta | Queue + retry mexanizmi |
| Yashirin sleng o'zgarishi | Yuqori | Kalit so'z lug'atini muntazam yangilash |
| Instagram/Telegram anti-scraping | Yuqori | Official API + proxy rotation |
| UZINFOCOM API hujjatlari yo'q | O'rta | Manual webhook yoki email trigger |
| Noto'g'ri bloklash (false positive) | O'rta | Operator tasdiqlash bosqichi majburiy |
