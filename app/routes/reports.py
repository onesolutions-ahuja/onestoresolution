from datetime import date, datetime, time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.sale import Sale
from app.models.purchase_order import PurchaseOrder
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/dashboard")
def dashboard(
    store_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    sales_query = db.query(Sale).filter(
        Sale.status == "COMPLETED"
    )

    purchases_query = db.query(PurchaseOrder).filter(
        PurchaseOrder.status == "RECEIVED"
    )

    inventory_query = db.query(Inventory)

    if store_id is not None:
        sales_query = sales_query.filter(
            Sale.store_id == store_id
        )

        purchases_query = purchases_query.filter(
            PurchaseOrder.store_id == store_id
        )

        inventory_query = inventory_query.filter(
            Inventory.store_id == store_id
        )

    if start_date is not None:
        start_datetime = datetime.combine(
            start_date,
            time.min,
        )

        sales_query = sales_query.filter(
            Sale.created_at >= start_datetime
        )

        purchases_query = purchases_query.filter(
            PurchaseOrder.created_at >= start_datetime
        )

    if end_date is not None:
        end_datetime = datetime.combine(
            end_date,
            time.max,
        )

        sales_query = sales_query.filter(
            Sale.created_at <= end_datetime
        )

        purchases_query = purchases_query.filter(
            PurchaseOrder.created_at <= end_datetime
        )

    sales = sales_query.all()
    purchases = purchases_query.all()
    inventory = inventory_query.all()

    total_sales = len(sales)

    total_revenue = sum(
        (sale.total for sale in sales),
        0,
    )

    total_tax = sum(
        (sale.tax for sale in sales),
        0,
    )

    total_discount = sum(
        (sale.discount for sale in sales),
        0,
    )

    total_purchase_value = sum(
        (purchase.total_amount for purchase in purchases),
        0,
    )

    total_stock_units = sum(
        item.quantity for item in inventory
    )

    low_stock_count = sum(
        1
        for item in inventory
        if item.quantity <= item.minimum_quantity
    )

    return {
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "total_tax": total_tax,
        "total_discount": total_discount,
        "total_purchase_value": total_purchase_value,
        "total_stock_units": total_stock_units,
        "low_stock_count": low_stock_count,
    }


@router.get("/low-stock")
def low_stock_products(
    store_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Inventory)

    if store_id is not None:
        query = query.filter(
            Inventory.store_id == store_id
        )

    inventory = query.all()

    results = []

    for item in inventory:
        if item.quantity <= item.minimum_quantity:
            product = db.query(Product).filter(
                Product.id == item.product_id
            ).first()

            results.append(
                {
                    "product_id": item.product_id,
                    "product_name": (
                        product.name
                        if product
                        else None
                    ),
                    "store_id": item.store_id,
                    "quantity": item.quantity,
                    "minimum_quantity": item.minimum_quantity,
                }
            )

    return results
