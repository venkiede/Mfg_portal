from fastapi import APIRouter, Depends
from models.user import User
from services.role_service import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/me", response_model=User)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
