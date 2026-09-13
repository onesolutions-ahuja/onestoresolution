from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sale import Sale
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/payment-reports",
    tags=["Payment Reports"],
)


@router.get("/today")
def payment_report_today(
    store_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = datetime.utcnow().date()

    start = datetime.combine(
        today,
        time.min,
    )

    end = start + timedelta(days=1)

    query = db.query(Sale).filter(
        Sale.status == "COMPLETED",
        Sale.created_at >= start,
        Sale.created_at < end,
    )

    if store_id is not None:
        query = query.filter(
            Sale.store_id == store_id
        )

    results = query.with_entities(
        Sale.payment_method,
        func.count(Sale.id),
        func.coalesce(func.sum(Sale.total), 0),
    ).group_by(
        Sale.payment_method
    ).all()

    payments = []

    grand_total = 0
    grand_count = 0

    for method, count, total in results:
        payments.append(
            {
                "payment_method": method,
                "transaction_count": count,
                "total": total,
            }
        )

        grand_count += count
        grand_total += total

    return {
        "date": today,
        "store_id": store_id,
        "transactions": grand_count,
        "total": grand_total,
        "by_payment_method": payments,
    }
