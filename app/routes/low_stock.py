from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/low-stock",
    tags=["Low Stock"],
)


def is_owner(user):
    return getattr(user, "role_id", None) == 1


def check_store_access(db, user, store_id):
    if is_owner(user):
        return True

    from app.models.user_store_access import UserStoreAccess

    return db.query(UserStoreAccess).filter(
        UserStoreAccess.user_id == user.id,
        UserStoreAccess.store_id == store_id,
    ).first() is not None


@router.get("/")
def get_low_stock(
    store_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Inventory).filter(
        Inventory.quantity <= Inventory.minimum_quantity
    )

    if store_id is not None:
        if not check_store_access(db, current_user, store_id):
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this store",
            )

        query = query.filter(
            Inventory.store_id == store_id
        )

    elif not is_owner(current_user):
        from app.models.user_store_access import UserStoreAccess

        store_ids = [
            row[0]
            for row in db.query(
                UserStoreAccess.store_id
            ).filter(
                UserStoreAccess.user_id == current_user.id
            ).all()
        ]

        if not store_ids:
            return []

        query = query.filter(
            Inventory.store_id.in_(store_ids)
        )

    return query.order_by(
        Inventory.quantity.asc()
    ).all()
