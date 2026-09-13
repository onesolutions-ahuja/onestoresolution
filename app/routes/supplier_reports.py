from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.supplier import Supplier
from app.models.purchase_order import PurchaseOrder
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/supplier-reports",
    tags=["Supplier Reports"],
)


@router.get("/")
def supplier_report(
    active_only: bool = True,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Supplier)

    if active_only:
        query = query.filter(
            Supplier.is_active == True
        )

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            Supplier.name.ilike(search_value)
        )

    suppliers = query.order_by(
        Supplier.name
    ).all()

    results = []

    for supplier in suppliers:
        purchase_count = db.query(
            PurchaseOrder
        ).filter(
            PurchaseOrder.supplier_id == supplier.id
        ).count()

        purchase_total = db.query(
            PurchaseOrder
        ).filter(
            PurchaseOrder.supplier_id == supplier.id
        ).with_entities(
            __import__("sqlalchemy").func.coalesce(
                __import__("sqlalchemy").func.sum(
                    PurchaseOrder.total_amount
                ),
                0,
            )
        ).scalar()

        results.append(
            {
                "id": supplier.id,
                "name": supplier.name,
                "phone": getattr(supplier, "phone", None),
                "email": getattr(supplier, "email", None),
                "is_active": supplier.is_active,
                "purchase_orders": purchase_count,
                "purchase_total": purchase_total,
            }
        )

    return results


@router.get("/{supplier_id}")
def supplier_detail(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    orders = db.query(PurchaseOrder).filter(
        PurchaseOrder.supplier_id == supplier_id
    ).order_by(
        PurchaseOrder.created_at.desc()
    ).all()

    return {
        "supplier": {
            "id": supplier.id,
            "name": supplier.name,
            "phone": getattr(supplier, "phone", None),
            "email": getattr(supplier, "email", None),
            "is_active": supplier.is_active,
        },
        "purchase_orders": [
            {
                "id": order.id,
                "store_id": order.store_id,
                "status": order.status,
                "invoice_number": order.invoice_number,
                "total_amount": order.total_amount,
                "created_at": order.created_at,
                "received_at": order.received_at,
            }
            for order in orders
        ],
    }
