from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product_supplier import ProductSupplier
from app.models.product import Product
from app.models.supplier import Supplier
from app.security.dependencies  import get_current_user
from app.schemas.product_supplier import (
    ProductSupplierCreate,
    ProductSupplierUpdate,
    ProductSupplierResponse,
)

router = APIRouter(
    prefix="/product-suppliers",
    tags=["Product Suppliers"],
)


@router.post("/", response_model=ProductSupplierResponse)
def create_product_supplier(
    data: ProductSupplierCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.id == data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    supplier = db.query(Supplier).filter(
        Supplier.id == data.supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    existing = db.query(ProductSupplier).filter(
        ProductSupplier.product_id == data.product_id,
        ProductSupplier.supplier_id == data.supplier_id,
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Product is already linked to this supplier",
        )

    if data.is_preferred:
        db.query(ProductSupplier).filter(
            ProductSupplier.product_id == data.product_id
        ).update(
            {"is_preferred": False},
            synchronize_session=False,
        )

    relationship = ProductSupplier(
        product_id=data.product_id,
        supplier_id=data.supplier_id,
        supplier_product_code=data.supplier_product_code,
        cost_price=data.cost_price,
        is_preferred=data.is_preferred,
    )

    db.add(relationship)
    db.commit()
    db.refresh(relationship)

    return relationship


@router.get("/", response_model=list[ProductSupplierResponse])
def get_product_suppliers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return db.query(ProductSupplier).all()


@router.get("/{product_supplier_id}", response_model=ProductSupplierResponse)
def get_product_supplier(
    product_supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    relationship = db.query(ProductSupplier).filter(
        ProductSupplier.id == product_supplier_id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=404,
            detail="Product-supplier relationship not found",
        )

    return relationship


@router.get(
    "/product/{product_id}/suppliers",
    response_model=list[ProductSupplierResponse],
)
def get_suppliers_for_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return db.query(ProductSupplier).filter(
        ProductSupplier.product_id == product_id
    ).all()


@router.get(
    "/supplier/{supplier_id}/products",
    response_model=list[ProductSupplierResponse],
)
def get_products_for_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    return db.query(ProductSupplier).filter(
        ProductSupplier.supplier_id == supplier_id
    ).all()


@router.put(
    "/{product_supplier_id}",
    response_model=ProductSupplierResponse,
)
def update_product_supplier(
    product_supplier_id: int,
    data: ProductSupplierUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    relationship = db.query(ProductSupplier).filter(
        ProductSupplier.id == product_supplier_id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=404,
            detail="Product-supplier relationship not found",
        )

    if data.is_preferred:
        db.query(ProductSupplier).filter(
            ProductSupplier.product_id == relationship.product_id,
            ProductSupplier.id != relationship.id,
        ).update(
            {"is_preferred": False},
            synchronize_session=False,
        )

    if data.supplier_product_code is not None:
        relationship.supplier_product_code = data.supplier_product_code

    if data.cost_price is not None:
        relationship.cost_price = data.cost_price

    if data.is_preferred is not None:
        relationship.is_preferred = data.is_preferred

    db.commit()
    db.refresh(relationship)

    return relationship


@router.delete("/{product_supplier_id}")
def delete_product_supplier(
    product_supplier_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    relationship = db.query(ProductSupplier).filter(
        ProductSupplier.id == product_supplier_id
    ).first()

    if not relationship:
        raise HTTPException(
            status_code=404,
            detail="Product-supplier relationship not found",
        )

    db.delete(relationship)
    db.commit()

    return {
        "message": "Product-supplier relationship deleted successfully"
    }
