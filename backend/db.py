import mysql.connector
from mysql.connector import pooling

# We use a connection pool to handle multiple API requests efficiently
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "1234",  # MySQL 8.0 password
    "database": "assetflow"
}

try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="assetflow_pool",
        pool_size=5,
        pool_reset_session=True,
        **db_config
    )
except mysql.connector.Error as e:
    print(f"Error creating connection pool: {e}")
    # Fallback to direct connections if pooling fails
    connection_pool = None

def get_db():
    """
    Returns a MySQL database connection.
    Usage:
        db = get_db()
        cursor = db.cursor()
    """
    if connection_pool:
        return connection_pool.get_connection()
    return mysql.connector.connect(**db_config)
