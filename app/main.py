from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.database import engine
from app.routes.auth import router as auth_router
from app.routes.stores import router as stores_router
from app.routes.store_access import router as store_access_router
from app.routes.users import router as users_router
from app.routes.categories import router as categories_router
from app.routes.products import router as products_router
from app.routes.suppliers import router as suppliers_router
from app.routes.purchase_orders import router as purchase_orders_router
from app.routes.product_suppliers import router as product_suppliers_router
from app.routes.sales import router as sales_router
from app.routes.customers import router as customers_router
from app.routes.returns import router as returns_router
from app.routes.inventory import router as inventory_router
from app.routes.stock_transfers import router as stock_transfers_router
from app.routes.stock_adjustments import router as stock_adjustments_router
from app.routes.stock_levels import router as stock_levels_router
from app.routes.low_stock import router as low_stock_router
from app.routes.stock_transfer import router as stock_transfer_router
from app.routes.dashboard import router as dashboard_router
from app.routes.supplier_reports import router as supplier_reports_router
from app.routes.payment_reports import router as payment_reports_router
from app.routes.vat import router as vat_router
from app.routes.till import router as till_router
from app.routes.refunds import router as refunds_router
from app.routes.checkout import router as checkout_router
from app.routes.pos import router as pos_router
from app.routes.reports import router as reports_router


app = FastAPI(
    title="OneStoreSolution",
    description="Multi-store retail management system",
    version="0.1.0",
)


# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------
# Allows the Vercel frontend to communicate with
# the Render FastAPI backend.
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://onestoresolution.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

app.include_router(auth_router)
app.include_router(stores_router)
app.include_router(store_access_router)
app.include_router(users_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(suppliers_router)
app.include_router(purchase_orders_router)
app.include_router(product_suppliers_router)
app.include_router(sales_router)
app.include_router(customers_router)
app.include_router(returns_router)
app.include_router(inventory_router)
app.include_router(stock_transfers_router)
app.include_router(stock_adjustments_router)
app.include_router(stock_levels_router)
app.include_router(low_stock_router)
app.include_router(stock_transfer_router)
app.include_router(dashboard_router)
app.include_router(supplier_reports_router)
app.include_router(payment_reports_router)
app.include_router(vat_router)
app.include_router(till_router)
app.include_router(refunds_router)
app.include_router(checkout_router)
app.include_router(pos_router)
app.include_router(reports_router)


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "application": "OneStoreSolution",
        "status": "running",
    }


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# ---------------------------------------------------------
# DATABASE TEST
# ---------------------------------------------------------

@app.get("/database-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        value = result.scalar()

    return {
        "database": "connected",
        "test": value,
    }


# ---------------------------------------------------------
# DATABASE TABLES
# ---------------------------------------------------------

@app.get("/database-tables")
def database_tables():
    inspector = inspect(engine)

    return {
        "tables": inspector.get_table_names()
    }
