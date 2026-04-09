"""
Database Seeding Script
"""

import hashlib
from sqlalchemy import select, update
from app.core.database import async_session
from app.models.user import User, UserRole
import uuid


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


async def seed_database():
    async with async_session() as session:
        # Check if admin exists
        result = await session.execute(
            select(User).where(User.email == "admin@loanassess.gh")
        )
        admin = result.scalar_one_or_none()
        
        if not admin:
            # Create admin user
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
        else:
            # UPDATE existing admin to have admin role
            if admin.role != UserRole.ADMIN:
                admin.role = UserRole.ADMIN
                print("✅ Admin role updated")
            else:
                print("ℹ️ Admin already has correct role")

        # Check if demo user exists
        result = await session.execute(
            select(User).where(User.email == "demo@example.com")
        )
        demo = result.scalar_one_or_none()
        
        if not demo:
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
        else:
            print("ℹ️ Demo user exists")

        # Check if loan officer exists
        result = await session.execute(
            select(User).where(User.email == "officer@loanassess.gh")
        )
        officer = result.scalar_one_or_none()
        
        if not officer:
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
        else:
            print("ℹ️ Loan officer exists")

        await session.commit()
        print("✅ Seeding complete!")
