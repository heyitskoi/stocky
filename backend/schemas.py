from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: str
    department_id: int
    full_name: Optional[str] = None
    role: str = "staff"

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class DepartmentBase(BaseModel):
    name: str

class Department(DepartmentBase):
    id: int
    class Config:
        orm_mode = True

class StockItemBase(BaseModel):
    name: str
    quantity: int
    department_id: int
    status: str

class StockItemCreate(StockItemBase):
    pass

class StockItem(StockItemBase):
    id: int
    class Config:
        orm_mode = True

class LogEntry(BaseModel):
    id: int
    timestamp: datetime
    action: str
    details: str
    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: User

class AssignRequest(BaseModel):
    stock_item_id: int
    assignee_user_id: int
    reason: Optional[str] = None

class ReturnRequest(BaseModel):
    item_id: int
    reason: str
    condition: Optional[str] = None
