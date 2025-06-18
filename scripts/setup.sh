#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_FILE="$ROOT_DIR/.env.example"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$EXAMPLE_FILE" ]; then
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo "Created $ENV_FILE from template"
  else
    touch "$ENV_FILE"
  fi
fi

# Load existing variables
set -a
[ -f "$ENV_FILE" ] && source "$ENV_FILE"
set +a

# Prompt for database URL if missing
if [ -z "$DATABASE_URL" ]; then
  echo "Enter credentials for PostgreSQL (used by FastAPI backend)"
  read -p "Postgres user [stocky_user]: " DB_USER
  DB_USER=${DB_USER:-stocky_user}
  read -p "Postgres password [stocky_pass]: " DB_PASS
  DB_PASS=${DB_PASS:-stocky_pass}
  read -p "Postgres host [localhost]: " DB_HOST
  DB_HOST=${DB_HOST:-localhost}
  read -p "Postgres database [stocky]: " DB_NAME
  DB_NAME=${DB_NAME:-stocky}
  DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}"
  echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_FILE"
fi

# Prompt for API URL if missing
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  read -p "Backend API URL [http://localhost:8000]: " NEXT_PUBLIC_API_URL
  NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8000}
  echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> "$ENV_FILE"
fi

# Test database connection
python3 - <<PY
import os, sys
from sqlalchemy import create_engine
url = os.environ.get('DATABASE_URL')
try:
    engine = create_engine(url)
    conn = engine.connect()
    conn.close()
    print('Database connection successful.')
except Exception as e:
    print('Failed to connect to database:', e)
    sys.exit(1)
PY

cd "$ROOT_DIR/backend"
python3 -m pip install -r requirements.txt
alembic upgrade head
python3 ../scripts/seed_initial_data.py

cd "$ROOT_DIR/frontend"
npm install

echo "Setup complete. Environment variables stored in $ENV_FILE"
