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
Update the `.env` file with your specific PostgreSQL credentials and desired secret keys.

### 5. Database Setup

Ensure PostgreSQL is running and create the `questlife` database:
```sql
CREATE DATABASE questlife;
```

Run Alembic migrations to create tables (once configured):
```bash
alembic upgrade head
```

### 6. Start the Server

```bash
fastapi dev app/main.py
# OR
uvicorn app.main:app --reload
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
│   ├── database.py       # SQLAlchemy setup and async session
│   ├── dependencies.py   # FastAPI dependencies (auth, db)
│   ├── main.py           # FastAPI application entry point
│   ├── models/           # SQLAlchemy 2.0 Declarative models
│   ├── schemas/          # Pydantic v2 schemas for requests/responses
│   ├── routers/          # API endpoint routes
│   ├── utils/            # Helper functions
│   └── engine/           # Core game engine logic (XP, stats)
├── .env                  # Environment variables (do not commit)
├── .env.example          # Template for environment variables
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation
```
