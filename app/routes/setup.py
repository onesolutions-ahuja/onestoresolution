from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.role import Role
from app.models.user import User
from app.security.password import hash_password


router = APIRouter(
    prefix="/setup",
    tags=["Initial Setup"],
)


class OwnerSetupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


@router.post("/owner")
def create_initial_owner(
    data: OwnerSetupRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists",
        )

    owner_role = (
        db.query(Role)
        .filter(Role.name == "OWNER")
        .first()
    )

    if not owner_role:
        owner_role = Role(
            name="OWNER",
            description="Full access to OneStoreSolution",
        )

        db.add(owner_role)
        db.commit()
        db.refresh(owner_role)

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=owner_role.id,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Initial owner created successfully",
        "user_id": user.id,
        "email": user.email,
        "role": "OWNER",
    }
