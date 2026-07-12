from fastapi import apirouter, httpexception, status
import hashlib
import mysql.connector
from backend.db import get_db
from backend.schemas.auth import signuprequest, loginrequest, usersessionresponse

router = apirouter(prefix="/api", tags=["authentication"])

def make_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/signup", response_model=dict)
def register_user(data: signuprequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("select id from users where username = %s or email = %s", (data.username, data.email))
        if cursor.fetchone():
            raise httpexception(
                status_code=status.http_400_bad_request,
                detail="username or email already registered."
            )
        
        if data.department_id is not None:
            cursor.execute("select id from departments where id = %s", (data.department_id,))
            if not cursor.fetchone():
                raise httpexception(
                    status_code=status.http_400_bad_request,
                    detail="invalid department id."
                )

        pwd_hash = make_hash(data.password)
        query = """
            insert into users (fullname, email, username, password_hash, role, department_id)
            values (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (data.fullname, data.email, data.username, pwd_hash, data.role, data.department_id))
        db.commit()
        
        return {"status": "success", "message": "user registered successfully!"}
    
    except mysql.connector.Error as err:
        db.rollback()
        raise httpexception(
            status_code=status.http_500_internal_server_error,
            detail=f"database error: {str(err)}"
        )
    finally:
        cursor.close()
        db.close()

@router.post("/login", response_model=usersessionresponse)
def login_user(data: loginrequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        pwd_hash = make_hash(data.password)
        query = """
            select id, fullname, email, username, role, department_id 
            from users 
            where username = %s and password_hash = %s
        """
        cursor.execute(query, (data.username, pwd_hash))
        user = cursor.fetchone()
        
        if not user:
            raise httpexception(
                status_code=status.http_401_unauthorized,
                detail="incorrect username or password."
            )
            
        return user
        
    except mysql.connector.Error as err:
        raise httpexception(
            status_code=status.http_500_internal_server_error,
            detail=f"database error: {str(err)}"
        )
    finally:
        cursor.close()
        db.close()
