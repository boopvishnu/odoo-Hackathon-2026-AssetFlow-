import mysql.connector

# Use the password "1234" you set in db.py
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "1234"
}

def init_database():
    try:
        # 1. Connect to MySQL server
        print("Connecting to MySQL...")
        db = mysql.connector.connect(**db_config)
        cursor = db.cursor()

        # 2. Recreate the database to apply latest DDL schema updates
        print("Recreating database 'assetflow'...")
        cursor.execute("DROP DATABASE IF EXISTS assetflow")
        cursor.execute("CREATE DATABASE assetflow")
        cursor.execute("USE assetflow")

        # 3. Read and execute schema.sql
        print("Reading and executing schema.sql...")
        with open("database/schema.sql", "r", encoding="utf-8") as f:
            schema_sql = f.read()

        # Split statements by semicolon and execute them
        statements = schema_sql.split(";")
        for stmt in statements:
            clean_stmt = stmt.strip()
            if clean_stmt:
                cursor.execute(clean_stmt)
        
        db.commit()
        print("🎉 Database successfully initialized and seeded!")
        
    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")
    finally:
        if 'db' in locals() and db.is_connected():
            cursor.close()
            db.close()

if __name__ == "__main__":
    init_database()
