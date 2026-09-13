from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.store import Store
from app.models.user_store_access import UserStoreAccess
from app.schemas.store_access import (
    StoreAccessCreate,
    StoreAccessResponse,
)
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/store-access",
    tags=["Store Access"],
)


@router.post(
    "/",
    response_model=StoreAccessResponse,
)
def assign_store_access(
    data: StoreAccessCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only Owner can assign store access
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Only the Owner can assign store access",
        )

    user = (
        db.query(User)
        .filter(User.id == data.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    store = (
        db.query(Store)
        .filter(Store.id == data.store_id)
        .first()
    )

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Store not found",
        )

    existing = (
        db.query(UserStoreAccess)
        .filter(
            UserStoreAccess.user_id == data.user_id,
            UserStoreAccess.store_id == data.store_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="User already has access to this store",
        )

    access = UserStoreAccess(
        user_id=data.user_id,
        store_id=data.store_id,
    )

    db.add(access)
    db.commit()
    db.refresh(access)

    return access
