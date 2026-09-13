from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sale import Sale
from app.models.till import TillMovement, TillSession
from app.models.user_store_access import UserStoreAccess
from app.schemas.till import (
    TillCloseRequest,
    TillMovementRequest,
    TillOpenRequest,
)
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/till",
    tags=["Till"],
)


def has_store_access(user, store_id: int, db: Session) -> bool:
    if user.role_id == 1:
        return True

    return db.query(UserStoreAccess).filter(
        UserStoreAccess.user_id == user.id,
        UserStoreAccess.store_id == store_id,
    ).first() is not None


@router.post("/open")
def open_till(
    data: TillOpenRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not has_store_access(current_user, data.store_id, db):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    existing = db.query(TillSession).filter(
        TillSession.store_id == data.store_id,
        TillSession.status == "OPEN",
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="There is already an open till for this store",
        )

    till = TillSession(
        store_id=data.store_id,
        user_id=current_user.id,
        opening_cash=data.opening_cash,
        status="OPEN",
    )

    db.add(till)
    db.commit()
    db.refresh(till)

    return till


@router.get("/current")
def current_till(
    store_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not has_store_access(current_user, store_id, db):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    till = db.query(TillSession).filter(
        TillSession.store_id == store_id,
        TillSession.status == "OPEN",
    ).first()

    if not till:
        raise HTTPException(
            status_code=404,
            detail="No open till found",
        )

    sales_cash = db.query(
        func.coalesce(func.sum(Sale.total), 0)
    ).filter(
        Sale.store_id == store_id,
        Sale.status == "COMPLETED",
        Sale.payment_method.ilike("cash"),
        Sale.created_at >= till.opened_at,
    ).scalar()

    movements_in = db.query(
        func.coalesce(func.sum(TillMovement.amount), 0)
    ).filter(
        TillMovement.till_session_id == till.id,
        TillMovement.movement_type == "CASH_IN",
    ).scalar()

    movements_out = db.query(
        func.coalesce(func.sum(TillMovement.amount), 0)
    ).filter(
        TillMovement.till_session_id == till.id,
        TillMovement.movement_type == "CASH_OUT",
    ).scalar()

    expected = (
        till.opening_cash
        + sales_cash
        + movements_in
        - movements_out
    )

    return {
        "till_id": till.id,
        "store_id": till.store_id,
        "status": till.status,
        "opening_cash": till.opening_cash,
        "cash_sales": sales_cash,
        "cash_in": movements_in,
        "cash_out": movements_out,
        "expected_cash": expected,
        "opened_at": till.opened_at,
    }


@router.post("/movement")
def till_movement(
    data: TillMovementRequest,
    till_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    till = db.query(TillSession).filter(
        TillSession.id == till_id,
        TillSession.status == "OPEN",
    ).first()

    if not till:
        raise HTTPException(
            status_code=404,
            detail="Open till not found",
        )

    if not has_store_access(
        current_user,
        till.store_id,
        db,
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    movement_type = data.movement_type.upper()

    if movement_type not in {"CASH_IN", "CASH_OUT"}:
        raise HTTPException(
            status_code=400,
            detail="movement_type must be CASH_IN or CASH_OUT",
        )

    movement = TillMovement(
        till_session_id=till.id,
        user_id=current_user.id,
        movement_type=movement_type,
        amount=data.amount,
        reason=data.reason,
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return movement


@router.post("/close")
def close_till(
    data: TillCloseRequest,
    till_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    till = db.query(TillSession).filter(
        TillSession.id == till_id,
        TillSession.status == "OPEN",
    ).first()

    if not till:
        raise HTTPException(
            status_code=404,
            detail="Open till not found",
        )

    if not has_store_access(
        current_user,
        till.store_id,
        db,
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this store",
        )

    cash_sales = db.query(
        func.coalesce(func.sum(Sale.total), 0)
    ).filter(
        Sale.store_id == till.store_id,
        Sale.status == "COMPLETED",
        Sale.payment_method.ilike("cash"),
        Sale.created_at >= till.opened_at,
    ).scalar()

    cash_in = db.query(
        func.coalesce(func.sum(TillMovement.amount), 0)
    ).filter(
        TillMovement.till_session_id == till.id,
        TillMovement.movement_type == "CASH_IN",
    ).scalar()

    cash_out = db.query(
        func.coalesce(func.sum(TillMovement.amount), 0)
    ).filter(
        TillMovement.till_session_id == till.id,
        TillMovement.movement_type == "CASH_OUT",
    ).scalar()

    expected = (
        till.opening_cash
        + cash_sales
        + cash_in
        - cash_out
    )

    till.closing_cash = data.closing_cash
    till.expected_cash = expected
    till.variance = data.closing_cash - expected
    till.status = "CLOSED"
    till.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(till)

    return {
        "message": "Till closed successfully",
        "till_id": till.id,
        "opening_cash": till.opening_cash,
        "cash_sales": cash_sales,
        "cash_in": cash_in,
        "cash_out": cash_out,
        "expected_cash": expected,
        "closing_cash": till.closing_cash,
        "variance": till.variance,
        "closed_at": till.closed_at,
    }
