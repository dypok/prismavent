from pydantic import BaseModel, Field, field_validator
from typing import Optional
import re

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8, max_length=128)
    name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    city_id: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[0-9]', v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one symbol")
        return v

class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = None

class UserMeResponse(BaseModel):
    id: str
    full_name: Optional[str] = None
    role: str = "user"

