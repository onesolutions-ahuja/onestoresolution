from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.store import Store
from app.models.supplier import Supplier
from app.models.user import User
from app.models.user_store_access import UserStoreAccess
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderResponse, ReceivePurchaseResponse
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])

def has_store_access(user: User, store_id: int, db: Session) -> bool:
    if user.role_id == 1:
        return True
    return db.query(UserStoreAccess).filter(UserStoreAccess.user_id == user.id, UserStoreAccess.store_id == store_id).first() is not None

def make_response(order, items):
    return {
        "id": order.id, "store_id": order.store_id, "supplier_id": order.supplier_id,
        "status": order.status, "invoice_number": order.invoice_number,
        "notes": order.notes, "total_amount": order.total_amount,
        "items": [{"id": i.id, "product_id": i.product_id, "quantity": i.quantity,
                   "unit_cost": i.unit_cost, "line_total": i.line_total} for i in items],
    }

@router.post("/", response_model=PurchaseOrderResponse)
def create_purchase_order(data: PurchaseOrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not has_store_access(current_user, data.store_id, db):
        raise HTTPException(status_code=403, detail="You do not have access to this store")
    if not db.query(Store).filter(Store.id == data.store_id).first():
        raise HTTPException(status_code=404, detail="Store not found")
    if not db.query(Supplier).filter(Supplier.id == data.supplier_id, Supplier.is_active == True).first():
        raise HTTPException(status_code=404, detail="Supplier not found")

    order = PurchaseOrder(store_id=data.store_id, supplier_id=data.supplier_id, status="DRAFT",
                          invoice_number=data.invoice_number, notes=data.notes, total_amount=Decimal("0"))
    db.add(order)
    db.flush()
    total = Decimal("0")

    for item_data in data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id, Product.is_active == True).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")
        line_total = item_data.unit_cost * item_data.quantity
        db.add(PurchaseOrderItem(purchase_order_id=order.id, product_id=item_data.product_id,
                                 quantity=item_data.quantity, unit_cost=item_data.unit_cost,
                                 line_total=line_total))
        total += line_total

    order.total_amount = total
    db.commit()
    db.refresh(order)
    items = db.query(PurchaseOrderItem).filter(PurchaseOrderItem.purchase_order_id == order.id).all()
    return make_response(order, items)

@router.get("/", response_model=list[PurchaseOrderResponse])
def get_purchase_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(PurchaseOrder)
    if current_user.role_id != 1:
        query = query.join(UserStoreAccess, UserStoreAccess.store_id == PurchaseOrder.store_id).filter(UserStoreAccess.user_id == current_user.id)
    orders = query.order_by(PurchaseOrder.created_at.desc()).all()
    return [make_response(o, db.query(PurchaseOrderItem).filter(PurchaseOrderItem.purchase_order_id == o.id).all()) for o in orders]

@router.get("/{purchase_order_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(purchase_order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == purchase_order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if not has_store_access(current_user, order.store_id, db):
        raise HTTPException(status_code=403, detail="You do not have access to this store")
    items = db.query(PurchaseOrderItem).filter(PurchaseOrderItem.purchase_order_id == order.id).all()
    return make_response(order, items)

@router.post("/{purchase_order_id}/receive", response_model=ReceivePurchaseResponse)
def receive_purchase_order(purchase_order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == purchase_order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if not has_store_access(current_user, order.store_id, db):
        raise HTTPException(status_code=403, detail="You do not have access to this store")
    if order.status == "RECEIVED":
        raise HTTPException(status_code=400, detail="Purchase order has already been received")

    items = db.query(PurchaseOrderItem).filter(PurchaseOrderItem.purchase_order_id == order.id).all()
    if not items:
        raise HTTPException(status_code=400, detail="Purchase order has no items")

    for item in items:
        inv = db.query(Inventory).filter(Inventory.store_id == order.store_id, Inventory.product_id == item.product_id).first()
        if not inv:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            inv = Inventory(store_id=order.store_id, product_id=item.product_id, quantity=0,
                            minimum_quantity=0, cost_price=item.unit_cost,
                            selling_price=product.selling_price if product else Decimal("0"))
            db.add(inv)
        inv.quantity += item.quantity
        inv.cost_price = item.unit_cost

    order.status = "RECEIVED"
    order.received_at = datetime.utcnow()
    db.commit()

    return {"message": "Purchase received and stock updated successfully",
            "purchase_order_id": order.id, "store_id": order.store_id,
            "total_amount": order.total_amount}
