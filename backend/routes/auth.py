from fastapi import APIRouter, HTTPException, status
import hashlib
import mysql.connector
from backend.db import get_db
from backend.schemas.auth import SignupRequest, LoginRequest, UserSessionResponse

router = APIRouter(prefix="/api", tags=["Authentication"])

def hash_password(password: str) -> str:
    """Hash password using SHA-256 (0-dependency helper)."""
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/signup", response_model=dict)
def signup(data: SignupRequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        # 1. Check if username or email already exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (data.username, data.email))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or Email already registered."
            )
        
        # 2. Verify department_id exists if provided
        if data.department_id is not None:
            cursor.execute("SELECT id FROM departments WHERE id = %s", (data.department_id,))
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid department ID."
                )

        # 3. Hash password and insert user
        pwd_hash = hash_password(data.password)
        query = """
            INSERT INTO users (fullname, email, username, password_hash, role, department_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (data.fullname, data.email, data.username, pwd_hash, data.role, data.department_id))
        db.commit()
        
        return {"status": "Success", "message": "User registered successfully!"}
    
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(err)}"
        )
    finally:
        cursor.close()
        db.close()

@router.post("/login", response_model=UserSessionResponse)
def login(data: LoginRequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        pwd_hash = hash_password(data.password)
        query = """
            SELECT id, fullname, email, username, role, department_id 
            FROM users 
            WHERE username = %s AND password_hash = %s
        """
        cursor.execute(query, (data.username, pwd_hash))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password."
            )
            
        return user
        
    except mysql.connector.Error as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(err)}"
        )
    finally:
        cursor.close()
        db.close()
