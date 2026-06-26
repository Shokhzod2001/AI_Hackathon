# TASKS.md — NarkoMonitor Loyiha Vazifalari
## Boshidan oxirigacha to'liq yo'l xaritasi

**Loyiha:** NarkoMonitor v2.0  
**Sana:** 2026-06-26  
**Jami fazalar:** 8  

> **Belgilar:**  
> `[ ]` — Bajarilmagan &nbsp;|&nbsp; `[x]` — Bajarilgan &nbsp;|&nbsp; `[~]` — Jarayonda  
> 🔴 Kritik &nbsp;|&nbsp; 🟡 Muhim &nbsp;|&nbsp; 🟢 Oddiy

---

## FAZA 0 — MVP (Hozir tayyor)

- [x] Single-file HTML dashboard (index.html)
- [x] Claude AI to'g'ridan-to'g'ri integratsiya (browser fetch)
- [x] Mahalliy kalit so'z aniqlash (detectKeywords)
- [x] Risk ball hisoblash (calcLocalRisk)
- [x] Dashboard sahifasi (statistika, chartlar, live feed, logs)
- [x] AI Skaner sahifasi (3 bosqich)
- [x] Ogohlantirishlar sahifasi (filtr, qidiruv)
- [x] Xarita sahifasi (Leaflet, markerlar)
- [x] Hisobotlar sahifasi
- [x] Sozlamalar sahifasi (keywords, toggles, API cards)
- [x] Collapsible sidebar
- [x] Toast, Modal, Loading overlay
- [x] Demo ma'lumotlar (sampleAlerts, feedData, savedReports)

---

## FAZA 1 — Loyiha Sozlash va Infratuzilma

### 1.1 Umumiy Sozlash
- [ ] 🔴 GitHub repository yaratish (`narkomonitor`)
- [ ] 🔴 Monorepo tuzilmasi yaratish:
  ```
  narkomonitor/
  ├── backend/
  ├── frontend/
  ├── docker/
  ├── docs/
  ├── .github/
  └── docker-compose.yml
  ```
- [ ] 🔴 `.gitignore` — Python, Node, env fayllar
- [ ] 🟡 `README.md` — loyiha haqida, ishga tushirish yo'riqnomasi
- [ ] 🟢 `CONTRIBUTING.md` — kod uslubi va PR qoidalari

### 1.2 Docker Muhiti
- [ ] 🔴 `docker-compose.yml` yaratish (dev rejim):
  - `postgres:15` konteyner
  - `redis:7-alpine` konteyner
  - `backend` servis
  - `frontend` servis
  - `celery` worker servis
  - `minio` fayl saqlash
- [ ] 🔴 `docker-compose.prod.yml` — production sozlamalar
- [ ] 🟡 `docker/nginx/nginx.conf` — reverse proxy:
  - `/` → frontend
  - `/api/` → backend:8000
  - `/ws/` → backend WebSocket
- [ ] 🟡 `.env.example` fayl yaratish (barcha o'zgaruvchilar)
- [ ] 🟢 `Makefile` — tez ishlatish uchun:
  - `make dev` — dev muhit ishga tushirish
  - `make migrate` — DB migratsiya
  - `make test` — testlar
  - `make build` — production build

### 1.3 CI/CD (GitHub Actions)
- [ ] 🟡 `.github/workflows/ci.yml`:
  - Backend: pytest chaqirish
  - Frontend: vitest + build tekshirish
  - Linting: ruff (backend), eslint (frontend)
- [ ] 🟡 `.github/workflows/deploy.yml`:
  - `main` ga push → server deploy
  - Docker image build va push
- [ ] 🟢 Branch protection qoidalari (`main` — PR orqali)

---

## FAZA 2 — Backend: Asosiy Tuzilma

### 2.1 Python Loyiha Sozlash
- [ ] 🔴 `backend/` papkasini yaratish
- [ ] 🔴 Virtual muhit: `python -m venv .venv`
- [ ] 🔴 `requirements.txt` yozish:
  ```
  fastapi==0.115.x
  uvicorn[standard]==0.30.x
  sqlalchemy[asyncio]==2.0.x
  asyncpg==0.29.x
  alembic==1.13.x
  pydantic==2.7.x
  pydantic-settings==2.3.x
  python-jose[cryptography]==3.3.x
  passlib[bcrypt]==1.7.x
  httpx==0.27.x
  redis==5.0.x
  celery==5.4.x
  anthropic==0.28.x
  python-multipart==0.0.9
  minio==7.2.x
  pytest==8.2.x
  pytest-asyncio==0.23.x
  ruff==0.4.x
  ```
- [ ] 🔴 `backend/app/` tuzilmasini yaratish:
  ```
  app/
  ├── main.py              # FastAPI app instance
  ├── config.py            # Settings (pydantic-settings)
  ├── database.py          # Async SQLAlchemy engine
  ├── dependencies.py      # get_db, get_current_user
  ├── models/              # SQLAlchemy modellari
  ├── schemas/             # Pydantic sxemalari
  ├── routers/             # API routerlar
  ├── services/            # Biznes logika
  ├── tasks/               # Celery tasks
  └── utils/               # Yordamchi funksiyalar
  ```
- [ ] 🔴 `app/config.py` — `BaseSettings` orqali env yuklash
- [ ] 🔴 `app/database.py` — async engine, session factory
- [ ] 🟡 `app/main.py` — FastAPI app, CORS, router-lar ulash, lifespan

### 2.2 Ma'lumotlar Bazasi Modellari
- [ ] 🔴 `app/models/user.py` — User modeli
  - id (UUID), username, email, password_hash, role, is_active, created_at
- [ ] 🔴 `app/models/scan.py` — Scan modeli
  - id, user_id (FK), platform, source_url, content_text
  - risk_score, verdict, category, language, threat_type
  - keywords_found (ARRAY), ai_explanation, ai_raw_response (JSONB)
  - status, created_at, updated_at
- [ ] 🔴 `app/models/action.py` — Action modeli
  - id, scan_id (FK), user_id (FK), action_type, agency, priority, note, status, created_at
- [ ] 🔴 `app/models/keyword.py` — Keyword modeli
  - id, word, risk_level, language, added_by (FK), is_active, created_at
- [ ] 🔴 `app/models/report.py` — Report modeli
  - id, created_by (FK), title, period_from, period_to, platform, format, file_path, stats (JSONB), created_at
- [ ] 🟡 `app/models/audit_log.py` — AuditLog modeli
  - id, user_id (FK), action, entity_type, entity_id, meta (JSONB), ip_address, created_at
- [ ] 🔴 Alembic sozlash: `alembic init alembic`
- [ ] 🔴 Birinchi migratsiya yaratish: `alembic revision --autogenerate -m "initial"`
- [ ] 🔴 Migratsiya ishlatish: `alembic upgrade head`
- [ ] 🟡 DB indekslar yaratish (risk_score, status, created_at, platform, FTS)
- [ ] 🟡 Seed data skripti: boshlang'ich kalit so'zlar, test admin user

### 2.3 Autentifikatsiya Moduli
- [ ] 🔴 `app/utils/security.py`:
  - `hash_password(password)` — bcrypt
  - `verify_password(plain, hashed)` — bcrypt
  - `create_access_token(data, expires_delta)` — JWT RS256
  - `create_refresh_token(data)` — JWT
  - `decode_token(token)` — tekshirish va decode
- [ ] 🔴 `app/schemas/auth.py`:
  - `LoginRequest`, `TokenResponse`, `RefreshRequest`, `UserResponse`
- [ ] 🔴 `app/routers/auth.py`:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET  /api/v1/auth/me`
- [ ] 🔴 `app/dependencies.py`:
  - `get_current_user` — token decode va user yuklash
  - `require_role(roles)` — RBAC dependency
- [ ] 🟡 Refresh token Redis-da saqlash (blacklist uchun)
- [ ] 🟢 Login brute-force himoya (5 urinishdan keyin 15 daqiqa ban)

---

## FAZA 3 — Backend: Asosiy API Endpointlar

### 3.1 Skan Moduli
- [ ] 🔴 `app/schemas/scan.py`:
  - `ScanCreateRequest` (text, platform, url)
  - `ScanResponse` (barcha maydonlar)
  - `ScanListResponse` (pagination bilan)
  - `ScanStatsResponse` (dashboard uchun)
- [ ] 🔴 `app/services/keyword_service.py`:
  - `get_active_keywords()` — DB dan kalit so'zlar
  - `detect_keywords(text, keywords)` → `{high: [], mid: [], low: []}`
  - `calc_risk_score(found, text)` → `int (0-100)`
- [ ] 🔴 `app/services/claude_service.py`:
  - `analyze_text(text, platform)` — Anthropic SDK chaqirish
  - Prompt tuzish, JSON parse, xato boshqarish
  - Timeout: 10s, retry: 2x exponential backoff
  - Fallback: Claude ishlamasa `None` qaytarish
- [ ] 🔴 `app/services/scan_service.py`:
  - `create_scan(text, platform, url, user_id)` — to'liq pipeline
  - `get_scan(scan_id)`, `list_scans(filters, pagination)`
  - `update_scan_status(scan_id, status)`
  - `get_dashboard_stats()` — dashboard uchun agregat so'rovlar
  - `get_weekly_stats()` — 7 kunlik chart data
  - `get_platform_stats()` — donut chart
  - `get_top_keywords()` — eng ko'p uchragan kalit so'zlar
- [ ] 🔴 `app/routers/scans.py`:
  - `POST /api/v1/scans` — yangi skan (auth talab)
  - `GET  /api/v1/scans` — ro'yxat (filter, pagination, search)
  - `GET  /api/v1/scans/{id}` — bitta skan
  - `PATCH /api/v1/scans/{id}/status` — holat yangilash
  - `DELETE /api/v1/scans/{id}` — o'chirish (admin)
  - `GET  /api/v1/scans/stats/summary`
  - `GET  /api/v1/scans/stats/weekly`
  - `GET  /api/v1/scans/stats/monthly`
  - `GET  /api/v1/scans/stats/by-platform`
  - `GET  /api/v1/scans/stats/top-keywords`
- [ ] 🟡 Rate limiting: `POST /scans` — 30 req/min/user (Redis counter)
- [ ] 🟡 Input sanitizatsiya: matn 5000 belgi cheklov, HTML tozalash

### 3.2 Amallar (Actions) Moduli
- [ ] 🔴 `app/schemas/action.py`:
  - `ActionCreateRequest` (scan_id, action_type, agency, priority, note)
  - `ActionResponse`
- [ ] 🔴 `app/services/action_service.py`:
  - `create_action(data, user_id)` — amal yaratish + audit log
  - `list_actions(scan_id?, user_id?, page)` — tarixi
  - `update_action_status(action_id, status)`
- [ ] 🔴 `app/routers/actions.py`:
  - `POST /api/v1/actions`
  - `GET  /api/v1/actions`
  - `PATCH /api/v1/actions/{id}`
- [ ] 🟡 UZINFOCOM integratsiya trigger: bloklash amali yaratilganda
- [ ] 🟡 Telegram bot xabar: kritik amal bo'lsa operatorga xabar

### 3.3 Kalit So'zlar Moduli
- [ ] 🔴 `app/schemas/keyword.py`
- [ ] 🔴 `app/services/keyword_service.py` (CRUD funksiyalar qo'shish)
- [ ] 🔴 `app/routers/keywords.py`:
  - `GET  /api/v1/keywords`
  - `POST /api/v1/keywords`
  - `PATCH /api/v1/keywords/{id}`
  - `DELETE /api/v1/keywords/{id}`
  - `POST /api/v1/keywords/bulk`
- [ ] 🟡 Keywords Redis cache (TTL: 1 soat, skan paytida tez yuklash)

### 3.4 Hisobotlar Moduli
- [ ] 🟡 `app/services/report_service.py`:
  - `generate_report(period, platform, format, user_id)` — Celery task
  - `get_report_list(user_id)`
  - `get_report_file(report_id)` — MinIO dan stream
- [ ] 🟡 PDF generatsiya: `reportlab` yoki `weasyprint`
- [ ] 🟡 Excel generatsiya: `openpyxl`
- [ ] 🟡 JSON eksport: agregat ma'lumotlar
- [ ] 🟡 MinIO: fayl yuklash va signed URL
- [ ] 🟡 `app/routers/reports.py`:
  - `POST /api/v1/reports/generate`
  - `GET  /api/v1/reports`
  - `GET  /api/v1/reports/{id}/download`

### 3.5 Xarita va Dashboard Moduli
- [ ] 🟡 `app/routers/map.py`:
  - `GET /api/v1/map/incidents` — viloyat bo'yicha GeoJSON
- [ ] 🟡 O'zbekiston viloyatlari GeoJSON koordinatalari fayli
- [ ] 🟡 `app/routers/dashboard.py`:
  - `GET /api/v1/dashboard/live-feed` — oxirgi 20 ta hodisa

### 3.6 Admin Moduli
- [ ] 🟡 `app/routers/admin.py`:
  - `GET  /api/v1/admin/users`
  - `POST /api/v1/admin/users`
  - `PATCH /api/v1/admin/users/{id}` (rol, holat)
  - `GET  /api/v1/admin/settings`
  - `PATCH /api/v1/admin/settings`
  - `GET  /api/v1/admin/audit-logs`
- [ ] 🟡 Tizim sozlamalarini DB-da saqlash (settings jadval)
- [ ] 🟢 Foydalanuvchi uchun shaxsiy profil sahifasi API

### 3.7 WebSocket
- [ ] 🔴 `app/websocket/manager.py` — ConnectionManager:
  - `connect(websocket, client_id)`
  - `disconnect(client_id)`
  - `broadcast(message)` — barcha ulangan clientlarga
  - `send_to(client_id, message)` — bitta clientga
- [ ] 🔴 `app/routers/ws.py`:
  - `WS /ws/live-feed` — yangi hodisalar stream
  - `WS /ws/scan/{scan_id}` — skan progress (AI tahlil paytida)
- [ ] 🟡 WebSocket autentifikatsiya: token query param orqali

### 3.8 Audit Log
- [ ] 🟡 `app/utils/audit.py` — `log_action(user_id, action, entity, meta, ip)`
- [ ] 🟡 Barcha yozish (POST/PATCH/DELETE) endpointlarda audit log chaqirish
- [ ] 🟢 Audit loglar 90 kundan keyin avtomatik tozalanishi

---

## FAZA 4 — Backend: Integratsiyalar

### 4.1 Anthropic Claude AI
- [ ] 🔴 `app/services/claude_service.py` to'liq implementatsiya:
  - `anthropic.AsyncAnthropic` client
  - System prompt: O'zbek narkotik monitoring konteksti
  - User prompt template: matn, platforma, format talablari
  - JSON response parse va validatsiya
  - `risk_score`, `verdict`, `category`, `language`, `threat_type`, `explanation`, `recommended_action`
- [ ] 🔴 Xato boshqarish:
  - `APIConnectionError` → fallback (mahalliy tahlil)
  - `RateLimitError` → 60s kutish, retry
  - `APIStatusError` → log va fallback
  - JSON parse xatosi → raw text saqlash
- [ ] 🟡 Token sarfi monitoring (Prometheus metric)
- [ ] 🟡 Prompt versiyalash (yangi prompt sinab ko'rish uchun)

### 4.2 UZINFOCOM API
- [ ] 🟡 `app/services/uzinfocom_service.py`:
  - `send_block_request(url, platform, reason)` — bloklash so'rovi
  - `check_block_status(request_id)` — holat tekshirish
  - HTTP client: `httpx.AsyncClient`
- [ ] 🟡 UZINFOCOM API hujjatlarini o'rganish va endpoint-larni aniqlash
- [ ] 🟡 Bloklash natijasini action statusiga yozish
- [ ] 🟢 Webhook endpoint: UZINFOCOM tasdiqlash javobini qabul qilish

### 4.3 Telegram Bot
- [ ] 🟡 `app/services/telegram_service.py`:
  - `send_notification(chat_id, message, parse_mode)` — xabar yuborish
  - `send_alert(scan_result)` — yangi kritik hodisa xabari
  - `send_daily_report(stats)` — kunlik hisobot
- [ ] 🟡 Telegram bot yaratish (`@BotFather`) va token olish
- [ ] 🟡 Xabar shablonlari: kritik hodisa, bloklash tasdiq, kunlik hisobot
- [ ] 🟢 Telegram orqali buyruq qabul qilish (`/stats`, `/block <url>`)

### 4.4 Crawler / Scheduler (Celery)
- [ ] 🟡 `app/tasks/__init__.py` — Celery instance yaratish
- [ ] 🟡 `app/tasks/crawler.py`:
  - `scan_telegram_channels()` — kanal ro'yxatidan postlarni olish
  - `scan_instagram_hashtags()` — hashtag monitoring
  - `scan_olx_listings()` — e'lonlarni skanerlash
- [ ] 🟡 `app/tasks/reports.py`:
  - `generate_daily_report()` — kunlik avtomatik hisobot
  - `send_daily_digest()` — operatorlarga email
- [ ] 🟡 `app/tasks/maintenance.py`:
  - `cleanup_old_logs()` — 90 kundan eski audit loglarni o'chirish
  - `refresh_keyword_cache()` — Redis cache yangilash
- [ ] 🟡 Celery Beat schedule sozlash:
  ```python
  CELERY_BEAT_SCHEDULE = {
      'telegram-crawler':  {'task': 'scan_telegram',  'schedule': crontab(minute='*/5')},
      'instagram-monitor': {'task': 'scan_instagram', 'schedule': crontab(minute='*/15')},
      'olx-scraper':       {'task': 'scan_olx',       'schedule': crontab(minute='*/30')},
      'daily-report':      {'task': 'daily_report',   'schedule': crontab(hour=8, minute=0)},
      'cleanup-logs':      {'task': 'cleanup_logs',   'schedule': crontab(hour=3, minute=0)},
  }
  ```
- [ ] 🟢 Celery Flower — task monitoring UI

---

## FAZA 5 — Frontend: Asosiy Tuzilma

### 5.1 React Loyiha Sozlash
- [ ] 🔴 `frontend/` papkasini yaratish
- [ ] 🔴 Vite + React + TypeScript: `npm create vite@latest frontend -- --template react-ts`
- [ ] 🔴 Asosiy paketlar o'rnatish:
  ```bash
  npm install react-router-dom axios @tanstack/react-query zustand
  npm install chart.js react-chartjs-2 leaflet react-leaflet
  npm install react-hook-form zod @hookform/resolvers
  npm install lucide-react
  npm install -D @types/leaflet vitest @testing-library/react
  npm install -D eslint @typescript-eslint/eslint-plugin prettier
  ```
- [ ] 🔴 `vite.config.ts` — proxy sozlash (`/api` → backend)
- [ ] 🔴 `tsconfig.json` — `paths` alias (`@/` → `src/`)
- [ ] 🟡 `.eslintrc` va `.prettierrc` sozlash
- [ ] 🟡 `src/types/` — barcha TypeScript interfeyslari:
  - `scan.ts`, `user.ts`, `alert.ts`, `keyword.ts`, `report.ts`

### 5.2 CSS va Dizayn Tizimi
- [ ] 🔴 `src/styles/variables.css` — CSS o'zgaruvchilar (MVP dizayndan ko'chirish):
  - Ranglar: `--bg`, `--card`, `--accent`, `--danger`, `--warn`, `--ok`
  - Tipografiya, border-radius, sidebar kenglik
- [ ] 🔴 `src/styles/global.css` — bazaviy stillar
- [ ] 🔴 `src/styles/components.css` — umumiy komponent stillar
- [ ] 🟡 Dark theme asosiy, light theme ixtiyoriy (v3.0)

### 5.3 API Klient
- [ ] 🔴 `src/api/client.ts`:
  - Axios instance (`baseURL`, `timeout: 15000`)
  - Request interceptor: `Authorization: Bearer <token>`
  - Response interceptor: 401 → token refresh, 403 → logout, 500 → toast
- [ ] 🔴 `src/api/auth.ts` — login, logout, refresh, me
- [ ] 🔴 `src/api/scans.ts` — CRUD + stats endpointlar
- [ ] 🔴 `src/api/keywords.ts` — CRUD
- [ ] 🟡 `src/api/reports.ts` — generate, list, download
- [ ] 🟡 `src/api/actions.ts` — create, list
- [ ] 🟡 `src/api/map.ts` — incidents GeoJSON
- [ ] 🟡 `src/api/admin.ts` — users, settings, audit logs

### 5.4 State Management (Zustand)
- [ ] 🔴 `src/store/authStore.ts`:
  - `user`, `accessToken`, `isAuthenticated`
  - `login()`, `logout()`, `refreshToken()`, `setUser()`
  - LocalStorage persist (token)
- [ ] 🔴 `src/store/scanStore.ts`:
  - `currentResult`, `history` (oxirgi 10), `isLoading`, `step`
  - `runScan()`, `clearScan()`, `setStep()`, `addToHistory()`
- [ ] 🟡 `src/store/alertStore.ts`:
  - `alerts`, `filter`, `searchQuery`
  - `setFilter()`, `setSearch()`, `addAlert()`
- [ ] 🟡 `src/store/settingsStore.ts`:
  - `keywords`, `toggles`, `apiKeys`
  - `addKeyword()`, `removeKeyword()`, `toggleSetting()`
- [ ] 🟢 `src/store/notifStore.ts`:
  - `notifications`, `unreadCount`
  - `markAllRead()`, `addNotif()`

### 5.5 Yordamchi Funksiyalar
- [ ] 🔴 `src/lib/riskCalc.ts`:
  - `detectKeywords(text, keywords)` → `{high, mid, low}`
  - `calcRiskScore(found, text)` → `number`
  - MVP dan aynan ko'chirish va TypeScript-ga o'girish
- [ ] 🔴 `src/lib/formatters.ts`:
  - `formatDate(date)` — O'zbek tilida sana
  - `formatRisk(score)` → `'XAVFSIZ' | 'SHUBHALI' | 'XAVFLI' | 'KRITIK'`
  - `getRiskColor(score)` — CSS rang qaytarish
  - `truncateText(text, maxLen)` — qisqartirish
- [ ] 🟡 `src/lib/export.ts`:
  - `downloadBlob(blob, filename)` — fayl yuklash helper

### 5.6 Hooks
- [ ] 🔴 `src/hooks/useToast.ts` — toast state va `showToast(msg, type)`
- [ ] 🔴 `src/hooks/useWebSocket.ts`:
  - `useLiveFeed()` — `/ws/live-feed` ga ulanish
  - Reconnect logikasi (3 soniya, max 5 urinish)
  - Token bilan autentifikatsiya
- [ ] 🟡 `src/hooks/useDebounce.ts` — `debounce(value, delay)` hook
- [ ] 🟡 `src/hooks/useLocalStorage.ts` — localStorage wrapper

---

## FAZA 6 — Frontend: Komponentlar va Sahifalar

### 6.1 Layout Komponentlar
- [ ] 🔴 `src/components/layout/Sidebar.tsx`:
  - Nav itemlar: Dashboard, Skaner, Ogohlantirishlar, Xarita, Hisobotlar, Sozlamalar
  - Collapsible: kengaytirilgan/yig'ilgan
  - Active holat: `useLocation()` orqali
  - Nav badge (alert count)
- [ ] 🔴 `src/components/layout/Topbar.tsx`:
  - Sahifa nomi, global qidiruv input
  - Real vaqt soat
  - Yangilash tugmasi, yangi skan tugmasi
  - Bildirishnoma bell icon (unread badge)
  - Foydalanuvchi avatar
- [ ] 🔴 `src/components/layout/NotifDropdown.tsx`:
  - Bildirishnomalar ro'yxati
  - `markAllRead()` tugmasi
  - Click outside yopilish
- [ ] 🔴 `src/components/layout/AppLayout.tsx`:
  - Sidebar + Main wrapper
  - `<Outlet />` router uchun

### 6.2 UI Komponentlar
- [ ] 🔴 `src/components/ui/StatCard.tsx`:
  - Props: `title`, `value`, `icon`, `trend`, `color`, `progress`
  - Animatsiyali counter (0 dan value gacha)
  - Hover effekti
- [ ] 🔴 `src/components/ui/Badge.tsx`:
  - Props: `variant` (red|yellow|blue|green|purple|gray), `children`
- [ ] 🔴 `src/components/ui/Toast.tsx`:
  - Global toast state-dan o'qiydi
  - Auto-hide: 3.5 soniya
  - Animatsiya: pastdan ko'tarilish
- [ ] 🔴 `src/components/ui/Modal.tsx`:
  - Props: `isOpen`, `onClose`, `title`, `children`
  - Backdrop click va ESC yopilish
  - Animatsiya: fadeIn
- [ ] 🔴 `src/components/ui/LoadingOverlay.tsx`:
  - Global loading state-dan
  - Spinner + matn
  - Backdrop blur
- [ ] 🔴 `src/components/ui/Toggle.tsx`:
  - Controlled: `checked`, `onChange`
- [ ] 🟡 `src/components/ui/Table.tsx`:
  - Generic `<Table columns data />` komponent
  - Hover row, last row border yo'q
- [ ] 🟡 `src/components/ui/Pagination.tsx`:
  - Sahifalar navigatsiyasi
- [ ] 🟡 `src/components/ui/FilterBar.tsx`:
  - Filter tugmalar group
- [ ] 🟡 `src/components/ui/SkeletonLoader.tsx`:
  - Yuklash paytida placeholder animatsiya

### 6.3 Chart Komponentlar
- [ ] 🔴 `src/components/charts/WeeklyBarChart.tsx`:
  - Props: `data` (7 kunlik detected + blocked)
  - Chart.js bar chart, dark theme
- [ ] 🔴 `src/components/charts/PlatformDoughnut.tsx`:
  - Props: `data` (platform taqsimoti)
  - Legend: pastda, rangli
- [ ] 🔴 `src/components/charts/KeywordsBarChart.tsx`:
  - Props: `data` (kalit so'z + sonlar)
  - Horizontal bar, qizil rang
- [ ] 🔴 `src/components/charts/MonthlyLineChart.tsx`:
  - Props: `data` (12 oylik)
  - Gradient fill, smooth curve

### 6.4 Scanner Komponentlar
- [ ] 🔴 `src/components/scanner/ScanForm.tsx`:
  - Textarea (maks 5000 belgi, char counter)
  - Platform select (Telegram/Instagram/OLX/Darkweb/Boshqa)
  - URL input (ixtiyoriy)
  - `runAIScan()` trigger
  - Namuna yuklash / tozalash tugmalar
- [ ] 🔴 `src/components/scanner/StepBar.tsx`:
  - 3 bosqich: active/done/waiting holat
  - Animatsiya
- [ ] 🔴 `src/components/scanner/RiskCircle.tsx`:
  - Props: `score` (0-100)
  - Rang: score bo'yicha (yashil/sariq/qizil)
  - Animatsiyali raqam
- [ ] 🔴 `src/components/scanner/ScanResult.tsx`:
  - Risk circle + AI xulosasi
  - Kalit so'zlar teglari
  - Tahlil grid (platforma, kategoriya, til, tahdid)
  - Claude to'liq tahlili (collapsible)
  - Amal tugmalari (Bloklash, Yuborish, Arxiv, Nusxa)
- [ ] 🟡 `src/components/scanner/ScanHistory.tsx`:
  - Oxirgi 10 ta skan ro'yxati
  - Risk ball rang bilan
  - Klik → qayta ko'rish
- [ ] 🟡 `src/components/scanner/SlangDictionary.tsx`:
  - Yuqori/O'rta/Past xavf kalit so'zlar
  - Teglar ko'rinishida

### 6.5 Sahifalar
- [ ] 🔴 `src/pages/LoginPage.tsx`:
  - Username + password forma
  - React Hook Form + Zod validatsiya
  - `login()` action, error ko'rsatish
  - Enter tugma submit
- [ ] 🔴 `src/pages/DashboardPage.tsx`:
  - 4 ta StatCard (React Query orqali)
  - WeeklyBarChart + PlatformDoughnut (2 col)
  - RecentTable + LiveFeed (2 col)
  - KeywordsBarChart + LogsPanel (2 col)
  - Auto refresh: 30 soniya
- [ ] 🔴 `src/pages/ScannerPage.tsx`:
  - StepBar + ScanForm (chap)
  - ScanHistory + SlangDictionary (o'ng)
  - ScanResult (pastda, show/hide)
- [ ] 🔴 `src/pages/AlertsPage.tsx`:
  - FilterBar (Barchasi/Yuqori/O'rta/Past/Bloklangan/Yuborildi)
  - Qidiruv input (debounce)
  - Alerts jadval (server-side filter)
  - Pagination
  - Tez amallar har bir qatorda
- [ ] 🟡 `src/pages/MapPage.tsx`:
  - 4 ta StatCard
  - Leaflet xarita (lazy init)
  - Viloyat markerlar (GeoJSON + renk = risk)
  - Popup: shahar, hodisa soni, xavf darajasi
- [ ] 🟡 `src/pages/ReportsPage.tsx`:
  - 4 ta statistika karta
  - Hisobot yaratish forma (davr, platforma, format, email)
  - MonthlyLineChart
  - Saqlangan hisobotlar jadvali + yuklab olish
- [ ] 🟡 `src/pages/SettingsPage.tsx`:
  - Monitoring toggle-lar
  - Bildirishnoma toggle-lar
  - Keywords CRUD panel
  - API integratsiya karta-lar (key input, holat)
- [ ] 🟢 `src/pages/AdminPage.tsx`:
  - Foydalanuvchilar jadvali
  - Yangi foydalanuvchi qo'shish
  - Rol o'zgartirish
  - Audit log jadvali

### 6.6 Router va Routing
- [ ] 🔴 `src/router/index.tsx`:
  - `BrowserRouter` + route-lar
  - `<PrivateRoute>` — token yo'q bo'lsa `/login`-ga yo'naltirish
  - Lazy loading: har sahifa `React.lazy()`
  - `<Suspense fallback={<LoadingOverlay />}>`
- [ ] 🔴 Sahifalar routlari:
  ```
  /login          → LoginPage (public)
  /               → redirect → /dashboard
  /dashboard      → DashboardPage (private)
  /scanner        → ScannerPage (private)
  /alerts         → AlertsPage (private)
  /map            → MapPage (private)
  /reports        → ReportsPage (private)
  /settings       → SettingsPage (private, admin/analyst)
  /admin          → AdminPage (private, admin only)
  ```

### 6.7 Real Vaqt va LiveFeed
- [ ] 🔴 `useWebSocket` hook implementatsiya
- [ ] 🔴 DashboardPage-da LiveFeed WebSocket-dan yangilanishi
- [ ] 🟡 Topbar bildirishnomalar WebSocket-dan (yangi kritik hodisa)
- [ ] 🟡 Alert count badge real vaqt yangilanishi
- [ ] 🟢 Toast: yangi kritik hodisa kelganda avtomatik ko'rsatish

### 6.8 Report Yuborish Modali
- [ ] 🔴 `src/components/modals/ReportModal.tsx`:
  - Idora select (IIV/NNA/PROKURATURA/DXX)
  - Muhimlik darajasi select
  - Izoh textarea
  - `sendReport()` API chaqirish
  - Submit loading state

---

## FAZA 7 — Testlar

### 7.1 Backend Testlar
- [ ] 🔴 `backend/tests/conftest.py`:
  - `pytest-asyncio` sozlash
  - Test DB yaratish (SQLite in-memory yoki test PostgreSQL)
  - `test_client` fixture (FastAPI TestClient)
  - `auth_headers` fixture (test JWT token)
- [ ] 🔴 `tests/test_auth.py`:
  - Login muvaffaqiyatli
  - Login noto'g'ri parol → 401
  - Token refresh
  - Himoyalangan endpoint tokensizsiz → 401
- [ ] 🔴 `tests/test_scans.py`:
  - Yangi skan yaratish (Claude mock bilan)
  - Mahalliy kalit so'z aniqlash to'g'riligi
  - Risk ball hisoblash (edge cases)
  - Skan filtrlash (risk, platform, status)
  - Holat yangilash
  - Ruxsatsiz o'chirish → 403
- [ ] 🟡 `tests/test_keywords.py`:
  - CRUD operatsiyalar
  - Takroriy so'z → 409
  - Bulk qo'shish
- [ ] 🟡 `tests/test_claude_service.py`:
  - `anthropic` SDK mock
  - Muvaffaqiyatli response parse
  - JSON xatosi boshqaruvi
  - Timeout → fallback
- [ ] 🟡 `tests/test_actions.py`:
  - Amal yaratish
  - Audit log yozilganini tekshirish
- [ ] 🟢 `tests/test_reports.py` — hisobot yaratish (Celery mock)
- [ ] 🟢 Coverage 70%+ tekshirish: `pytest --cov=app --cov-report=html`

### 7.2 Frontend Testlar
- [ ] 🟡 `vitest.config.ts` sozlash
- [ ] 🟡 `src/lib/riskCalc.test.ts`:
  - Kalit so'z aniqlash to'g'riligi
  - Risk ball chegaraviy qiymatlar
- [ ] 🟡 `src/lib/formatters.test.ts`:
  - Sana formatlash
  - Risk verdict to'g'riligi
- [ ] 🟡 `src/components/ui/StatCard.test.tsx` (RTL):
  - Render to'g'riligi
  - Value ko'rsatish
- [ ] 🟡 `src/components/scanner/RiskCircle.test.tsx`:
  - Yuqori risk — qizil rang
  - Past risk — yashil rang
- [ ] 🟢 `src/pages/LoginPage.test.tsx`:
  - Forma submit
  - Xato ko'rsatish
- [ ] 🟢 E2E (Playwright):
  - Login → Dashboard ko'rish
  - Scanner: matn kiritish → natija ko'rish
  - Alerts: filtr bosish

---

## FAZA 8 — Deployment va Yakunlash

### 8.1 Production Muhit
- [ ] 🔴 Server tanlash (VPS: DigitalOcean/Hetzner, min 2 vCPU 4GB RAM)
- [ ] 🔴 Ubuntu 22.04, Docker + Docker Compose o'rnatish
- [ ] 🔴 Domain: `narkomonitor.uz` (yoki sub-domen)
- [ ] 🔴 SSL sertifikat: Let's Encrypt + Certbot (yoki Nginx Proxy Manager)
- [ ] 🔴 `.env` production sozlash (barcha kalitlar)
- [ ] 🔴 PostgreSQL production: strong parol, backup sozlash
- [ ] 🔴 `docker-compose.prod.yml` ishga tushirish

### 8.2 Xavfsizlik
- [ ] 🔴 Firewall: faqat 80, 443 va SSH portlar ochiq
- [ ] 🔴 SSH key-based auth, parol kirish o'chirilgan
- [ ] 🟡 Fail2ban — SSH brute-force himoya
- [ ] 🟡 Nginx rate limiting
- [ ] 🟡 Security headers (X-Frame-Options, CSP, HSTS)
- [ ] 🟡 Secrets: `.env` faylni `chmod 600` qilish

### 8.3 Monitoring va Logging
- [ ] 🟡 Backend loglar: `uvicorn` + JSON format, fayllarga yozish
- [ ] 🟡 Celery loglar: alohida fayl
- [ ] 🟡 Log rotatsiya (logrotate)
- [ ] 🟢 Prometheus metrics endpoint (`/metrics`)
- [ ] 🟢 Grafana dashboard: API latency, Claude API xarajati, skan soni

### 8.4 Backup
- [ ] 🟡 PostgreSQL kunlik backup skripti (pg_dump → S3/MinIO)
- [ ] 🟡 Backup test: tiklanish tekshirish
- [ ] 🟢 Avtomatik backup cron: har kuni 02:00

### 8.5 Yakuniy Tekshirish
- [ ] 🔴 Barcha API endpoint-lar production-da ishlashi
- [ ] 🔴 AI skan to'liq flow tekshirish (real matn bilan)
- [ ] 🔴 WebSocket live feed tekshirish
- [ ] 🔴 Login/logout flow
- [ ] 🔴 Hisobot yaratish va yuklab olish
- [ ] 🟡 Mobile responsiveness (768px+)
- [ ] 🟡 Browser compatibility: Chrome, Firefox, Edge
- [ ] 🟡 Load test: 50 bir vaqtda foydalanuvchi
- [ ] 🟢 Axborot xavfsizligi tekshiruvi (OWASP top 10)

### 8.6 Hujjatlar
- [ ] 🟡 `docs/api.md` — API endpointlar qo'llanmasi (yoki Swagger UI)
- [ ] 🟡 `docs/deploy.md` — server sozlash yo'riqnomasi
- [ ] 🟡 `docs/user-guide.md` — operator uchun qo'llanma
- [ ] 🟢 `docs/architecture.md` — tizim arxitekturasi diagramma
- [ ] 🟢 Video demo: asosiy funksiyalar namoyishi

---

## Umumiy Progress Hisoblagich

| Faza | Jami task | Bajarilgan | % |
|---|---|---|---|
| Faza 0 — MVP | 13 | 13 | 100% |
| Faza 1 — Infra | 14 | 0 | 0% |
| Faza 2 — Backend Tuzilma | 29 | 0 | 0% |
| Faza 3 — Backend API | 37 | 0 | 0% |
| Faza 4 — Integratsiyalar | 22 | 0 | 0% |
| Faza 5 — Frontend Tuzilma | 23 | 0 | 0% |
| Faza 6 — Frontend UI | 42 | 0 | 0% |
| Faza 7 — Testlar | 18 | 0 | 0% |
| Faza 8 — Deployment | 24 | 0 | 0% |
| **Jami** | **222** | **13** | **6%** |

---

## Muhim Eslatmalar

> **Boshlash tartibi:** Faza 1 → 2 → 3 → 5 → 6 (parallel mumkin: Backend Faza 2-3 va Frontend Faza 5-6)

> **Minimal ishlaydigan v2.0 uchun:** 🔴 Kritik barcha task-lar bajarilishi shart (~85 ta)

> **Hackathon demo uchun:** MVP (index.html) + Faza 2.1-2.3 + Faza 3.1 + Faza 5.1-5.3 + Faza 6.5 (`/login`, `/dashboard`, `/scanner`)
