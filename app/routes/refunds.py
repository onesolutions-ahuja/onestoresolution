from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.refund import Refund
from app.models.sale import Sale, SaleItem
from app.models.stock_movement import StockMovement
from app.schemas.refund import RefundCreate
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/refunds",
    tags=["Refunds"],
)


@router.post("/{sale_id}")
def create_refund(
    sale_id: int,
    data: RefundCreate,
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

    if sale.status not in {"COMPLETED", "PARTIALLY_REFUNDED"}:
        raise HTTPException(
            status_code=400,
            detail="This sale cannot be refunded",
        )

    refunded = db.query(
        func.coalesce(func.sum(Refund.amount), 0)
    ).filter(
        Refund.sale_id == sale.id
    ).scalar()

    remaining = sale.total - refunded

    if data.amount > remaining:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum refundable amount is {remaining}",
        )

    payment_method = (
        data.payment_method
        if data.payment_method
        else sale.payment_method
    )

    refund = Refund(
        sale_id=sale.id,
        user_id=current_user.id,
        amount=data.amount,
        reason=data.reason,
        payment_method=payment_method,
    )

    db.add(refund)

    if data.amount == remaining:
        sale.status = "REFUNDED"
    else:
        sale.status = "PARTIALLY_REFUNDED"

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    if len(items) == 1:
        item = items[0]

        inventory = db.query(Inventory).filter(
            Inventory.store_id == sale.store_id,
            Inventory.product_id == item.product_id,
        ).first()

        if not inventory:
            inventory = Inventory(
                store_id=sale.store_id,
                product_id=item.product_id,
                quantity=0,
                minimum_quantity=0,
                cost_price=0,
                selling_price=item.unit_price,
            )
            db.add(inventory)
            db.flush()

        quantity_before = inventory.quantity
        inventory.quantity += item.quantity

        movement = StockMovement(
            store_id=sale.store_id,
            product_id=item.product_id,
            user_id=current_user.id,
            movement_type="REFUND",
            quantity_change=item.quantity,
            quantity_before=quantity_before,
            quantity_after=inventory.quantity,
            reason=f"Refund for {sale.sale_number}",
        )

        db.add(movement)

    db.commit()
    db.refresh(refund)

    return {
        "message": "Refund created successfully",
        "refund_id": refund.id,
        "sale_id": sale.id,
        "amount": refund.amount,
        "payment_method": refund.payment_method,
        "status": sale.status,
        "remaining_refundable": remaining - data.amount,
    }


@router.get("/sale/{sale_id}")
def get_sale_refunds(
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

    refunds = db.query(Refund).filter(
        Refund.sale_id == sale_id
    ).order_by(
        Refund.created_at.desc()
    ).all()

    total_refunded = sum(
        (refund.amount for refund in refunds),
        Decimal("0"),
    )

    return {
        "sale_id": sale_id,
        "sale_total": sale.total,
        "total_refunded": total_refunded,
        "remaining": sale.total - total_refunded,
        "refunds": refunds,
    }
