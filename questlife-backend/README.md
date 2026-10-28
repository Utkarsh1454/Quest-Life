# Quest Life Backend

Quest Life is a gamified fitness platform. This backend powers the experience, providing endpoints for user authentication, profile management, activity logging (workouts, meals, steps, sleep), and a quest system that rewards healthy habits with XP, gold, and leveling up.

## Tech Stack

- **Python 3.12+**
- **FastAPI** for high-performance async API endpoints
- **SQLAlchemy 2.0+** with asyncpg for PostgreSQL interaction
- **Alembic** for database migrations
- **Pydantic V2** for data validation and settings
- **PyJWT** for authentication
- **Pwdlib** with Argon2 for password hashing
- **Pytest** for testing

## Setup Instructions

### 1. Prerequisites

Ensure you have Python 3.12+ and PostgreSQL installed on your system.

### 2. Create and Activate Virtual Environment

```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```
Update `.env` with either:
- **Local SQLite**: `DATABASE_URL=sqlite+aiosqlite:///./questlife.db`
- **Vercel Postgres / Neon**: `DATABASE_URL=postgresql://user:pass@ep-xxxx-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` (or set `POSTGRES_URL`)

### 5. Database Initialization & Seeding

Run the automated database setup script to generate all 13 tables and seed default quests, badges, and demo hero:
```bash
python init_db.py
```

### 6. Start the Server

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## API Documentation

Once the server is running, visit:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

```
questlife-backend/
├── app/
│   ├── config.py         # App settings and environment variables
│   ├── database.py       # SQLAlchemy async engine (SQLite & Vercel/Neon Postgres)
│   ├── dependencies.py   # FastAPI dependencies (auth, Clerk sub binding, db)
│   ├── main.py           # FastAPI application entry point
│   ├── models/           # SQLAlchemy 2.0 Declarative models (User, Quest, Activity, Badge, Guild)
│   ├── schemas/          # Pydantic v2 schemas for requests/responses
│   ├── routers/          # API endpoint routes (/auth, /quests, /activities, /leaderboard)
│   ├── services/         # Nutrition DB, exercise DB, notification services
│   ├── utils/            # Helper functions, security, Clerk JWT, Fenwick algorithm
│   └── engine/           # Core game engine logic (XP, stats)
├── init_db.py            # Automated table creation and seeding script
├── .env                  # Environment variables (do not commit)
├── .env.example          # Template for environment variables
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation
```
