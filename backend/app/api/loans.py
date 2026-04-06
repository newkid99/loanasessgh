"""
Loans API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import random

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.loan import LoanApplication, LoanStatus, LoanPurpose, RiskGrade
from app.services.scoring import scoring_engine

router = APIRouter()

# ============================================================
# Schemas
# ============================================================

class LoanApplicationCreate(BaseModel):
    amount_requested: float = Field(..., ge=1000, le=500000)
    term_months: int = Field(..., ge=3, le=60)
    purpose: LoanPurpose
    purpose_description: Optional[str] = None
    monthly_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)
    employment_status: str
    employer_name: Optional[str] = None
    employment_length_years: float = Field(..., ge=0)
    existing_debt: float = Field(default=0, ge=0)
    credit_utilization: float = Field(default=0, ge=0, le=100)
    delinquencies_2yrs: int = Field(default=0, ge=0)
    open_accounts: int = Field(default=0, ge=0)

class LoanApplicationResponse(BaseModel):
    id: str
    application_number: str
    amount_requested: float
    amount_approved: Optional[float]
    term_months: int
    purpose: str
    status: str
    interest_rate: Optional[float]
    monthly_payment: Optional[float]
    approval_probability: Optional[float]
    risk_grade: Optional[str]
    created_at: datetime
    submitted_at: Optional[datetime]

class LoanAssessmentResult(BaseModel):
    application_id: str
    approval_probability: float
    default_probability: float
    risk_grade: str
    interest_rate: float
    monthly_payment: float
    grr_rate: float
    risk_premium: float
    risk_factors: List[dict]
    positive_factors: List[dict]
    credit_coach: dict
    affordability: dict
    recommendation: str

# ============================================================
# Routes
# ============================================================

@router.post("/", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_loan_application(
    loan_data: LoanApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new loan application
    """
    # Generate application number
    year = datetime.utcnow().strftime("%Y")
    random_num = random.randint(1000, 9999)
    app_number = f"LA-{year}-{random_num}"
    
    # Calculate DTI
    dti = 0
    if loan_data.monthly_income > 0:
        dti = ((loan_data.existing_debt / 12) / loan_data.monthly_income) * 100
    
    # Create application
    application = LoanApplication(
        application_number=app_number,
        user_id=current_user.id,
        amount_requested=loan_data.amount_requested,
        term_months=loan_data.term_months,
        purpose=loan_data.purpose,
        purpose_description=loan_data.purpose_description,
        monthly_income=loan_data.monthly_income,
        monthly_expenses=loan_data.monthly_expenses,
        employment_status=loan_data.employment_status,
        employer_name=loan_data.employer_name,
        employment_length_years=loan_data.employment_length_years,
        existing_debt=loan_data.existing_debt,
        debt_to_income=dti,
        credit_utilization=loan_data.credit_utilization,
        delinquencies_2yrs=loan_data.delinquencies_2yrs,
        open_accounts=loan_data.open_accounts,
        grr_rate=scoring_engine.GRR_CURRENT,
        status=LoanStatus.DRAFT
    )
    
    db.add(application)
    await db.flush()
    
    return LoanApplicationResponse(
        id=str(application.id),
        application_number=application.application_number,
        amount_requested=application.amount_requested,
        amount_approved=application.amount_approved,
        term_months=application.term_months,
        purpose=application.purpose.value,
        status=application.status.value,
        interest_rate=application.interest_rate,
        monthly_payment=application.monthly_payment,
        approval_probability=application.approval_probability,
        risk_grade=application.risk_grade.value if application.risk_grade else None,
        created_at=application.created_at,
        submitted_at=application.submitted_at
    )

@router.get("/", response_model=List[LoanApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all loan applications for current user
    """
    result = await db.execute(
        select(LoanApplication)
        .where(LoanApplication.user_id == current_user.id)
        .order_by(LoanApplication.created_at.desc())
    )
    applications = result.scalars().all()
    
    return [
        LoanApplicationResponse(
            id=str(app.id),
            application_number=app.application_number,
            amount_requested=app.amount_requested,
            amount_approved=app.amount_approved,
            term_months=app.term_months,
            purpose=app.purpose.value,
            status=app.status.value,
            interest_rate=app.interest_rate,
            monthly_payment=app.monthly_payment,
            approval_probability=app.approval_probability,
            risk_grade=app.risk_grade.value if app.risk_grade else None,
            created_at=app.created_at,
            submitted_at=app.submitted_at
        )
        for app in applications
    ]

@router.get("/{application_id}", response_model=LoanApplicationResponse)
async def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific loan application
    """
    result = await db.execute(
        select(LoanApplication)
        .where(LoanApplication.id == application_id)
        .where(LoanApplication.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return LoanApplicationResponse(
        id=str(application.id),
        application_number=application.application_number,
        amount_requested=application.amount_requested,
        amount_approved=application.amount_approved,
        term_months=application.term_months,
        purpose=application.purpose.value,
        status=application.status.value,
        interest_rate=application.interest_rate,
        monthly_payment=application.monthly_payment,
        approval_probability=application.approval_probability,
        risk_grade=application.risk_grade.value if application.risk_grade else None,
        created_at=application.created_at,
        submitted_at=application.submitted_at
    )

@router.post("/{application_id}/submit", response_model=LoanAssessmentResult)
async def submit_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit application for assessment and get instant decision
    """
    # Get application
    result = await db.execute(
        select(LoanApplication)
        .where(LoanApplication.id == application_id)
        .where(LoanApplication.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status not in [LoanStatus.DRAFT]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application already submitted"
        )
    
    # Prepare data for scoring
    scoring_data = {
        "loan_amount": application.amount_requested,
        "term": application.term_months,
        "monthly_income": application.monthly_income,
        "monthly_expenses": application.monthly_expenses,
        "employment_years": application.employment_length_years,
        "dti": application.debt_to_income or 0,
        "credit_utilization": application.credit_utilization or 0,
        "delinquencies": application.delinquencies_2yrs or 0,
        "open_accounts": application.open_accounts or 0,
    }
    
    # Run AI assessment
    scoring_result = scoring_engine.assess(scoring_data)
    
    # Update application with results
    application.approval_probability = scoring_result.approval_probability
    application.default_probability = scoring_result.default_probability
    application.risk_grade = RiskGrade(scoring_result.risk_grade)
    application.interest_rate = scoring_result.interest_rate
    application.risk_premium = scoring_result.risk_premium
    application.monthly_payment = scoring_result.monthly_payment
    application.risk_factors = scoring_result.risk_factors
    application.credit_coach_recommendations = scoring_result.credit_coach
    
    # Update status
    application.status = LoanStatus.SUBMITTED
    application.submitted_at = datetime.utcnow()
    
    # Auto-decision based on probability
    if scoring_result.approval_probability >= 0.7 and scoring_result.affordability["can_afford"]:
        recommendation = "PRE-APPROVED"
        application.status = LoanStatus.APPROVED
        application.amount_approved = application.amount_requested
        application.decided_at = datetime.utcnow()
    elif scoring_result.approval_probability >= 0.4:
        recommendation = "UNDER_REVIEW"
        application.status = LoanStatus.UNDER_REVIEW
    else:
        recommendation = "CREDIT_COACHING"
    
    # Update user's credit score
    credit_score = scoring_engine.calculate_credit_score(scoring_data)
    current_user.credit_score = credit_score
    
    return LoanAssessmentResult(
        application_id=str(application.id),
        approval_probability=scoring_result.approval_probability,
        default_probability=scoring_result.default_probability,
        risk_grade=scoring_result.risk_grade,
        interest_rate=scoring_result.interest_rate,
        monthly_payment=scoring_result.monthly_payment,
        grr_rate=scoring_engine.GRR_CURRENT,
        risk_premium=scoring_result.risk_premium,
        risk_factors=scoring_result.risk_factors,
        positive_factors=scoring_result.positive_factors,
        credit_coach=scoring_result.credit_coach,
        affordability=scoring_result.affordability,
        recommendation=recommendation
    )

@router.get("/{application_id}/assessment", response_model=LoanAssessmentResult)
async def get_assessment(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the assessment results for an application
    """
    result = await db.execute(
        select(LoanApplication)
        .where(LoanApplication.id == application_id)
        .where(LoanApplication.user_id == current_user.id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status == LoanStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application not yet submitted"
        )
    
    # Determine recommendation
    if application.status == LoanStatus.APPROVED:
        recommendation = "APPROVED"
    elif application.status == LoanStatus.REJECTED:
        recommendation = "REJECTED"
    elif application.approval_probability and application.approval_probability >= 0.4:
        recommendation = "UNDER_REVIEW"
    else:
        recommendation = "CREDIT_COACHING"
    
    return LoanAssessmentResult(
        application_id=str(application.id),
        approval_probability=application.approval_probability or 0,
        default_probability=application.default_probability or 0,
        risk_grade=application.risk_grade.value if application.risk_grade else "C",
        interest_rate=application.interest_rate or 20,
        monthly_payment=application.monthly_payment or 0,
        grr_rate=application.grr_rate or scoring_engine.GRR_CURRENT,
        risk_premium=application.risk_premium or 10,
        risk_factors=application.risk_factors or [],
        positive_factors=[],
        credit_coach=application.credit_coach_recommendations or {},
        affordability={
            "status": "unknown",
            "can_afford": True,
            "message": "Assessment completed"
        },
        recommendation=recommendation
    )
