from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.store import Store
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/stock-transfers",
    tags=["Stock Transfers"],
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
def transfer_stock(
    product_id: int,
    from_store_id: int,
    to_store_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero",
        )

    if from_store_id == to_store_id:
        raise HTTPException(
            status_code=400,
            detail="Source and destination stores must be different",
        )

    if not check_store_access(db, current_user, from_store_id):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to the source store",
        )

    if not check_store_access(db, current_user, to_store_id):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to the destination store",
        )

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    source = db.query(Inventory).filter(
        Inventory.store_id == from_store_id,
        Inventory.product_id == product_id,
    ).first()

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Product has no inventory record in source store",
        )

    if source.quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock in source store",
        )

    destination = db.query(Inventory).filter(
        Inventory.store_id == to_store_id,
        Inventory.product_id == product_id,
    ).first()

    if not destination:
        destination = Inventory(
            store_id=to_store_id,
            product_id=product_id,
            quantity=0,
            minimum_quantity=0,
            cost_price=product.cost_price,
            selling_price=product.selling_price,
        )
        db.add(destination)

    source.quantity -= quantity
    destination.quantity += quantity

    db.commit()

    return {
        "message": "Stock transferred successfully",
        "product_id": product_id,
        "from_store_id": from_store_id,
        "to_store_id": to_store_id,
        "quantity": quantity,
    }
