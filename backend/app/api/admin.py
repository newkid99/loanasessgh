"""
Admin API Routes - Loan Officer Dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import User, UserRole
from app.models.loan import LoanApplication, LoanStatus, RiskGrade
from app.services.scoring import scoring_engine

router = APIRouter()

# ============================================================
# Schemas
# ============================================================

class ApplicationReview(BaseModel):
    officer_notes: Optional[str] = None

class ApplicationDecision(BaseModel):
    decision: str  # "approve", "reject", "request_docs"
    amount_approved: Optional[float] = None
    rejection_reason: Optional[str] = None
    officer_notes: Optional[str] = None

class DashboardStats(BaseModel):
    total_applications: int
    pending_review: int
    approved_today: int
    rejected_today: int
    total_disbursed: float
    average_approval_rate: float
    average_loan_amount: float

# ============================================================
# Routes
# ============================================================

@router.get("/dashboard", response_model=DashboardStats)
async def get_admin_dashboard(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get admin dashboard statistics
    """
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    # Total applications
    total_result = await db.execute(select(func.count(LoanApplication.id)))
    total_applications = total_result.scalar() or 0
    
    # Pending review
    pending_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(LoanApplication.status.in_([LoanStatus.SUBMITTED, LoanStatus.UNDER_REVIEW]))
    )
    pending_review = pending_result.scalar() or 0
    
    # Approved today
    approved_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(and_(
            LoanApplication.status == LoanStatus.APPROVED,
            LoanApplication.decided_at >= today_start
        ))
    )
    approved_today = approved_result.scalar() or 0
    
    # Rejected today
    rejected_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(and_(
            LoanApplication.status == LoanStatus.REJECTED,
            LoanApplication.decided_at >= today_start
        ))
    )
    rejected_today = rejected_result.scalar() or 0
    
    # Total disbursed
    disbursed_result = await db.execute(
        select(func.sum(LoanApplication.amount_approved))
        .where(LoanApplication.status.in_([LoanStatus.DISBURSED, LoanStatus.ACTIVE, LoanStatus.COMPLETED]))
    )
    total_disbursed = disbursed_result.scalar() or 0
    
    # Average approval rate
    decided_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(LoanApplication.status.in_([LoanStatus.APPROVED, LoanStatus.REJECTED, LoanStatus.DISBURSED, LoanStatus.ACTIVE, LoanStatus.COMPLETED]))
    )
    total_decided = decided_result.scalar() or 1
    
    all_approved_result = await db.execute(
        select(func.count(LoanApplication.id))
        .where(LoanApplication.status.in_([LoanStatus.APPROVED, LoanStatus.DISBURSED, LoanStatus.ACTIVE, LoanStatus.COMPLETED]))
    )
    all_approved = all_approved_result.scalar() or 0
    
    # Average loan amount
    avg_result = await db.execute(
        select(func.avg(LoanApplication.amount_requested))
    )
    avg_amount = avg_result.scalar() or 0
    
    return DashboardStats(
        total_applications=total_applications,
        pending_review=pending_review,
        approved_today=approved_today,
        rejected_today=rejected_today,
        total_disbursed=float(total_disbursed),
        average_approval_rate=round(all_approved / total_decided * 100, 1) if total_decided > 0 else 0,
        average_loan_amount=round(float(avg_amount), 2) if avg_amount else 0
    )

@router.get("/applications")
async def get_all_applications(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all loan applications for review
    """
    query = select(LoanApplication).order_by(LoanApplication.created_at.desc())
    
    if status:
        try:
            status_enum = LoanStatus(status)
            query = query.where(LoanApplication.status == status_enum)
        except ValueError:
            pass
    
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    applications = result.scalars().all()
    
    # Get user info for each application
    response = []
    for app in applications:
        user_result = await db.execute(select(User).where(User.id == app.user_id))
        user = user_result.scalar_one_or_none()
        
        response.append({
            "id": str(app.id),
            "application_number": app.application_number,
            "user": {
                "id": str(user.id) if user else None,
                "name": user.full_name if user else "Unknown",
                "email": user.email if user else None,
                "phone": user.phone if user else None
            },
            "amount_requested": app.amount_requested,
            "amount_approved": app.amount_approved,
            "term_months": app.term_months,
            "purpose": app.purpose.value,
            "status": app.status.value,
            "risk_grade": app.risk_grade.value if app.risk_grade else None,
            "approval_probability": app.approval_probability,
            "interest_rate": app.interest_rate,
            "created_at": app.created_at.isoformat(),
            "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None
        })
    
    return response

@router.get("/applications/{application_id}")
async def get_application_detail(
    application_id: str,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed application for review
    """
    result = await db.execute(
        select(LoanApplication).where(LoanApplication.id == application_id)
    )
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Get user
    user_result = await db.execute(select(User).where(User.id == app.user_id))
    user = user_result.scalar_one_or_none()
    
    return {
        "id": str(app.id),
        "application_number": app.application_number,
        "status": app.status.value,
        "user": {
            "id": str(user.id) if user else None,
            "name": user.full_name if user else "Unknown",
            "email": user.email if user else None,
            "phone": user.phone if user else None,
            "ghana_card": user.ghana_card_number if user else None,
            "credit_score": user.credit_score if user else None
        },
        "loan_details": {
            "amount_requested": app.amount_requested,
            "amount_approved": app.amount_approved,
            "term_months": app.term_months,
            "purpose": app.purpose.value,
            "purpose_description": app.purpose_description,
            "interest_rate": app.interest_rate,
            "monthly_payment": app.monthly_payment
        },
        "financial_info": {
            "monthly_income": app.monthly_income,
            "monthly_expenses": app.monthly_expenses,
            "employment_status": app.employment_status,
            "employer_name": app.employer_name,
            "employment_years": app.employment_length_years,
            "existing_debt": app.existing_debt,
            "dti": app.debt_to_income,
            "credit_utilization": app.credit_utilization
        },
        "ai_assessment": {
            "approval_probability": app.approval_probability,
            "default_probability": app.default_probability,
            "risk_grade": app.risk_grade.value if app.risk_grade else None,
            "risk_factors": app.risk_factors,
            "credit_coach": app.credit_coach_recommendations
        },
        "alternative_scores": {
            "momo_trust_score": app.momo_trust_score,
            "stability_score": app.stability_score,
            "social_trust_score": app.social_trust_score
        },
        "officer_notes": app.officer_notes,
        "rejection_reason": app.rejection_reason,
        "timestamps": {
            "created_at": app.created_at.isoformat(),
            "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
            "reviewed_at": app.reviewed_at.isoformat() if app.reviewed_at else None,
            "decided_at": app.decided_at.isoformat() if app.decided_at else None
        }
    }

@router.post("/applications/{application_id}/decide")
async def decide_application(
    application_id: str,
    decision: ApplicationDecision,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Make a decision on an application
    """
    result = await db.execute(
        select(LoanApplication).where(LoanApplication.id == application_id)
    )
    app = result.scalar_one_or_none()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if app.status not in [LoanStatus.SUBMITTED, LoanStatus.UNDER_REVIEW]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application cannot be decided in current status"
        )
    
    # Update based on decision
    if decision.decision == "approve":
        app.status = LoanStatus.APPROVED
        app.amount_approved = decision.amount_approved or app.amount_requested
    elif decision.decision == "reject":
        app.status = LoanStatus.REJECTED
        app.rejection_reason = decision.rejection_reason
    elif decision.decision == "request_docs":
        app.status = LoanStatus.DOCUMENTS_REQUESTED
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid decision"
        )
    
    app.officer_notes = decision.officer_notes
    app.assigned_officer_id = current_user.id
    app.reviewed_at = datetime.utcnow()
    app.decided_at = datetime.utcnow()
    
    return {
        "message": f"Application {decision.decision}d successfully",
        "application_id": str(app.id),
        "new_status": app.status.value
    }

@router.get("/analytics")
async def get_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get analytics data for charts
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Applications by status
    status_result = await db.execute(
        select(LoanApplication.status, func.count(LoanApplication.id))
        .where(LoanApplication.created_at >= start_date)
        .group_by(LoanApplication.status)
    )
    status_counts = {row[0].value: row[1] for row in status_result.all()}
    
    # Applications by risk grade
    grade_result = await db.execute(
        select(LoanApplication.risk_grade, func.count(LoanApplication.id))
        .where(LoanApplication.risk_grade.isnot(None))
        .group_by(LoanApplication.risk_grade)
    )
    grade_counts = {row[0].value: row[1] for row in grade_result.all()}
    
    # Applications by purpose
    purpose_result = await db.execute(
        select(LoanApplication.purpose, func.count(LoanApplication.id))
        .group_by(LoanApplication.purpose)
    )
    purpose_counts = {row[0].value: row[1] for row in purpose_result.all()}
    
    # Average amounts by grade
    avg_by_grade = await db.execute(
        select(LoanApplication.risk_grade, func.avg(LoanApplication.amount_requested))
        .where(LoanApplication.risk_grade.isnot(None))
        .group_by(LoanApplication.risk_grade)
    )
    avg_amounts = {row[0].value: round(float(row[1]), 2) for row in avg_by_grade.all()}
    
    return {
        "period_days": days,
        "by_status": status_counts,
        "by_risk_grade": grade_counts,
        "by_purpose": purpose_counts,
        "avg_amount_by_grade": avg_amounts,
        "grr_current": scoring_engine.GRR_CURRENT
    }

@router.get("/users")
async def get_users(
    role: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of users (admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    query = select(User).order_by(User.created_at.desc()).limit(limit)
    
    if role:
        try:
            role_enum = UserRole(role)
            query = query.where(User.role == role_enum)
        except ValueError:
            pass
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.full_name,
            "phone": u.phone,
            "role": u.role.value,
            "is_active": u.is_active,
            "credit_score": u.credit_score,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]
