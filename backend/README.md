# Stocky Backend

This directory contains a simple FastAPI backend used during development.

## Setup

```bash
pip install -r requirements.txt
```

## Running

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## Endpoints

- `POST /auth/login` – authenticate a user (password is `password` for demo)
- `GET /stock/` – list stock items
- `POST /stock/assign` – assign an item to a user
- `POST /stock/return` – return an item to inventory
- `GET /users` – list users
- `GET /departments` – list departments
- `GET /logs/` – list audit logs
