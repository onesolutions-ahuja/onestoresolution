from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse
from app.security.dependencies import get_current_user


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.post("/", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Only the Owner can create categories",
        )

    existing = (
        db.query(Category)
        .filter(Category.name == data.name)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists",
        )

    category = Category(name=data.name)

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.get("/", response_model=list[CategoryResponse])
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Category)
        .filter(Category.is_active == True)
        .order_by(Category.name)
        .all()
    )
