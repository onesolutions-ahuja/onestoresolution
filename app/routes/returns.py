from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.inventory import Inventory
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/returns",
    tags=["Returns"],
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


@router.post("/{sale_id}")
def return_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    sale = db.query(Sale).filter(
        Sale.id == sale_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Sale not found",
        )

    if not check_store_access(
        db,
        current_user,
        sale.store_id,
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this sale",
        )

    if sale.status != "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="Only completed sales can be returned",
        )

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    if not items:
        raise HTTPException(
            status_code=400,
            detail="Sale contains no items",
        )

    for item in items:
        inventory = db.query(Inventory).filter(
            Inventory.store_id == sale.store_id,
            Inventory.product_id == item.product_id,
        ).first()

        if inventory:
            inventory.quantity += item.quantity
        else:
            inventory = Inventory(
                store_id=sale.store_id,
                product_id=item.product_id,
                quantity=item.quantity,
            )
            db.add(inventory)

    sale.status = "RETURNED"

    db.commit()
    db.refresh(sale)

    return {
        "message": "Sale returned successfully",
        "sale_id": sale.id,
        "sale_number": sale.sale_number,
        "status": sale.status,
    }


@router.get("/")
def get_returns(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Sale).filter(
        Sale.status == "RETURNED"
    )

    if not is_owner(current_user):
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
            Sale.store_id.in_(store_ids)
        )

    return query.order_by(
        Sale.created_at.desc()
    ).all()


@router.get("/{sale_id}")
def get_return(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    sale = db.query(Sale).filter(
        Sale.id == sale_id,
        Sale.status == "RETURNED",
    ).first()

    if not sale:
        raise HTTPException(
            status_code=404,
            detail="Returned sale not found",
        )

    if not check_store_access(
        db,
        current_user,
        sale.store_id,
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this return",
        )

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    return {
        "id": sale.id,
        "store_id": sale.store_id,
        "user_id": sale.user_id,
        "customer_id": sale.customer_id,
        "sale_number": sale.sale_number,
        "status": sale.status,
        "subtotal": sale.subtotal,
        "discount": sale.discount,
        "tax": sale.tax,
        "total": sale.total,
        "payment_method": sale.payment_method,
        "created_at": sale.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "discount": item.discount,
                "line_total": item.line_total,
            }
            for item in items
        ],
    }
