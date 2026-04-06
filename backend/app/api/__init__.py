"""
API Routes Package
"""

from app.api import auth, users, loans, scoring, admin

__all__ = ["auth", "users", "loans", "scoring", "admin"]
