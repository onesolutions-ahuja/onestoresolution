from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserResponse
from app.security.dependencies import get_current_user
from app.security.password import hash_password


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/", response_model=UserResponse)
def create_user(
    data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Only the Owner can create users",
        )

    existing = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    allowed_roles = {
        "OWNER",
        "MANAGER",
        "CASHIER",
    }

    role_name = data.role.upper()

    if role_name not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role",
        )

    # Do not allow creating another Owner through normal user creation
    if role_name == "OWNER":
        raise HTTPException(
            status_code=403,
            detail="Owner accounts cannot be created here",
        )

    role = (
        db.query(Role)
        .filter(Role.name == role_name)
        .first()
    )

    if not role:
        role = Role(
            name=role_name,
            description=f"{role_name} user",
        )
        db.add(role)
        db.commit()
        db.refresh(role)

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=role.id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": role.name,
        "is_active": user.is_active,
    }


@router.get("/", response_model=list[UserResponse])
def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Only the Owner can view users",
        )

    users = db.query(User).all()

    result = []

    for user in users:
        role = (
            db.query(Role)
            .filter(Role.id == user.role_id)
            .first()
        )

        result.append(
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": role.name if role else None,
                "is_active": user.is_active,
            }
        )

    return result
