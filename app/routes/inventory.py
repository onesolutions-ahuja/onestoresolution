from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.stock_movement import StockMovement
from app.schemas.stock_movement import (
    StockAdjustmentCreate,
    StockMovementResponse,
)
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


def is_owner(user):
    return getattr(user, "role_id", None) == 1


def check_store_access(db, user, store_id):
    if is_owner(user):
        return True

    from app.models.user_store_access import UserStoreAccess

    access = db.query(UserStoreAccess).filter(
        UserStoreAccess.user_id == user.id,
        UserStoreAccess.store_id == store_id,
    ).first()

    return access is not None


@router.get("/")
def get_inventory(
    store_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Inventory)

    if is_owner(current_user):
        if store_id is not None:
            query = query.filter(
                Inventory.store_id == store_id
            )
    else:
        from app.models.user_store_access import UserStoreAccess

        stores = db.query(
            UserStoreAccess.store_id
        ).filter(
            UserStoreAccess.user_id == current_user.id
        ).all()

        store_ids = [row[0] for row in stores]

        if not store_ids:
            return []

        query = query.filter(
            Inventory.store_id.in_(store_ids)
        )

        if store_id is not None:
            if store_id not in store_ids:
                raise HTTPException(
                    status_code=403,
                    detail="You do not have access to this store",
                )

    return query.order_by(
        Inventory.product_id
    ).all()


@router.get("/{inventory_id}")
def get_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found",
        )

    if not check_store_access(
        db,
        current_user,
        inventory.store_id,
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    return inventory


@router.post(
    "/adjust",
    response_model=StockMovementResponse,
)
def adjust_stock(
    data: StockAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not check_store_access(
        db,
        current_user,
        data.store_id,
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    if data.quantity_change == 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity change cannot be zero",
        )

    product = db.query(Product).filter(
        Product.id == data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    inventory = db.query(Inventory).filter(
        Inventory.store_id == data.store_id,
        Inventory.product_id == data.product_id,
    ).first()

    if not inventory:
        inventory = Inventory(
            store_id=data.store_id,
            product_id=data.product_id,
            quantity=0,
            minimum_quantity=0,
            cost_price=product.cost_price,
            selling_price=product.selling_price,
        )

        db.add(inventory)
        db.flush()

    quantity_before = inventory.quantity
    quantity_after = (
        quantity_before + data.quantity_change
    )

    if quantity_after < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock quantity cannot be negative",
        )

    inventory.quantity = quantity_after

    movement = StockMovement(
        store_id=data.store_id,
        product_id=data.product_id,
        user_id=current_user.id,
        movement_type="ADJUSTMENT",
        quantity_change=data.quantity_change,
        quantity_before=quantity_before,
        quantity_after=quantity_after,
        reason=data.reason,
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return movement


@router.get(
    "/movements/",
    response_model=list[StockMovementResponse],
)
def get_stock_movements(
    store_id: int | None = None,
    product_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(StockMovement)

    if is_owner(current_user):
        if store_id is not None:
            query = query.filter(
                StockMovement.store_id == store_id
            )
    else:
        from app.models.user_store_access import UserStoreAccess

        stores = db.query(
            UserStoreAccess.store_id
        ).filter(
            UserStoreAccess.user_id == current_user.id
        ).all()

        store_ids = [row[0] for row in stores]

        if not store_ids:
            return []

        query = query.filter(
            StockMovement.store_id.in_(store_ids)
        )

        if store_id is not None:
            if store_id not in store_ids:
                raise HTTPException(
                    status_code=403,
                    detail="You do not have access to this store",
                )

    if product_id is not None:
        query = query.filter(
            StockMovement.product_id == product_id
        )

    return query.order_by(
        StockMovement.created_at.desc()
    ).all()


@router.get("/low-stock/")
def get_low_stock(
    store_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Inventory).filter(
        Inventory.quantity <= Inventory.minimum_quantity
    )

    if is_owner(current_user):
        if store_id is not None:
            query = query.filter(
                Inventory.store_id == store_id
            )
    else:
        from app.models.user_store_access import UserStoreAccess

        stores = db.query(
            UserStoreAccess.store_id
        ).filter(
            UserStoreAccess.user_id == current_user.id
        ).all()

        store_ids = [row[0] for row in stores]

        if not store_ids:
            return []

        query = query.filter(
            Inventory.store_id.in_(store_ids)
        )

        if store_id is not None:
            if store_id not in store_ids:
                raise HTTPException(
                    status_code=403,
                    detail="You do not have access to this store",
                )

    return query.order_by(
        Inventory.quantity.asc()
    ).all()
