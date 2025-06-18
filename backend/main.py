from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from database import SessionLocal, engine
import models
import schemas
import crud

models.Base.metadata.create_all(bind=engine)

# Seed initial data on first run
def seed_data():
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            dept1 = models.Department(id=1, name="Warehouse")
            dept2 = models.Department(id=2, name="IT Department")
            dept3 = models.Department(id=3, name="Finance")
            db.add_all([dept1, dept2, dept3])
            db.add_all([
                models.User(id=1, username="admin", email="admin@example.com", department_id=1, full_name="Admin User", role="admin"),
                models.User(id=2, username="manager", email="manager@example.com", department_id=2, full_name="Stock Manager", role="stock_manager"),
                models.User(id=3, username="alice", email="alice@example.com", department_id=3, full_name="Alice Accountant", role="staff"),
                models.User(id=4, username="viewer", email="viewer@example.com", department_id=1, full_name="View Only", role="viewer"),
            ])
            db.add_all([
                models.StockItem(id=1, name="Dell Laptop XPS 13", quantity=5, department_id=1, status="available"),
                models.StockItem(id=2, name="iPhone 15 Pro", quantity=12, department_id=1, status="available"),
                models.StockItem(id=3, name="Wireless Mouse", quantity=2, department_id=1, status="available"),
                models.StockItem(id=4, name="Office Chair", quantity=10, department_id=2, status="available"),
                models.StockItem(id=5, name="Projector", quantity=1, department_id=3, status="available"),
            ])
            db.add_all([
                models.LogEntry(action="assign", details="{'item':1,'user':2}"),
                models.LogEntry(action="return", details="{'item':1,'user':2}"),
            ])
            db.commit()
    finally:
        db.close()

seed_data()

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/auth/login", response_model=schemas.LoginResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, data.username)
    if not user or data.password != "password":
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = f"token-{user.id}-{int(datetime.utcnow().timestamp())}"
    return {"token": token, "user": user}

@app.get("/stock/", response_model=List[schemas.StockItem])
def get_stock(db: Session = Depends(get_db)):
    return crud.get_stock_items(db)

@app.post("/stock/assign")
def assign_item(data: schemas.AssignRequest, db: Session = Depends(get_db)):
    item = crud.get_stock_item(db, data.stock_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Item out of stock")
    item.quantity -= 1
    item.status = "assigned"
    crud.create_log(db, "assign", str(data.dict()))
    db.commit()
    return {"success": True, "message": "Item assigned"}

@app.post("/stock/return")
def return_item(data: schemas.ReturnRequest, db: Session = Depends(get_db)):
    item = crud.get_stock_item(db, data.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.quantity += 1
    item.status = "available"
    crud.create_log(db, "return", str(data.dict()))
    db.commit()
    return {"success": True, "message": "Item returned"}

@app.get("/users", response_model=List[schemas.User])
def list_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

@app.get("/departments", response_model=List[schemas.Department])
def list_departments(db: Session = Depends(get_db)):
    return crud.get_departments(db)

@app.get("/logs/", response_model=List[schemas.LogEntry])
def list_logs(db: Session = Depends(get_db)):
    return db.query(models.LogEntry).all()
