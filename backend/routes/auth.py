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
        # 1. Check if email already exists (using repo table name 'user')
        cursor.execute("SELECT id FROM user WHERE email = %s", (data.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered."
            )

        # 2. Hash password and insert user
        pwd_hash = hash_password(data.password)
        query = """
            INSERT INTO user (name, email, password_hash, role)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (data.fullname, data.email, pwd_hash, data.role))
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
            SELECT id, name AS fullname, email, role 
            FROM user 
            WHERE email = %s AND password_hash = %s
        """
        cursor.execute(query, (data.username, pwd_hash)) # username field in request contains the email
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password."
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
