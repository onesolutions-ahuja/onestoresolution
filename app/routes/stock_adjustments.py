from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/stock-adjustments",
    tags=["Stock Adjustments"],
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


@router.post("/")
def adjust_stock(
    store_id: int,
    product_id: int,
    quantity_change: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not check_store_access(db, current_user, store_id):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    if not reason.strip():
        raise HTTPException(
            status_code=400,
            detail="Reason is required",
        )

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    inventory = db.query(Inventory).filter(
        Inventory.store_id == store_id,
        Inventory.product_id == product_id,
    ).first()

    if not inventory:
        inventory = Inventory(
            store_id=store_id,
            product_id=product_id,
            quantity=0,
            minimum_quantity=0,
            cost_price=product.cost_price,
            selling_price=product.selling_price,
        )
        db.add(inventory)
        db.flush()

    new_quantity = inventory.quantity + quantity_change

    if new_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock quantity cannot become negative",
        )

    inventory.quantity = new_quantity

    db.commit()
    db.refresh(inventory)

    return {
        "message": "Stock adjusted successfully",
        "store_id": store_id,
        "product_id": product_id,
        "quantity_change": quantity_change,
        "new_quantity": inventory.quantity,
        "reason": reason,
    }
