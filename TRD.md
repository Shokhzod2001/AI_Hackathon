# TRD — Technical Requirements Document
## NarkoMonitor: Backend & Frontend Arxitektura

**Versiya:** 1.0  
**Sana:** 2026-06-26  
**Stack:** FastAPI + PostgreSQL + React (v2.0 maqsad)

---

## 1. Umumiy Arxitektura

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│  React + Vite  │  Chart.js  │  Leaflet  │  Zustand  │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS REST / WebSocket
┌────────────────────────▼────────────────────────────┐
│                  BACKEND API                        │
│        FastAPI (Python 3.11+)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Auth    │ │  Scan    │ │  Crawler / Scheduler │ │
│  │  Module  │ │  Engine  │ │  (Celery + Redis)    │ │
│  └──────────┘ └────┬─────┘ └──────────────────────┘ │
└───────────────────┬┴────────────────────────────────┘
          ┌─────────┴──────────┐
   ┌──────▼──────┐    ┌────────▼────────┐
   │ PostgreSQL  │    │  External APIs  │
   │  (main DB)  │    │  Claude AI      │
   └─────────────┘    │  UZINFOCOM      │
                      │  Telegram Bot   │
                      └─────────────────┘
```

---

## 2. BACKEND

### 2.1 Texnologiyalar

| Komponent | Texnologiya | Sabab |
|---|---|---|
| Framework | **FastAPI** (Python 3.11+) | Async, tez, auto OpenAPI docs |
| Ma'lumotlar bazasi | **PostgreSQL 15** | JSON ustunlar, full-text search |
| ORM | **SQLAlchemy 2.0 + Alembic** | Async, migrations |
| Cache | **Redis 7** | Session, rate limit, job queue |
| Task queue | **Celery** | Crawler cron jobs, scheduled scans |
| Auth | **JWT (RS256)** + refresh token | Stateless, xavfsiz |
| Validation | **Pydantic v2** | FastAPI bilan naytiv |
| File storage | **MinIO** (S3-compatible) | Hisobot fayllari |
| Monitoring | **Prometheus + Grafana** | Metrics, alerting |

### 2.2 Ma'lumotlar Bazasi Sxemasi

```sql
-- Foydalanuvchilar
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR(64) UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,       -- bcrypt hash
  role        VARCHAR(32) NOT NULL,        -- operator|analyst|admin|manager
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Skanlar (AI tahlil natijalari)
CREATE TABLE scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  platform        VARCHAR(32) NOT NULL,   -- telegram|instagram|olx|darkweb|other
  source_url      TEXT,
  content_text    TEXT NOT NULL,
  risk_score      SMALLINT NOT NULL,      -- 0–100
  verdict         VARCHAR(32) NOT NULL,   -- XAVFSIZ|SHUBHALI|XAVFLI|KRITIK
  category        VARCHAR(32),            -- narkotik|qurol|boshqa|xavfsiz
  language        VARCHAR(32),
  threat_type     VARCHAR(32),
  keywords_found  TEXT[],
  ai_explanation  TEXT,
  ai_raw_response JSONB,
  status          VARCHAR(32) DEFAULT 'pending',  -- pending|blocked|reported|archived
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Ogohlantirishlar va amallar
CREATE TABLE actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id     UUID REFERENCES scans(id),
  user_id     UUID REFERENCES users(id),
  action_type VARCHAR(32) NOT NULL,   -- block_request|report|archive|review
  agency      VARCHAR(128),           -- IIV|NNA|PROKURATURA|DXX
  priority    VARCHAR(32),            -- critical|high|normal
  note        TEXT,
  status      VARCHAR(32) DEFAULT 'sent',  -- sent|confirmed|rejected
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Kalit so'zlar lug'ati
CREATE TABLE keywords (
  id          SERIAL PRIMARY KEY,
  word        VARCHAR(128) NOT NULL,
  risk_level  VARCHAR(8) NOT NULL,   -- high|mid|low
  language    VARCHAR(16),           -- uz|ru|mixed
  added_by    UUID REFERENCES users(id),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(word, risk_level)
);

-- Hisobotlar
CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  UUID REFERENCES users(id),
  title       VARCHAR(256) NOT NULL,
  period_from DATE NOT NULL,
  period_to   DATE NOT NULL,
  platform    VARCHAR(32),
  format      VARCHAR(16) NOT NULL,  -- pdf|excel|json
  file_path   TEXT,                  -- MinIO path
  stats       JSONB,                 -- snapshot of aggregated data
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64),
  entity_id   UUID,
  meta        JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indekslar
CREATE INDEX idx_scans_platform ON scans(platform);
CREATE INDEX idx_scans_risk_score ON scans(risk_score DESC);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_scans_fts ON scans USING gin(to_tsvector('simple', content_text));
```

### 2.3 API Endpointlar

#### Auth
```
POST   /api/v1/auth/login          → { access_token, refresh_token }
POST   /api/v1/auth/refresh        → { access_token }
POST   /api/v1/auth/logout
GET    /api/v1/auth/me             → User
```

#### Skanlar
```
POST   /api/v1/scans               → yangi skan (AI tahlil)
GET    /api/v1/scans               → ro'yxat (filter: platform, risk, status, search, date)
GET    /api/v1/scans/{id}          → bitta skan
PATCH  /api/v1/scans/{id}/status   → holat yangilash
DELETE /api/v1/scans/{id}          → o'chirish (admin)

GET    /api/v1/scans/stats/summary → dashboard statistika
GET    /api/v1/scans/stats/weekly  → haftalik chart data
GET    /api/v1/scans/stats/monthly → oylik trend data
GET    /api/v1/scans/stats/by-platform → donut chart data
GET    /api/v1/scans/stats/top-keywords → top kalit so'zlar
```

#### Amallar
```
POST   /api/v1/actions             → bloklash/yuborish amali
GET    /api/v1/actions             → amallar tarixi
PATCH  /api/v1/actions/{id}        → holat yangilash
```

#### Kalit So'zlar
```
GET    /api/v1/keywords            → ro'yxat (risk_level filter)
POST   /api/v1/keywords            → yangi so'z
DELETE /api/v1/keywords/{id}
PATCH  /api/v1/keywords/{id}
POST   /api/v1/keywords/bulk       → ko'plab qo'shish
```

#### Hisobotlar
```
POST   /api/v1/reports/generate    → hisobot yaratish (async task)
GET    /api/v1/reports             → ro'yxat
GET    /api/v1/reports/{id}/download → fayl yuklab olish
```

#### Dashboard / Map
```
GET    /api/v1/map/incidents       → viloyat bo'yicha hodisalar (GeoJSON)
GET    /api/v1/dashboard/live-feed → oxirgi N ta hodisa
```

#### WebSocket
```
WS     /ws/live-feed               → real vaqt hodisalar stream
WS     /ws/scan-result/{scan_id}   → AI tahlil progress
```

#### Admin
```
GET    /api/v1/admin/users
POST   /api/v1/admin/users
PATCH  /api/v1/admin/users/{id}
GET    /api/v1/admin/settings
PATCH  /api/v1/admin/settings
GET    /api/v1/admin/audit-logs
```

### 2.4 AI Skan Logikasi

```python
# Skan pipeline
async def process_scan(text: str, platform: str) -> ScanResult:
    # 1. Mahalliy kalit so'z aniqlash
    local = detect_keywords(text, await get_keywords())
    local_score = calc_risk_score(local, text)

    # 2. Claude API ga so'rov
    ai_result = await call_claude(text, platform)

    # 3. Natijalarni birlashtirish
    final_score = max(local_score, ai_result.risk_score)

    # 4. DB ga yozish
    scan = await save_scan(text, platform, final_score, ai_result, local)

    # 5. Yuqori xavf bo'lsa avtomatik action
    if final_score >= 85 and settings.auto_block:
        await trigger_uzinfocom_block(scan)

    # 6. WebSocket orqali frontend ga yuborish
    await broadcast_scan(scan)

    return scan
```

**Claude API prompt tuzilmasi:**
```python
SYSTEM = """Sen O'zbekiston narkotik monitoring tizimining AI tahlilchisisag.
Faqat JSON formatida javob ber. Hech qanday izoh yozma."""

USER_TEMPLATE = """
MATN: {text}
PLATFORMA: {platform}

JSON formatda qaytardir:
{
  "risk_score": 0-100,
  "verdict": "XAVFSIZ|SHUBHALI|XAVFLI|KRITIK",
  "category": "narkotik|qurol|boshqa|xavfsiz",
  "language": "uzbek|russian|mixed",
  "threat_type": "sotish|reklama|tarqatish|yo'q",
  "explanation": "2-3 jumlali O'zbek tilidagi tushuntirish",
  "recommended_action": "bloklash|tekshirish|arxivlash|yo'q"
}
"""
```

**Model:** `claude-sonnet-4-6` | `max_tokens: 800` | Timeout: 10s | Retry: 2x

### 2.5 Crawler / Scheduler

```
Celery tasks:
├── telegram_crawler (har 5 daqiqada)   → kanal postlarni skanerlash
├── instagram_monitor (har 15 daqiqada) → hashtag monitoring
├── olx_scraper (har 30 daqiqada)       → e'lon tekshirish
├── daily_report (har kuni 08:00)       → kunlik hisobot email
└── keyword_sync (har soatda)           → DB dan keywords yangilash
```

### 2.6 Xavfsizlik Talablari

- **T-SEC-01** — Barcha endpoint-lar JWT autentifikatsiya talab qiladi (`/auth` dan tashqari)
- **T-SEC-02** — RBAC: operator faqat scan/action, admin barcha endpoint
- **T-SEC-03** — Rate limiting: `/api/v1/scans` — 30 req/min/user
- **T-SEC-04** — Input validation: matn maks 5000 belgi, XSS tozalash
- **T-SEC-05** — API kalitlar `.env` da, hech qachon response-da qaytarilmasin
- **T-SEC-06** — CORS: faqat frontend domeniga ruxsat
- **T-SEC-07** — SQL injection: SQLAlchemy parameterized query
- **T-SEC-08** — Audit log: barcha yozish amallari loglanadi
- **T-SEC-09** — HTTPS only (production)
- **T-SEC-10** — Parollar: bcrypt, min 8 belgi, complexity check

### 2.7 Environment Variables

```env
# DB
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/narkomonitor

# Cache
REDIS_URL=redis://localhost:6379/0

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...

# UZINFOCOM
UZINFOCOM_API_URL=https://api.uzinfocom.uz/v1
UZINFOCOM_API_KEY=...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_NOTIFY_CHAT_ID=...

# Auth
JWT_SECRET_KEY=...
JWT_ALGORITHM=RS256
ACCESS_TOKEN_EXPIRE_MIN=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET=narkomonitor-reports

# App
APP_ENV=production
DEBUG=false
ALLOWED_ORIGINS=https://narkomonitor.uz
AUTO_BLOCK_THRESHOLD=85
```

---

## 3. FRONTEND

### 3.1 Texnologiyalar

| Komponent | Texnologiya | Sabab |
|---|---|---|
| Framework | **React 18** | Component-based, ekosistema |
| Build tool | **Vite** | Tez dev server, HMR |
| Routing | **React Router v6** | SPA navigation |
| State | **Zustand** | Yengil, boilerplate-siz |
| UI library | **Custom CSS** (Tailwind v3 qo'shimcha) | MVP dizayn saqlansin |
| Charts | **Chart.js 4** + react-chartjs-2 | Hozirgi dizayn |
| Map | **Leaflet** + react-leaflet | Hozirgi integratsiya |
| HTTP | **Axios** + React Query (TanStack) | Cache, retry, loading states |
| WebSocket | Native WS + reconnect | Live feed |
| Forms | **React Hook Form** + Zod | Validation |
| Icons | Emoji (MVP) → Lucide React (v2.0) |  |

### 3.2 Papka Tuzilmasi

```
src/
├── api/
│   ├── client.ts          # Axios instance, interceptors
│   ├── scans.ts           # Scan API calls
│   ├── alerts.ts
│   ├── reports.ts
│   ├── keywords.ts
│   └── auth.ts
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── NotifDropdown.tsx
│   ├── ui/
│   │   ├── StatCard.tsx
│   │   ├── Badge.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   ├── Toggle.tsx
│   │   └── LoadingOverlay.tsx
│   ├── charts/
│   │   ├── WeeklyBar.tsx
│   │   ├── PlatformDoughnut.tsx
│   │   ├── KeywordsBar.tsx
│   │   └── MonthlyLine.tsx
│   └── scanner/
│       ├── ScanForm.tsx
│       ├── ScanResult.tsx
│       ├── RiskCircle.tsx
│       └── ScanHistory.tsx
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Scanner.tsx
│   ├── Alerts.tsx
│   ├── MapPage.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
│
├── store/
│   ├── authStore.ts       # JWT token, user
│   ├── scanStore.ts       # skan holati, history
│   ├── alertStore.ts
│   └── settingsStore.ts   # keywords, sozlamalar
│
├── hooks/
│   ├── useWebSocket.ts    # live feed connection
│   ├── useToast.ts
│   └── useDebounce.ts
│
├── lib/
│   ├── riskCalc.ts        # mahalliy risk hisoblash (fallback)
│   ├── keywordDetect.ts
│   └── formatters.ts
│
└── types/
    ├── scan.ts
    ├── alert.ts
    └── user.ts
```

### 3.3 Sahifalar va Komponentlar Talablari

#### Dashboard sahifasi
- **T-FE-01** — `useQuery('dashboard-stats')` — 30 soniyada auto-refresh
- **T-FE-02** — StatCard animatsiya (counter up, skeleton loading)
- **T-FE-03** — WeeklyBar, PlatformDoughnut, KeywordsBar — Chart.js wrappers
- **T-FE-04** — LiveFeed — WebSocket `/ws/live-feed` ga ulanadi
- **T-FE-05** — Logs panel — WebSocket yoki polling (5s)

#### AI Skaner sahifasi
- **T-FE-06** — Textarea: maks 5000 belgi, char counter
- **T-FE-07** — Platform select + URL input
- **T-FE-08** — `POST /api/v1/scans` — WebSocket bilan progress track
- **T-FE-09** — Step indicator (3 bosqich) reactive holat
- **T-FE-10** — ScanResult: RiskCircle animatsiyasi (0 dan score gacha)
- **T-FE-11** — Fallback: API ishlamasa mahalliy `riskCalc.ts` ishlatiladi
- **T-FE-12** — Action tugmalar: optimistic update + toast

#### Ogohlantirishlar sahifasi
- **T-FE-13** — Server-side filter & search (debounce 300ms)
- **T-FE-14** — Infinite scroll yoki pagination (20/sahifa)
- **T-FE-15** — Filter tugmalar — `URLSearchParams` bilan sync
- **T-FE-16** — Tez amallar: `PATCH /api/v1/scans/{id}/status`

#### Xarita sahifasi
- **T-FE-17** — `GET /api/v1/map/incidents` — GeoJSON
- **T-FE-18** — Markerlar: radius = sqrt(count) × 3, rang = risk
- **T-FE-19** — Lazy init: sahifa ochilganda yuklash

#### Hisobotlar sahifasi
- **T-FE-20** — Hisobot yaratish — async polling (task status)
- **T-FE-21** — Download — `GET /api/v1/reports/{id}/download` → blob

#### Sozlamalar sahifasi
- **T-FE-22** — Keywords CRUD — optimistic UI
- **T-FE-23** — Toggle-lar — `PATCH /api/v1/admin/settings`
- **T-FE-24** — API key inputlar — password type, ko'rsatish toggle

### 3.4 State Boshqarish

```typescript
// scanStore.ts (Zustand)
interface ScanStore {
  currentResult: ScanResult | null;
  history: ScanSummary[];          // oxirgi 10 ta
  isLoading: boolean;
  step: 1 | 2 | 3;

  runScan: (text: string, platform: string, url?: string) => Promise<void>;
  clearScan: () => void;
  setStep: (n: 1 | 2 | 3) => void;
}

// authStore.ts
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### 3.5 HTTP Client

```typescript
// api/client.ts
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
});

// Request: Authorization header
client.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: 401 → token refresh
client.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      await useAuthStore.getState().refreshToken();
      return client(err.config);  // retry
    }
    return Promise.reject(err);
  }
);
```

### 3.6 WebSocket

```typescript
// hooks/useWebSocket.ts
function useLiveFeed() {
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/live-feed`);

    ws.onmessage = (e) => {
      const item = JSON.parse(e.data);
      useScanStore.getState().addFeedItem(item);
    };

    ws.onerror = () => {
      // 3 soniyada reconnect
      setTimeout(() => reconnect(), 3000);
    };

    return () => ws.close();
  }, []);
}
```

### 3.7 Frontend Xavfsizlik

- **T-FE-SEC-01** — API kalitlar hech qachon frontend kodida bo'lmasin (`import.meta.env` faqat VITE_ prefix)
- **T-FE-SEC-02** — XSS: `dangerouslySetInnerHTML` ishlatilmaydi, faqat React JSX
- **T-FE-SEC-03** — JWT `httpOnly cookie`-da saqlash (v2.0, hozir localStorage)
- **T-FE-SEC-04** — Ruxsatsiz sahifalar `<PrivateRoute>` bilan himoyalangan
- **T-FE-SEC-05** — CSP header backend-dan yuboriladi

### 3.8 Performance

- **T-FE-PERF-01** — Code splitting: har sahifa lazy-load (`React.lazy`)
- **T-FE-PERF-02** — Chart canvas — `memo` bilan keraksiz re-render oldini olish
- **T-FE-PERF-03** — Ma'lumotlar — React Query cache: staleTime 30s, gcTime 5min
- **T-FE-PERF-04** — Xarita — faqat `map` sahifasi ochilganda init
- **T-FE-PERF-05** — Bundle: vendor chunk, CSS minimize, gzip

### 3.9 Environment Variables (Frontend)

```env
VITE_API_URL=https://api.narkomonitor.uz
VITE_WS_URL=wss://api.narkomonitor.uz
VITE_APP_VERSION=2.0.0
```

---

## 4. Deployment

### 4.1 Infrastructure

```
┌─────────────────────────────────────────────┐
│              Nginx (reverse proxy)          │
│   /         → Frontend (React build)        │
│   /api/      → Backend (FastAPI, port 8000) │
│   /ws/       → WebSocket (FastAPI)          │
└─────────────────────────────────────────────┘
         │                    │
  ┌──────▼──────┐    ┌────────▼────────┐
  │  PostgreSQL │    │  Redis + Celery  │
  │   :5432     │    │    :6379         │
  └─────────────┘    └─────────────────┘
```

### 4.2 Docker Compose

```yaml
services:
  frontend:
    build: ./frontend
    volumes: [./frontend/dist:/usr/share/nginx/html]

  backend:
    build: ./backend
    env_file: .env
    depends_on: [db, redis]

  celery:
    build: ./backend
    command: celery -A app.celery worker -l info
    depends_on: [redis]

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: narkomonitor

  redis:
    image: redis:7-alpine
```

---

## 5. Testing Talablari

### Backend
| Test turi | Tool | Maqsad |
|---|---|---|
| Unit tests | **pytest** | Risk calculator, keyword detector |
| Integration | **pytest + httpx** | API endpoint-lar |
| DB tests | **pytest + testcontainers** | PostgreSQL real instance |
| AI mock | `unittest.mock` | Claude API mock |

### Frontend
| Test turi | Tool | Maqsad |
|---|---|---|
| Unit | **Vitest** | Utility funktsiyalar |
| Component | **React Testing Library** | UI komponentlar |
| E2E | **Playwright** | Skan flow, login |

### Minimal qamrov: **70%** kod qamrovi

---

## 6. MVP → v2.0 O'tish Rejasi

| Qadam | Tavsif | Muddat |
|---|---|---|
| 1 | Backend skelet (FastAPI + DB + auth) | 1-hafta |
| 2 | Skan endpoint + Claude integratsiya | 1-hafta |
| 3 | Frontend React migratsiya (sahifalar) | 2-hafta |
| 4 | WebSocket live feed | 3-kun |
| 5 | Crawler/scheduler (Telegram) | 1-hafta |
| 6 | UZINFOCOM integratsiya | 1-hafta |
| 7 | Test coverage + CI/CD | 1-hafta |
| **Jami** | | **~7-8 hafta** |
