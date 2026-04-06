"""
Users API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

# ============================================================
# Schemas
# ============================================================

class UserProfile(BaseModel):
    id: str
    email: str
    phone: str
    first_name: str
    last_name: str
    ghana_card_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    role: str
    is_verified: bool
    credit_score: Optional[int] = None
    trust_score: Optional[float] = None
    created_at: datetime

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    date_of_birth: Optional[datetime] = None

class CreditProfile(BaseModel):
    credit_score: Optional[int]
    trust_score: Optional[float]
    risk_grade: str
    total_applications: int
    approved_applications: int
    active_loans: int

# ============================================================
# Routes
# ============================================================

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile
    """
    return UserProfile(
        id=str(current_user.id),
        email=current_user.email,
        phone=current_user.phone,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        ghana_card_number=current_user.ghana_card_number,
        address=current_user.address,
        city=current_user.city,
        region=current_user.region,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        credit_score=current_user.credit_score,
        trust_score=current_user.trust_score,
        created_at=current_user.created_at
    )

@router.put("/me", response_model=UserProfile)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's profile
    """
    # Update fields if provided
    if update_data.first_name:
        current_user.first_name = update_data.first_name
    if update_data.last_name:
        current_user.last_name = update_data.last_name
    if update_data.phone:
        current_user.phone = update_data.phone
    if update_data.address:
        current_user.address = update_data.address
    if update_data.city:
        current_user.city = update_data.city
    if update_data.region:
        current_user.region = update_data.region
    if update_data.date_of_birth:
        current_user.date_of_birth = update_data.date_of_birth
    
    current_user.updated_at = datetime.utcnow()
    
    return UserProfile(
        id=str(current_user.id),
        email=current_user.email,
        phone=current_user.phone,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        ghana_card_number=current_user.ghana_card_number,
        address=current_user.address,
        city=current_user.city,
        region=current_user.region,
        role=current_user.role.value,
        is_verified=current_user.is_verified,
        credit_score=current_user.credit_score,
        trust_score=current_user.trust_score,
        created_at=current_user.created_at
    )

@router.get("/me/credit-profile", response_model=CreditProfile)
async def get_credit_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's credit profile summary
    """
    from sqlalchemy import select, func
    from app.models.loan import LoanApplication, LoanStatus
    
    # Count applications
    total_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(LoanApplication.user_id == current_user.id)
    )
    total_applications = total_result.scalar() or 0
    
    # Count approved
    approved_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(LoanApplication.user_id == current_user.id)
        .where(LoanApplication.status.in_([LoanStatus.APPROVED, LoanStatus.DISBURSED, LoanStatus.ACTIVE, LoanStatus.COMPLETED]))
    )
    approved_applications = approved_result.scalar() or 0
    
    # Count active loans
    active_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(LoanApplication.user_id == current_user.id)
        .where(LoanApplication.status == LoanStatus.ACTIVE)
    )
    active_loans = active_result.scalar() or 0
    
    # Calculate risk grade
    from app.services.scoring import scoring_engine
    credit_score = current_user.credit_score or 650
    risk_grade = scoring_engine.get_risk_grade(credit_score)
    
    return CreditProfile(
        credit_score=current_user.credit_score,
        trust_score=current_user.trust_score,
        risk_grade=risk_grade,
        total_applications=total_applications,
        approved_applications=approved_applications,
        active_loans=active_loans
    )

@router.get("/me/dashboard")
async def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user dashboard data
    """
    from sqlalchemy import select
    from app.models.loan import LoanApplication, LoanStatus
    from app.services.scoring import scoring_engine
    
    # Get recent applications
    result = await db.execute(
        select(LoanApplication)
        .where(LoanApplication.user_id == current_user.id)
        .order_by(LoanApplication.created_at.desc())
        .limit(5)
    )
    recent_applications = result.scalars().all()
    
    # Get active loan
    active_result = await db.execute(
        select(LoanApplication)
        .where(LoanApplication.user_id == current_user.id)
        .where(LoanApplication.status == LoanStatus.ACTIVE)
        .limit(1)
    )
    active_loan = active_result.scalar_one_or_none()
    
    # Credit info
    credit_score = current_user.credit_score or 650
    risk_grade = scoring_engine.get_risk_grade(credit_score)
    
    return {
        "user": {
            "name": current_user.full_name,
            "credit_score": credit_score,
            "risk_grade": risk_grade,
            "trust_score": current_user.trust_score
        },
        "active_loan": {
            "id": str(active_loan.id) if active_loan else None,
            "amount": active_loan.amount_approved if active_loan else None,
            "monthly_payment": active_loan.monthly_payment if active_loan else None,
            "status": active_loan.status.value if active_loan else None
        } if active_loan else None,
        "recent_applications": [
            {
                "id": str(app.id),
                "application_number": app.application_number,
                "amount": app.amount_requested,
                "status": app.status.value,
                "created_at": app.created_at.isoformat()
            }
            for app in recent_applications
        ],
        "grr_rate": scoring_engine.GRR_CURRENT
    }
