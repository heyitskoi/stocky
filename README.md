# stocky
Stocky is a stock management system.

## Backend

This repository now includes a simple [FastAPI](https://fastapi.tiangolo.com/) backend under `backend/`.

### Run the API

First ensure PostgreSQL is running and a database named `stocky` exists. You can
create it with:

```bash
sudo -u postgres createdb stocky
sudo -u postgres psql -c "CREATE USER stocky_user WITH ENCRYPTED PASSWORD 'stocky_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE stocky TO stocky_user;"
```

Install requirements and run migrations:

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
python ../scripts/seed_initial_data.py  # populate demo data
uvicorn backend.main:app --reload --port 8000
```

The frontend looks for the backend at the URL defined by `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).

### Environment configuration

Copy `.env.example` to `.env` and update the values if needed. It defines the database connection string for the backend and the API URL for the frontend.
You can also run the helper script below which will prompt for any missing credentials and install dependencies:

```bash
./scripts/setup.sh
```
