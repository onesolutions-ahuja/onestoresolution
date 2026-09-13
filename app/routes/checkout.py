from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.models.stock_movement import StockMovement
from app.schemas.checkout import CheckoutCreate
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/checkout",
    tags=["Checkout"],
)


@router.post("/")
def checkout(
    data: CheckoutCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if data.payment_method.upper() not in {
        "CASH",
        "CARD",
        "OTHER",
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method",
        )

    subtotal = Decimal("0")
    sale_items = []
    inventory_updates = []

    for item in data.items:
        product = db.query(Product).filter(
            Product.id == item.product_id,
            Product.is_active == True,
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
                detail=f"No inventory found for product {item.product_id}",
            )

        if inventory.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for {product.name}. "
                    f"Available: {inventory.quantity}"
                ),
            )

        unit_price = Decimal(str(product.selling_price))
        line_total = unit_price * item.quantity

        subtotal += line_total

        sale_items.append(
            {
                "product": product,
                "inventory": inventory,
                "quantity": item.quantity,
                "unit_price": unit_price,
                "line_total": line_total,
            }
        )

    if data.discount > subtotal:
        raise HTTPException(
            status_code=400,
            detail="Discount cannot exceed subtotal",
        )

    taxable_amount = subtotal - data.discount

    tax = Decimal("0")

    for item in sale_items:
        product = item["product"]

        item_tax = (
            item["line_total"]
            * Decimal(str(product.vat_rate))
            / Decimal("100")
        )

        tax += item_tax

    total = taxable_amount + tax

    sale_number = f"SALE-{current_user.id}-{db.query(Sale).count() + 1}"

    sale = Sale(
        store_id=data.store_id,
        user_id=current_user.id,
        sale_number=sale_number,
        status="COMPLETED",
        subtotal=subtotal,
        discount=data.discount,
        tax=tax,
        total=total,
        payment_method=data.payment_method.upper(),
    )

    db.add(sale)
    db.flush()

    for item in sale_items:
        inventory = item["inventory"]

        quantity_before = inventory.quantity
        inventory.quantity -= item["quantity"]

        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item["product"].id,
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            discount=Decimal("0"),
            line_total=item["line_total"],
        )

        db.add(sale_item)

        movement = StockMovement(
            store_id=data.store_id,
            product_id=item["product"].id,
            user_id=current_user.id,
            movement_type="SALE",
            quantity_change=-item["quantity"],
            quantity_before=quantity_before,
            quantity_after=inventory.quantity,
            reason=f"Sale {sale.sale_number}",
        )

        db.add(movement)

    db.commit()
    db.refresh(sale)

    return {
        "message": "Sale completed successfully",
        "sale_id": sale.id,
        "sale_number": sale.sale_number,
        "subtotal": sale.subtotal,
        "discount": sale.discount,
        "tax": sale.tax,
        "total": sale.total,
        "payment_method": sale.payment_method,
    }
