# stocky
Stocky is a stock management system.

## Backend

This repository now includes a simple [FastAPI](https://fastapi.tiangolo.com/) backend under `backend/`.

### Run the API

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The frontend looks for the backend at the URL defined by `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).
