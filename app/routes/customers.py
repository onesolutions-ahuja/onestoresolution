from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.sale import Sale
from app.schemas.customer import (
    CustomerCreate,
    CustomerResponse,
    CustomerUpdate,
)
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.post(
    "/",
    response_model=CustomerResponse,
)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    customer = Customer(
        name=data.name,
        phone=data.phone,
        email=data.email,
        address=data.address,
        postcode=data.postcode,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


@router.get(
    "/",
    response_model=list[CustomerResponse],
)
def get_customers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(Customer)
        .filter(Customer.is_active.is_(True))
        .order_by(Customer.name)
        .all()
    )


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    updates = data.model_dump(
        exclude_unset=True
    )

    for field, value in updates.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return customer


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    customer.is_active = False

    db.commit()

    return {
        "message": "Customer deactivated successfully"
    }


@router.get("/{customer_id}/sales")
def get_customer_sales(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    sales = (
        db.query(Sale)
        .filter(Sale.customer_id == customer_id)
        .order_by(Sale.created_at.desc())
        .all()
    )

    return [
        {
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
        }
        for sale in sales
    ]


@router.get("/{customer_id}/summary")
def get_customer_summary(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    sales = (
        db.query(Sale)
        .filter(
            Sale.customer_id == customer_id,
            Sale.status == "COMPLETED",
        )
        .all()
    )

    purchase_count = len(sales)

    total_spend = sum(
        (sale.total for sale in sales),
        Decimal("0"),
    )

    average_order_value = (
        total_spend / purchase_count
        if purchase_count
        else Decimal("0")
    )

    latest_purchase = max(
        (sale.created_at for sale in sales),
        default=None,
    )

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "purchase_count": purchase_count,
        "total_spend": total_spend,
        "average_order_value": average_order_value,
        "latest_purchase": latest_purchase,
    }
