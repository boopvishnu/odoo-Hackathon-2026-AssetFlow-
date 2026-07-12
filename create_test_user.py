import mysql.connector
import hashlib

# Connection details matching db.py
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "1234",
    "database": "assetflow"
}

def make_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_test_users():
    try:
        print("Connecting to MySQL...")
        db = mysql.connector.connect(**db_config)
        cursor = db.cursor(dictionary=True)

        # 1. Verify departments exist (Engineering is ID 2)
        cursor.execute("SELECT id, name FROM departments WHERE id = 2")
        dept = cursor.fetchone()
        if not dept:
            print("Seeding default departments...")
            cursor.execute("INSERT IGNORE INTO departments (id, name) VALUES (2, 'Engineering'), (1, 'Operations')")
            db.commit()

        # 2. Check if test Department Head already exists
        cursor.execute("SELECT id FROM users WHERE username = 'dept_head_test'")
        existing = cursor.fetchone()

        if existing:
            print("Test Department Head 'dept_head_test' already exists in the database.")
        else:
            # Insert active Department Head (Engineering - ID 2)
            # Password is 'password123'
            pwd_hash = make_hash("password123")
            query = """
                INSERT INTO users (username, email, password_hash, role, employee_name, department_id, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'Active')
            """
            cursor.execute(query, (
                "dept_head_test",
                "sarah.connor@company.io",
                pwd_hash,
                "Department Head",
                "Dr. Sarah Connor",
                2, # Engineering department ID
                
            ))
            
            # Also insert an active Admin user for comprehensive testing
            # Password is 'admin123'
            admin_hash = make_hash("admin123")
            cursor.execute(query, (
                "admin_test",
                "admin@company.io",
                admin_hash,
                "Admin",
                "Chief Admin",
                None, # Admins don't need a specific department
                
            ))
            
            db.commit()
            print("🎉 Successfully created active test users:")
            print("   1. Role: Department Head")
            print("      Username: dept_head_test")
            print("      Password: password123")
            print("      Employee Name: Dr. Sarah Connor")
            print("      Department: Engineering")
            print("   2. Role: Admin")
            print("      Username: admin_test")
            print("      Password: admin123")
            print("      Employee Name: Chief Admin")

    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
    finally:
        if 'db' in locals() and db.is_connected():
            cursor.close()
            db.close()

if __name__ == "__main__":
    create_test_users()
