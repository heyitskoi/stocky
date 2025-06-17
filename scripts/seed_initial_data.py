"""Seed the database with initial demo data."""
from backend.database import SessionLocal, engine
from backend import models

models.Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        # Departments
        if db.query(models.Department).count() == 0:
            departments = [
                models.Department(name="Warehouse"),
                models.Department(name="IT Department"),
                models.Department(name="Finance"),
                models.Department(name="Operations"),
            ]
            db.add_all(departments)
            db.flush()  # assign IDs

        # Users with different permission levels
        if db.query(models.User).count() == 0:
            users = [
                models.User(username="admin", email="admin@example.com", department_id=1, full_name="Admin User", role="admin"),
                models.User(username="manager", email="manager@example.com", department_id=1, full_name="Stock Manager", role="stock_manager"),
                models.User(username="staff", email="staff@example.com", department_id=2, full_name="Regular Staff", role="staff"),
                models.User(username="viewer", email="viewer@example.com", department_id=3, full_name="View Only", role="viewer"),
            ]
            db.add_all(users)

        # Stock items
        if db.query(models.StockItem).count() == 0:
            items = [
                models.StockItem(name="Dell Laptop XPS 13", quantity=5, department_id=1, status="available"),
                models.StockItem(name="iPhone 15 Pro", quantity=12, department_id=1, status="available"),
                models.StockItem(name="Wireless Mouse", quantity=20, department_id=2, status="available"),
                models.StockItem(name="Office Chair", quantity=10, department_id=2, status="available"),
                models.StockItem(name="Projector", quantity=2, department_id=3, status="available"),
            ]
            db.add_all(items)

        # Logs for audit testing
        if db.query(models.LogEntry).count() == 0:
            logs = [
                models.LogEntry(action="assign", details="{'item': 1, 'user': 2}"),
                models.LogEntry(action="return", details="{'item': 1, 'user': 2}"),
                models.LogEntry(action="assign", details="{'item': 2, 'user': 3}"),
            ]
            db.add_all(logs)

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("Database seeded with initial data.")
