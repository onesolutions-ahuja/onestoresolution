from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.purchase_order import PurchaseOrder
from app.models.sale import Sale
from app.models.store import Store
from app.models.supplier import Supplier
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def dashboard(
    store_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = datetime.utcnow().date()
    start = datetime.combine(today, time.min)
    end = start + timedelta(days=1)

    sales_query = db.query(Sale).filter(
        Sale.status == "COMPLETED",
        Sale.created_at >= start,
        Sale.created_at < end,
    )

    inventory_query = db.query(Inventory)

    purchases_query = db.query(PurchaseOrder)

    if store_id is not None:
        sales_query = sales_query.filter(
            Sale.store_id == store_id
        )
        inventory_query = inventory_query.filter(
            Inventory.store_id == store_id
        )
        purchases_query = purchases_query.filter(
            PurchaseOrder.store_id == store_id
        )

    sales_count = sales_query.count()

    revenue = sales_query.with_entities(
        func.coalesce(func.sum(Sale.total), 0)
    ).scalar()

    low_stock_count = inventory_query.filter(
        Inventory.quantity <= Inventory.minimum_quantity
    ).count()

    product_count = db.query(Product).filter(
        Product.is_active == True
    ).count()

    customer_count = db.query(Customer).filter(
        Customer.is_active == True
    ).count()

    supplier_count = db.query(Supplier).filter(
        Supplier.is_active == True
    ).count()

    pending_purchases = purchases_query.filter(
        PurchaseOrder.status != "RECEIVED"
    ).count()

    return {
        "date": today,
        "store_id": store_id,
        "today": {
            "sales_count": sales_count,
            "revenue": revenue,
        },
        "inventory": {
            "low_stock_count": low_stock_count,
        },
        "counts": {
            "products": product_count,
            "customers": customer_count,
            "suppliers": supplier_count,
        },
        "purchases": {
            "pending": pending_purchases,
        },
    }
