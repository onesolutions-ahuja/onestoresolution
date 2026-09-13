from fastapi import FastAPI
from sqlalchemy import inspect, text
from app.database import engine
from app.routes.setup import router as setup_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="OneStoreSolution",
    description="Multi-store retail management system",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(setup_router)

@app.get("/")
def root():
    return {
        "application": "OneStoreSolution",
        "status": "running",
    }




@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


@app.get("/database-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        value = result.scalar()

    return {
        "database": "connected",
        "test": value,
    }


@app.get("/database-tables")
def database_tables():
    inspector = inspect(engine)

    return {
        "tables": inspector.get_table_names()
    }
