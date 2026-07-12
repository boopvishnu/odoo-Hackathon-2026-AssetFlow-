from pydantic import BaseModel, Field
from typing import Optional

class SignupRequest(BaseModel):
    fullname: str = Field(..., min_length=1, max_length=150)
    email: str = Field(..., min_length=3, max_length=150)
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4) # Clean plain password from frontend
    role: str = Field("employee", description="Must be one of: admin, asset_manager, dept_head, employee")
    department_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)

class UserSessionResponse(BaseModel):
    id: int
    fullname: str
    email: str
    role: str

    class Config:
        from_attributes = True # Enables Pydantic to read ORM-like dictionary outputs
