"""
Database Seeding Script
"""

import hashlib
from sqlalchemy import select
from app.core.database import async_session
from app.models.user import User, UserRole
import uuid


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


async def seed_database():
    async with async_session() as session:
        # Admin
        result = await session.execute(
            select(User).where(User.email == "admin@loanassess.gh")
        )
        if not result.scalar_one_or_none():
            session.add(User(
                id=uuid.uuid4(),
                email="admin@loanassess.gh",
                phone="0244000001",
                password_hash=hash_password("Admin123!"),
                first_name="Admin",
                last_name="User",
                role=UserRole.ADMIN,
                is_active=True
            ))
            print("✅ Admin created")

        # Demo user
        result = await session.execute(
            select(User).where(User.email == "demo@example.com")
        )
        if not result.scalar_one_or_none():
            session.add(User(
                id=uuid.uuid4(),
                email="demo@example.com",
                phone="0244123456",
                password_hash=hash_password("password123"),
                first_name="Kofi",
                last_name="Mensah",
                role=UserRole.CUSTOMER,
                is_active=True,
                credit_score=680
            ))
            print("✅ Demo user created")

        # Loan officer
        result = await session.execute(
            select(User).where(User.email == "officer@loanassess.gh")
        )
        if not result.scalar_one_or_none():
            session.add(User(
                id=uuid.uuid4(),
                email="officer@loanassess.gh",
                phone="0244000002",
                password_hash=hash_password("Officer123!"),
                first_name="Ama",
                last_name="Owusu",
                role=UserRole.LOAN_OFFICER,
                is_active=True
            ))
            print("✅ Loan officer created")

        await session.commit()
        print("✅ Seeding complete!")
