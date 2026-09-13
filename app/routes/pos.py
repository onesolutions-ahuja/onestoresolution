from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.sale import Sale, SaleItem
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/pos",
    tags=["POS"],
)


@router.get("/products/search")
def search_products(
    q: str,
    store_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not q.strip():
        raise HTTPException(
            status_code=400,
            detail="Search value is required",
        )

    search = f"%{q.strip()}%"

    products = db.query(Product).filter(
        Product.is_active == True,
        (
            Product.name.ilike(search)
            | Product.barcode.ilike(search)
            | Product.sku.ilike(search)
        ),
    ).limit(50).all()

    results = []

    for product in products:
        inventory = db.query(Inventory).filter(
            Inventory.store_id == store_id,
            Inventory.product_id == product.id,
        ).first()

        results.append(
            {
                "id": product.id,
                "name": product.name,
                "barcode": product.barcode,
                "sku": product.sku,
                "selling_price": product.selling_price,
                "vat_rate": product.vat_rate,
                "stock_quantity": (
                    inventory.quantity if inventory else 0
                ),
            }
        )

    return results


@router.get("/products/barcode/{barcode}")
def get_product_by_barcode(
    barcode: str,
    store_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.barcode == barcode,
        Product.is_active == True,
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    inventory = db.query(Inventory).filter(
        Inventory.store_id == store_id,
        Inventory.product_id == product.id,
    ).first()

    return {
        "id": product.id,
        "name": product.name,
        "barcode": product.barcode,
        "sku": product.sku,
        "selling_price": product.selling_price,
        "vat_rate": product.vat_rate,
        "stock_quantity": (
            inventory.quantity if inventory else 0
        ),
    }


@router.get("/receipt/{sale_id}")
def get_receipt(
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

    items = db.query(SaleItem).filter(
        SaleItem.sale_id == sale.id
    ).all()

    receipt_items = []

    for item in items:
        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        receipt_items.append(
            {
                "product_id": item.product_id,
                "name": product.name if product else "Unknown",
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "line_total": item.line_total,
            }
        )

    return {
        "sale_id": sale.id,
        "sale_number": sale.sale_number,
        "store_id": sale.store_id,
        "customer_id": sale.customer_id,
        "subtotal": sale.subtotal,
        "discount": sale.discount,
        "tax": sale.tax,
        "total": sale.total,
        "payment_method": sale.payment_method,
        "items": receipt_items,
        "created_at": sale.created_at,
    }
