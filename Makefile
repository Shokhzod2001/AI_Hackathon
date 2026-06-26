.PHONY: dev dev-backend dev-frontend build up down logs migrate test lint clean

# ── Dev ──────────────────────────────────────────────
dev:
	docker compose up --build

dev-backend:
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

# ── Docker ───────────────────────────────────────────
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

# ── Database ─────────────────────────────────────────
migrate:
	cd backend && alembic upgrade head

migrate-create:
	cd backend && alembic revision --autogenerate -m "$(msg)"

migrate-rollback:
	cd backend && alembic downgrade -1

seed:
	cd backend && python -m app.scripts.seed

# ── Tests ─────────────────────────────────────────────
test:
	cd backend && pytest -v --tb=short

test-cov:
	cd backend && pytest --cov=app --cov-report=html -v

test-frontend:
	cd frontend && npm run test

# ── Lint / Format ─────────────────────────────────────
lint:
	cd backend && ruff check app/
	cd frontend && npm run lint

format:
	cd backend && ruff format app/
	cd frontend && npm run format

# ── Production ────────────────────────────────────────
prod-up:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f

# ── Cleanup ───────────────────────────────────────────
clean:
	docker compose down -v --remove-orphans
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
