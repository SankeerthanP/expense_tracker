from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services import auth_service

router = APIRouter(prefix='/auth', tags=['Authentication'])


@router.post('/register', response_model=AuthResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.register_user(db, user_data)
    login_response = auth_service.create_login_response(user)
    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=login_response['access_token'],
        token_type=login_response['token_type'],
        message='Registration successful.',
    )


@router.post('/login', response_model=AuthResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = auth_service.login_user(db, credentials)
    login_response = auth_service.create_login_response(user)
    return AuthResponse(
        user=UserResponse.model_validate(login_response['user']),
        access_token=login_response['access_token'],
        token_type=login_response['token_type'],
        message='Login successful.',
    )


@router.post('/token', response_model=TokenResponse)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    user = auth_service.login_user(db, credentials)
    return auth_service.create_login_response(user)


@router.get('/me', response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
