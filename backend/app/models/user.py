"""
User Model
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    LOAN_OFFICER = "loan_officer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Personal Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    ghana_card_number = Column(String(20), unique=True, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    
    # Address
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    
    # Role & Status
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Credit Profile
    credit_score = Column(Integer, nullable=True)
    trust_score = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    loan_applications = relationship("LoanApplication", back_populates="user", foreign_keys="LoanApplication.user_id")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
