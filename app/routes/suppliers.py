from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.supplier import Supplier
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierResponse
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.post("/", response_model=SupplierResponse)
def create_supplier(data: SupplierCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="Only the Owner can create suppliers")
    supplier = Supplier(**data.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.get("/", response_model=list[SupplierResponse])
def get_suppliers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Supplier).filter(Supplier.is_active == True).order_by(Supplier.name).all()

@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.is_active == True).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier
