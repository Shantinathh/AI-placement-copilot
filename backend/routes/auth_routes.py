from fastapi import APIRouter, HTTPException, status
from backend.schemas import SignupInput, LoginInput, TokenOutput
from backend.auth import hash_password, verify_password, create_access_token
from backend.db import db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=TokenOutput, status_code=status.HTTP_201_CREATED)
def signup(data: SignupInput):
    existing_user = db.find_user_by_email(data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    hashed_pwd = hash_password(data.password)
    user_doc = {
        "name": data.name,
        "email": data.email.lower().strip(),
        "hashed_password": hashed_pwd
    }
    db.save_user(user_doc)
    
    token = create_access_token({"sub": user_doc["email"], "name": user_doc["name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"name": user_doc["name"], "email": user_doc["email"]}
    }

@router.post("/login", response_model=TokenOutput)
def login(data: LoginInput):
    user = db.find_user_by_email(data.email)
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_access_token({"sub": user["email"], "name": user["name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"name": user["name"], "email": user["email"]}
    }
