"""
LoanAssess Ghana - FastAPI Backend
===================================
AI-Powered Loan Assessment Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import auth, users, loans, scoring, admin
from app.core.config import settings
from app.core.database import create_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting LoanAssess Ghana API...")
    await create_tables()
    print("✅ Database tables ready")
    yield
    # Shutdown
    print("👋 Shutting down...")

app = FastAPI(
    title="LoanAssess Ghana API",
    description="AI-Powered Loan Assessment Platform for Ghana",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(loans.router, prefix="/api/loans", tags=["Loans"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["Credit Scoring"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "🇬🇭 LoanAssess Ghana API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "loanassess-api"}
