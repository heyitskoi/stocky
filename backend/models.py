from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    users = relationship("User", back_populates="department")
    items = relationship("StockItem", back_populates="department")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    full_name = Column(String)
    role = Column(String, default="staff")
    department = relationship("Department", back_populates="users")

class StockItem(Base):
    __tablename__ = "stock_items"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, default=0)
    department_id = Column(Integer, ForeignKey("departments.id"))
    status = Column(String, default="available")
    department = relationship("Department", back_populates="items")

class LogEntry(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String)
    details = Column(String)
