"""Routes package for backend API endpoints."""
from .auth_routes import auth_bp
from .ingest_routes import ingest_bp

__all__ = ["auth_bp", "ingest_bp"]
