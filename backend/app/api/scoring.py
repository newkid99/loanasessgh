"""
Scoring API Routes - Public Assessment Endpoint
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, List

from app.services.scoring import scoring_engine

router = APIRouter()

# ============================================================
# Schemas
# ============================================================

class QuickAssessmentRequest(BaseModel):
    """Quick assessment without authentication"""
    loan_amount: float = Field(..., ge=1000, le=500000)
    term_months: int = Field(..., ge=3, le=60)
    monthly_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(default=0, ge=0)
    credit_score: Optional[int] = Field(default=None, ge=300, le=850)
    employment_years: float = Field(default=0, ge=0)
    dti: float = Field(default=0, ge=0, le=100)
    credit_utilization: float = Field(default=0, ge=0, le=100)
    delinquencies: int = Field(default=0, ge=0)
    open_accounts: int = Field(default=0, ge=0)

class QuickAssessmentResponse(BaseModel):
    approval_probability: float
    default_probability: float
    risk_grade: str
    credit_score: int
    interest_rate: float
    grr_rate: float
    risk_premium: float
    monthly_payment: float
    total_interest: float
    total_repayment: float
    risk_factors: List[dict]
    positive_factors: List[dict]
    credit_coach: dict
    affordability: dict

class GRRInfo(BaseModel):
    current_rate: float
    effective_date: str
    source: str
    history: List[dict]

# ============================================================
# Routes
# ============================================================

@router.post("/assess", response_model=QuickAssessmentResponse)
async def quick_assessment(request: QuickAssessmentRequest):
    """
    Quick loan assessment without authentication.
    This is the public endpoint for the loan calculator.
    """
    # Prepare data
    data = {
        "loan_amount": request.loan_amount,
        "term": request.term_months,
        "monthly_income": request.monthly_income,
        "monthly_expenses": request.monthly_expenses,
        "employment_years": request.employment_years,
        "dti": request.dti,
        "credit_utilization": request.credit_utilization,
        "delinquencies": request.delinquencies,
        "open_accounts": request.open_accounts,
    }
    
    # If credit score provided, use it; otherwise calculate
    if request.credit_score:
        data["credit_score"] = request.credit_score
    
    # Run assessment
    result = scoring_engine.assess(data)
    
    # Calculate totals
    total_repayment = result.monthly_payment * request.term_months
    total_interest = total_repayment - request.loan_amount
    
    # Get credit score used
    credit_score = data.get("credit_score") or scoring_engine.calculate_credit_score(data)
    
    return QuickAssessmentResponse(
        approval_probability=result.approval_probability,
        default_probability=result.default_probability,
        risk_grade=result.risk_grade,
        credit_score=credit_score,
        interest_rate=result.interest_rate,
        grr_rate=scoring_engine.GRR_CURRENT,
        risk_premium=result.risk_premium,
        monthly_payment=result.monthly_payment,
        total_interest=round(total_interest, 2),
        total_repayment=round(total_repayment, 2),
        risk_factors=result.risk_factors,
        positive_factors=result.positive_factors,
        credit_coach=result.credit_coach,
        affordability=result.affordability
    )

@router.get("/grr", response_model=GRRInfo)
async def get_grr_info():
    """
    Get current Ghana Reference Rate information
    """
    history = [
        {"month": "2025-01", "rate": 29.72},
        {"month": "2025-02", "rate": 29.96},
        {"month": "2025-03", "rate": 27.50},
        {"month": "2025-04", "rate": 26.20},
        {"month": "2025-05", "rate": 23.99},
        {"month": "2025-06", "rate": 22.50},
        {"month": "2025-07", "rate": 21.00},
        {"month": "2025-08", "rate": 19.67},
        {"month": "2025-09", "rate": 19.86},
        {"month": "2025-10", "rate": 17.86},
        {"month": "2025-11", "rate": 17.93},
        {"month": "2025-12", "rate": 15.90},
        {"month": "2026-01", "rate": 15.68},
        {"month": "2026-02", "rate": 14.58},
        {"month": "2026-03", "rate": 11.71},
    ]
    
    return GRRInfo(
        current_rate=scoring_engine.GRR_CURRENT,
        effective_date="2026-03-04",
        source="Ghana Association of Banks",
        history=history
    )

@router.get("/risk-premiums")
async def get_risk_premiums():
    """
    Get risk premium table by credit score
    """
    return {
        "grr_base": scoring_engine.GRR_CURRENT,
        "premiums": [
            {"grade": "A", "score_range": "750-850", "premium": 5.0, "rate": scoring_engine.GRR_CURRENT + 5.0},
            {"grade": "B", "score_range": "700-749", "premium": 7.0, "rate": scoring_engine.GRR_CURRENT + 7.0},
            {"grade": "C", "score_range": "670-699", "premium": 9.0, "rate": scoring_engine.GRR_CURRENT + 9.0},
            {"grade": "D", "score_range": "640-669", "premium": 11.0, "rate": scoring_engine.GRR_CURRENT + 11.0},
            {"grade": "E", "score_range": "600-639", "premium": 14.0, "rate": scoring_engine.GRR_CURRENT + 14.0},
            {"grade": "F", "score_range": "560-599", "premium": 17.0, "rate": scoring_engine.GRR_CURRENT + 17.0},
            {"grade": "G", "score_range": "300-559", "premium": 20.0, "rate": scoring_engine.GRR_CURRENT + 20.0},
        ]
    }

@router.post("/credit-coach")
async def get_credit_coaching(request: QuickAssessmentRequest):
    """
    Get detailed credit coaching recommendations
    """
    data = {
        "loan_amount": request.loan_amount,
        "term": request.term_months,
        "monthly_income": request.monthly_income,
        "monthly_expenses": request.monthly_expenses,
        "employment_years": request.employment_years,
        "dti": request.dti,
        "credit_utilization": request.credit_utilization,
        "delinquencies": request.delinquencies,
        "open_accounts": request.open_accounts,
    }
    
    if request.credit_score:
        data["credit_score"] = request.credit_score
    
    result = scoring_engine.assess(data)
    
    return {
        "current_assessment": {
            "approval_probability": result.approval_probability,
            "risk_grade": result.risk_grade,
            "credit_score": data.get("credit_score") or scoring_engine.calculate_credit_score(data)
        },
        "credit_coach": result.credit_coach,
        "risk_factors": result.risk_factors,
        "improvement_potential": {
            "if_all_fixed": {
                "projected_score": min(result.credit_coach["target_score"] + 50, 800),
                "projected_rate": scoring_engine.GRR_CURRENT + 7,
                "projected_approval": min(result.approval_probability + 0.25, 0.95)
            }
        }
    }
