from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sale import Sale
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/vat",
    tags=["VAT"],
)


@router.get("/summary")
def vat_summary(
    store_id: int | None = None,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if days < 1:
        days = 1

    if days > 366:
        days = 366

    end = datetime.utcnow()

    start = end - timedelta(days=days)

    query = db.query(Sale).filter(
        Sale.status == "COMPLETED",
        Sale.created_at >= start,
        Sale.created_at <= end,
    )

    if store_id is not None:
        query = query.filter(
            Sale.store_id == store_id
        )

    result = query.with_entities(
        func.coalesce(
            func.sum(Sale.subtotal),
            0,
        ),
        func.coalesce(
            func.sum(Sale.discount),
            0,
        ),
        func.coalesce(
            func.sum(Sale.tax),
            0,
        ),
        func.coalesce(
            func.sum(Sale.total),
            0,
        ),
    ).first()

    subtotal = result[0]
    discount = result[1]
    tax = result[2]
    total = result[3]

    return {
        "period": {
            "from": start,
            "to": end,
            "days": days,
        },
        "store_id": store_id,
        "sales": {
            "subtotal": subtotal,
            "discount": discount,
            "vat": tax,
            "total": total,
        },
    }
