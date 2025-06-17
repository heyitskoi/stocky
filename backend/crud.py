from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

# Departments

def get_departments(db: Session):
    return db.query(models.Department).all()

# Users

def get_users(db: Session):
    return db.query(models.User).all()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

# Stock items

def get_stock_items(db: Session):
    return db.query(models.StockItem).all()


def get_stock_item(db: Session, item_id: int):
    return db.query(models.StockItem).filter(models.StockItem.id == item_id).first()

# Logs

def create_log(db: Session, action: str, details: str):
    log = models.LogEntry(timestamp=datetime.utcnow(), action=action, details=details)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
