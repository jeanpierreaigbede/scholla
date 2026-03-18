import logging
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.models.user import User, UserRole, OTPCode
from app.models.school import School
from app.schemas.auth import (
    SignupRequest,
    SignupResponse,
    VerifyOTPRequest,
    TokenResponse,
    LoginRequest,
    ResendOTPRequest,
    ResendOTPResponse,
)
from app.core.security import create_access_token, get_password_hash, verify_password
from app.services.email import send_otp_email, EmailSendError

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/signup", response_model=SignupResponse)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    school_name = data.school_name
    school_id = None
    if data.school_id:
        school_result = await db.execute(select(School).where(School.id == data.school_id))
        school = school_result.scalar_one_or_none()
        if school:
            school_id = school.id
            school_name = school.name

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        school_name=school_name,
        school_id=school_id,
        role=UserRole.STUDENT,
        is_verified=False,
    )
    db.add(user)
    await db.flush()

    code = str(secrets.randbelow(900_000) + 100_000)
    otp = OTPCode(
        user_id=user.id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp)
    await db.flush()
    try:
        await send_otp_email(to=data.email, code=code)
    except EmailSendError as e:
        logger.exception("Failed to send OTP email to %s: %s", data.email, e)
        raise HTTPException(status_code=502, detail="Failed to send verification email") from e

    return SignupResponse(user_id=user.id, email=user.email)


@router.post("/resend-otp", response_model=ResendOTPResponse)
async def resend_otp(data: ResendOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        return ResendOTPResponse()
    code = str(secrets.randbelow(900_000) + 100_000)
    otp = OTPCode(
        user_id=user.id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(otp)
    await db.flush()
    try:
        await send_otp_email(to=data.email, code=code)
    except EmailSendError as e:
        logger.exception("Failed to send OTP email to %s: %s", data.email, e)
        raise HTTPException(status_code=502, detail="Failed to resend verification email") from e

    return ResendOTPResponse()


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    result = await db.execute(
        select(OTPCode)
        .where(OTPCode.user_id == user.id, OTPCode.used == False, OTPCode.expires_at > datetime.utcnow())
        .order_by(OTPCode.expires_at.desc())
        .limit(1)
    )
    otp_row = result.scalar_one_or_none()
    if not otp_row or otp_row.code != data.code:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    otp_row.used = True
    user.is_verified = True
    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token)
