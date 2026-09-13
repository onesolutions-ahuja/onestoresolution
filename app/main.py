from fastapi import FastAPI

app = FastAPI(
    title="OneStoreSolution",
    description="Multi-store retail management system",
    version="0.1.0",
)


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
