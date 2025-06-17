from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: User

class StockItem(BaseModel):
    id: int
    name: str
    quantity: int
    department_id: int
    status: str

class AssignRequest(BaseModel):
    stock_item_id: int
    assignee_user_id: int
    reason: Optional[str] = None

class ReturnRequest(BaseModel):
    item_id: int
    reason: str
    condition: Optional[str] = None

class User(BaseModel):
    id: int
    username: str
    email: str
    department_id: int
    full_name: str

class Department(BaseModel):
    id: int
    name: str

class LogEntry(BaseModel):
    id: int
    timestamp: datetime
    action: str
    details: dict

# In-memory demo data
users = [
    User(id=1, username="admin", email="admin@example.com", department_id=1, full_name="Admin User"),
    User(id=2, username="manager", email="manager@example.com", department_id=2, full_name="Stock Manager"),
]

departments = [
    Department(id=1, name="Warehouse"),
    Department(id=2, name="IT Department"),
]

stock_items = [
    StockItem(id=1, name="Dell Laptop XPS 13", quantity=5, department_id=1, status="available"),
    StockItem(id=2, name="iPhone 15 Pro", quantity=12, department_id=1, status="available"),
    StockItem(id=3, name="Wireless Mouse", quantity=2, department_id=1, status="available"),
]

logs: List[LogEntry] = []

@app.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest):
    user = next((u for u in users if u.username == data.username), None)
    if not user or data.password != "password":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = f"token-{user.id}-{int(datetime.utcnow().timestamp())}"
    return {"token": token, "user": user}

@app.get("/stock/", response_model=List[StockItem])
def get_stock():
    return stock_items

@app.post("/stock/assign")
def assign_item(data: AssignRequest):
    item = next((s for s in stock_items if s.id == data.stock_item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Item out of stock")
    item.quantity -= 1
    item.status = "assigned"
    logs.append(
        LogEntry(
            id=len(logs)+1,
            timestamp=datetime.utcnow(),
            action="assign",
            details=data.dict(),
        )
    )
    return {"success": True, "message": "Item assigned"}

@app.post("/stock/return")
def return_item(data: ReturnRequest):
    item = next((s for s in stock_items if s.id == data.item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.quantity += 1
    item.status = "available"
    logs.append(
        LogEntry(
            id=len(logs)+1,
            timestamp=datetime.utcnow(),
            action="return",
            details=data.dict(),
        )
    )
    return {"success": True, "message": "Item returned"}

@app.get("/users", response_model=List[User])
def get_users():
    return users

@app.get("/departments", response_model=List[Department])
def get_departments():
    return departments

@app.get("/logs/", response_model=List[LogEntry])
def get_logs():
    return logs
