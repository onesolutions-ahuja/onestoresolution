from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.post("/", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Only the Owner can create products",
        )

    if data.category_id is not None:
        category = (
            db.query(Category)
            .filter(Category.id == data.category_id)
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found",
            )

    if data.barcode:
        existing = (
            db.query(Product)
            .filter(Product.barcode == data.barcode)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Barcode already exists",
            )

    if data.sku:
        existing = (
            db.query(Product)
            .filter(Product.sku == data.sku)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="SKU already exists",
            )

    product = Product(
        name=data.name,
        barcode=data.barcode,
        sku=data.sku,
        category_id=data.category_id,
        cost_price=data.cost_price,
        selling_price=data.selling_price,
        vat_rate=data.vat_rate,
        is_active=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@router.get("/", response_model=list[ProductResponse])
def get_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.name)
        .all()
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.is_active == True,
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return product
