from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.store import Store
from app.schemas.sale import SaleCreate
from app.security.dependencies  import get_current_user


router = APIRouter(
    prefix="/sales",
    tags=["Sales"],
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


@router.post("/")
def create_sale(
    data: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not check_store_access(db, current_user, data.store_id):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    store = db.query(Store).filter(
        Store.id == data.store_id
    ).first()

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Store not found",
        )

    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Sale must contain at least one item",
        )

    subtotal = Decimal("0")
    prepared_items = []

    for item in data.items:
        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found",
            )

        inventory = db.query(Inventory).filter(
            Inventory.store_id == data.store_id,
            Inventory.product_id == item.product_id,
        ).first()

        if not inventory:
            raise HTTPException(
                status_code=400,
                detail=f"No inventory record for product {item.product_id}",
            )

        if inventory.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product {item.product_id}",
            )

        line_total = (
            item.unit_price * item.quantity
        ) - item.discount

        if line_total < 0:
            raise HTTPException(
                status_code=400,
                detail="Line total cannot be negative",
            )

        subtotal += line_total

        prepared_items.append(
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "discount": item.discount,
                "line_total": line_total,
                "inventory": inventory,
            }
        )

    if data.discount > subtotal:
        raise HTTPException(
            status_code=400,
            detail="Discount cannot exceed subtotal",
        )

    total = subtotal - data.discount + data.tax

    sale_number = f"SALE-{uuid4().hex[:12].upper()}"

    sale = Sale(
       store_id=data.store_id,
    user_id=current_user.id,
    customer_id=data.customer_id,
    sale_number=sale_number,
    status="COMPLETED",
    subtotal=subtotal,
    discount=data.discount,
    tax=data.tax,
    total=total,
    payment_method=data.payment_method.upper(),
    )

    db.add(sale)
    db.flush()

    for item in prepared_items:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            discount=item["discount"],
            line_total=item["line_total"],
        )

        db.add(sale_item)

        item["inventory"].quantity -= item["quantity"]

    db.commit()
    db.refresh(sale)

    return {
        "message": "Sale completed successfully",
        "sale_id": sale.id,
        "sale_number": sale.sale_number,
        "store_id": sale.store_id,
        "subtotal": sale.subtotal,
        "discount": sale.discount,
        "tax": sale.tax,
        "total": sale.total,
        "payment_method": sale.payment_method,
    }


@router.get("/")
def get_sales(
    store_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Sale)

    if is_owner(current_user):
        if store_id is not None:
            query = query.filter(
                Sale.store_id == store_id
            )
    else:
        from app.models.user_store_access import UserStoreAccess

        stores = db.query(UserStoreAccess.store_id).filter(
            UserStoreAccess.user_id == current_user.id
        ).all()

        store_ids = [row[0] for row in stores]

        if not store_ids:
            return []

        query = query.filter(
            Sale.store_id.in_(store_ids)
        )

        if store_id is not None:
            if store_id not in store_ids:
                raise HTTPException(
                    status_code=403,
                    detail="You do not have access to this store",
                )

    return query.order_by(
        Sale.created_at.desc()
    ).all()


@router.get("/{sale_id}")
def get_sale(
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

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    return {
        "id": sale.id,
        "store_id": sale.store_id,
        "user_id": sale.user_id,
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


@router.post("/{sale_id}/void")
def void_sale(
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
            detail="Only completed sales can be voided",
        )

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

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

    sale.status = "VOID"

    db.commit()

    return {
        "message": "Sale voided successfully",
        "sale_id": sale.id,
        "sale_number": sale.sale_number,
        "status": sale.status,
    }
