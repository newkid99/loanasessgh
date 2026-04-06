"""
Loan Application Model
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Float, Integer, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base

class LoanStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    DOCUMENTS_REQUESTED = "documents_requested"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"
    ACTIVE = "active"
    COMPLETED = "completed"
    DEFAULTED = "defaulted"

class LoanPurpose(str, enum.Enum):
    BUSINESS_WORKING_CAPITAL = "business_working_capital"
    DEBT_CONSOLIDATION = "debt_consolidation"
    HOME_IMPROVEMENT = "home_improvement"
    EDUCATION = "education"
    MEDICAL = "medical"
    VEHICLE = "vehicle"
    WEDDING_FUNERAL = "wedding_funeral"
    AGRICULTURE = "agriculture"
    PERSONAL_EMERGENCY = "personal_emergency"
    OTHER = "other"

class RiskGrade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    E = "E"
    F = "F"
    G = "G"

class LoanApplication(Base):
    __tablename__ = "loan_applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_number = Column(String(20), unique=True, index=True)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_officer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Loan Details
    amount_requested = Column(Float, nullable=False)
    amount_approved = Column(Float, nullable=True)
    term_months = Column(Integer, nullable=False)
    purpose = Column(Enum(LoanPurpose), nullable=False)
    purpose_description = Column(Text, nullable=True)
    
    # Interest Rates
    grr_rate = Column(Float, nullable=True)  # GRR at time of application
    risk_premium = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)
    monthly_payment = Column(Float, nullable=True)
    
    # ML Scoring Results
    approval_probability = Column(Float, nullable=True)
    default_probability = Column(Float, nullable=True)
    risk_grade = Column(Enum(RiskGrade), nullable=True)
    risk_factors = Column(JSON, nullable=True)  # Detailed breakdown
    credit_coach_recommendations = Column(JSON, nullable=True)
    
    # Financial Information
    monthly_income = Column(Float, nullable=True)
    monthly_expenses = Column(Float, nullable=True)
    employment_status = Column(String(50), nullable=True)
    employer_name = Column(String(255), nullable=True)
    employment_length_years = Column(Float, nullable=True)
    
    # Credit Information
    existing_debt = Column(Float, nullable=True)
    debt_to_income = Column(Float, nullable=True)
    credit_utilization = Column(Float, nullable=True)
    delinquencies_2yrs = Column(Integer, default=0)
    open_accounts = Column(Integer, nullable=True)
    
    # Alternative Data Scores
    momo_trust_score = Column(Float, nullable=True)
    stability_score = Column(Float, nullable=True)
    social_trust_score = Column(Float, nullable=True)
    
    # Status
    status = Column(Enum(LoanStatus), default=LoanStatus.DRAFT)
    rejection_reason = Column(Text, nullable=True)
    officer_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    decided_at = Column(DateTime, nullable=True)
    disbursed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="loan_applications", foreign_keys=[user_id])
    officer = relationship("User", foreign_keys=[assigned_officer_id])
    documents = relationship("Document", back_populates="loan_application")
    
    def generate_application_number(self):
        """Generate unique application number"""
        import random
        year = datetime.utcnow().strftime("%Y")
        random_num = random.randint(1000, 9999)
        return f"LA-{year}-{random_num}"


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    loan_application_id = Column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), nullable=False)
    
    document_type = Column(String(50), nullable=False)  # ghana_card, payslip, bank_statement, etc.
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    
    # Verification
    is_verified = Column(Boolean, default=False)
    verified_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    loan_application = relationship("LoanApplication", back_populates="documents")
