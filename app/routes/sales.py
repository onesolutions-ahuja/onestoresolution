from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/sales",
    tags=["Sales"],
)


@router.get("/")
def get_sales(
    store_id: int | None = None,
    customer_id: int | None = None,
    payment_method: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Sale)

    if store_id is not None:
        query = query.filter(
            Sale.store_id == store_id
        )

    if customer_id is not None:
        query = query.filter(
            Sale.customer_id == customer_id
        )

    if payment_method:
        query = query.filter(
            Sale.payment_method == payment_method.upper()
        )

    if start_date is not None:
        start_datetime = datetime.combine(
            start_date,
            time.min,
        )
        query = query.filter(
            Sale.created_at >= start_datetime
        )

    if end_date is not None:
        end_datetime = datetime.combine(
            end_date,
            time.max,
        )
        query = query.filter(
            Sale.created_at <= end_datetime
        )

    sales = query.order_by(
        Sale.created_at.desc()
    ).limit(limit).all()

    results = []

    for sale in sales:
        customer = None

        if sale.customer_id:
            customer = db.query(Customer).filter(
                Customer.id == sale.customer_id
            ).first()

        results.append(
            {
                "id": sale.id,
                "sale_number": sale.sale_number,
                "store_id": sale.store_id,
                "customer_id": sale.customer_id,
                "customer_name": (
                    customer.name
                    if customer
                    else None
                ),
                "status": sale.status,
                "subtotal": sale.subtotal,
                "discount": sale.discount,
                "tax": sale.tax,
                "total": sale.total,
                "payment_method": sale.payment_method,
                "created_at": sale.created_at,
            }
        )

    return results


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

    customer = None

    if sale.customer_id:
        customer = db.query(Customer).filter(
            Customer.id == sale.customer_id
        ).first()

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    result_items = []

    for item in items:
        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        result_items.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": (
                    product.name
                    if product
                    else None
                ),
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "discount": item.discount,
                "line_total": item.line_total,
            }
        )

    return {
        "id": sale.id,
        "sale_number": sale.sale_number,
        "store_id": sale.store_id,
        "customer_id": sale.customer_id,
        "customer_name": (
            customer.name
            if customer
            else None
        ),
        "customer_phone": (
            customer.phone
            if customer
            else None
        ),
        "status": sale.status,
        "subtotal": sale.subtotal,
        "discount": sale.discount,
        "tax": sale.tax,
        "total": sale.total,
        "payment_method": sale.payment_method,
        "created_at": sale.created_at,
        "items": result_items,
    }


@router.get("/summary/totals")
def sales_totals(
    store_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Sale).filter(
        Sale.status == "COMPLETED"
    )

    if store_id is not None:
        query = query.filter(
            Sale.store_id == store_id
        )

    if start_date is not None:
        query = query.filter(
            Sale.created_at >= datetime.combine(
                start_date,
                time.min,
            )
        )

    if end_date is not None:
        query = query.filter(
            Sale.created_at <= datetime.combine(
                end_date,
                time.max,
            )
        )

    sales = query.all()

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

    return {
        "total_sales": total_sales,
        "total_revenue": total_revenue,
        "total_tax": total_tax,
        "total_discount": total_discount,
    }
