from uuid import UUID

from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    school_name: str | None = None
    school_id: UUID | None = None


class SignupResponse(BaseModel):
    user_id: UUID
    email: str
    message: str = "Check your email for OTP"


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


class ResendOTPResponse(BaseModel):
    message: str = "If this email is registered, a new code has been sent."


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
