"""
Database Seeding Script
Runs on startup to ensure default users exist
"""

import asyncio
import hashlib
from sqlalchemy import select, update
from app.core.database import async_session, engine, Base
from app.models.user import User, UserRole
import uuid


def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


async def seed_database():
    """Create default users if they don't exist"""
    
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        # Check if admin exists
        result = await session.execute(
            select(User).where(User.email == "admin@loanassess.gh")
        )
        admin = result.scalar_one_or_none()
        
        if not admin:
            # Create admin user
            admin = User(
                id=uuid.uuid4(),
                email="admin@loanassess.gh",
                phone="0244000001",
                password_hash=hash_password("Admin123!"),
                first_name="Admin",
                last_name="User",
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin)
            print("✅ Admin user created: admin@loanassess.gh")
        else:
            # Ensure admin has admin role
            if admin.role != UserRole.ADMIN:
                admin.role = UserRole.ADMIN
                print("✅ Updated admin role")
            else:
                print("ℹ️ Admin user already exists")
        
        # Check if demo user exists
        result = await session.execute(
            select(User).where(User.email == "demo@example.com")
        )
        demo = result.scalar_one_or_none()
        
        if not demo:
            # Create demo customer
            demo = User(
                id=uuid.uuid4(),
                email="demo@example.com",
                phone="0244123456",
                password_hash=hash_password("password123"),
                first_name="Kofi",
                last_name="Mensah",
                role=UserRole.CUSTOMER,
                is_active=True,
                credit_score=680
            )
            session.add(demo)
            print("✅ Demo user created: demo@example.com")
        else:
            print("ℹ️ Demo user already exists")
        
        # Check if loan officer exists
        result = await session.execute(
            select(User).where(User.email == "officer@loanassess.gh")
        )
        officer = result.scalar_one_or_none()
        
        if not officer:
            # Create loan officer
            officer = User(
                id=uuid.uuid4(),
                email="officer@loanassess.gh",
                phone="0244000002",
                password_hash=hash_password("Officer123!"),
                first_name="Ama",
                last_name="Owusu",
                role=UserRole.LOAN_OFFICER,
                is_active=True
            )
            session.add(officer)
            print("✅ Loan officer created: officer@loanassess.gh")
        else:
            print("ℹ️ Loan officer already exists")
        
        await session.commit()
        print("✅ Database seeding complete!")


def run_seed():
    """Run the seeding function"""
    asyncio.run(seed_database())


if __name__ == "__main__":
    run_seed()
