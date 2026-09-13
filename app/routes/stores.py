from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.store import Store
from app.models.user import User
from app.schemas.store import StoreCreate, StoreResponse
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/stores",
    tags=["Stores"],
)


@router.post("/", response_model=StoreResponse)
def create_store(
    data: StoreCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Only the Owner can create stores",
        )

    store = Store(
        name=data.name,
        address=data.address,
        postcode=data.postcode,
        phone=data.phone,
        is_active=True,
    )

    db.add(store)
    db.commit()
    db.refresh(store)

    return store


@router.get("/", response_model=list[StoreResponse])
def get_stores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role_id == 1:
        return (
            db.query(Store)
            .filter(Store.is_active == True)
            .all()
        )

    return []
