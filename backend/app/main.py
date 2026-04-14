from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import empty routers
from app.routers import auth, users, homes, sensors, alerts, contacts, device

app = FastAPI(
    title="S.A.G.E Raksha API",
    version="1.0.0",
    description="Production backend for S.A.G.E Raksha fall detection system"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev. In prod: restrict to explicit origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(homes.router, prefix="/api/v1/homes", tags=["Homes"])
app.include_router(sensors.router, prefix="/api/v1/homes", tags=["Sensors"])
app.include_router(alerts.router, prefix="/api/v1/homes", tags=["Alerts"])
app.include_router(contacts.router, prefix="/api/v1/homes", tags=["Emergency Contacts"])
app.include_router(device.router, prefix="/api/v1/device", tags=["Device"])

@app.get("/")
async def root():
    return {"message": "S.A.G.E Raksha API is running", "docs_url": "/docs"}
