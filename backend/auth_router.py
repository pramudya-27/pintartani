import os
from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from backend.database import get_db
from backend.models import User, UsageQuota

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

router = APIRouter()

# --- Schemas ---
class UserCreate(BaseModel):
    """Schema untuk data registrasi pengguna baru."""
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    """Schema untuk data kredensial login pengguna."""
    username_or_email: str
    password: str

class Token(BaseModel):
    """Schema untuk token autentikasi JWT setelah sukses login."""
    access_token: str
    token_type: str
    username: str
    quota_left: int

# --- Utils ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def check_and_deduct_quota(user: User, db: Session):
    quota = db.query(UsageQuota).filter(UsageQuota.user_id == user.id).first()
    now = datetime.utcnow()

    # Create quota record if not exists
    if not quota:
        quota = UsageQuota(user_id=user.id, usage_count=0, reset_time=now)
        db.add(quota)
        db.commit()
        db.refresh(quota)

    # Check reset time
    if now >= quota.reset_time and quota.usage_count >= 5:
        # Reset quota
        quota.usage_count = 0
        db.commit()

    if quota.usage_count >= 5:
        # Calculate time left
        time_left = quota.reset_time - now
        hours, remainder = divmod(time_left.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        time_str = f"{hours} jam {minutes} menit"
        raise HTTPException(status_code=429, detail=f"Kuota habis. Silakan tunggu {time_str} lagi.")

    # Deduct quota (increment usage)
    quota.usage_count += 1
    # If hitting 5th usage, set reset time to 5 hours from now
    if quota.usage_count == 5:
        quota.reset_time = now + timedelta(hours=5)
    
    db.commit()
    return 5 - quota.usage_count

# --- Endpoints ---
@router.post("/api/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username atau Email sudah terdaftar")
    
    hashed_pw = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize Quota
    quota = UsageQuota(user_id=new_user.id, usage_count=0, reset_time=datetime.utcnow())
    db.add(quota)
    db.commit()

    return {"message": "Registrasi berhasil"}

@router.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == user_data.username_or_email) | 
        (User.email == user_data.username_or_email)
    ).first()

    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Kredensial tidak valid")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    quota = db.query(UsageQuota).filter(UsageQuota.user_id == user.id).first()
    quota_left = 5
    if quota:
        if datetime.utcnow() >= quota.reset_time and quota.usage_count >= 5:
            quota_left = 5
        else:
            quota_left = 5 - quota.usage_count
            if quota_left < 0: quota_left = 0

    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "username": user.username,
        "quota_left": quota_left
    }
