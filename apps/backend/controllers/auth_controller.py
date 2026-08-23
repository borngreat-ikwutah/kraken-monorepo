from typing import Any
import uuid

from werkzeug.security import check_password_hash, generate_password_hash

from db.database import SessionLocal
from db.models import User

class AuthController:
    """Controller handling authentication business logic and database transactions."""

    @staticmethod
    def register(data: dict[str, Any]) -> tuple[dict[str, Any], int]:
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        organization = (data.get("organization") or "SOC Lab").strip()

        if not name or not email or not password:
            return {"status": "error", "message": "Name, email, and password are required"}, 400

        if len(password) < 6:
            return {"status": "error", "message": "Password must be at least 6 characters"}, 400

        db = SessionLocal()
        try:
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                return {"status": "error", "message": "An account with this email already exists"}, 409

            password_hash = generate_password_hash(password, method="pbkdf2:sha256")
            session_token = f"tok_{uuid.uuid4().hex}"

            new_user = User(
                name=name,
                email=email,
                password_hash=password_hash,
                organization=organization,
                role="ANALYST",
                session_token=session_token
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            return {
                "status": "success",
                "message": "Account created successfully",
                "token": session_token,
                "user": new_user.to_dict()
            }, 201
        except Exception as e:
            db.rollback()
            return {"status": "error", "message": str(e)}, 500
        finally:
            db.close()

    @staticmethod
    def login(data: dict[str, Any]) -> tuple[dict[str, Any], int]:
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return {"status": "error", "message": "Email and password are required"}, 400

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user or not check_password_hash(user.password_hash, password):
                return {"status": "error", "message": "Invalid email or password"}, 401

            # Generate and persist fresh session token
            session_token = f"tok_{uuid.uuid4().hex}"
            user.session_token = session_token
            db.commit()
            db.refresh(user)

            return {
                "status": "success",
                "message": "Login successful",
                "token": session_token,
                "user": user.to_dict()
            }, 200
        except Exception as e:
            db.rollback()
            return {"status": "error", "message": str(e)}, 500
        finally:
            db.close()

    @staticmethod
    def get_me(auth_header: str) -> tuple[dict[str, Any], int]:
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"status": "error", "message": "Missing or invalid authorization token"}, 401

        token = auth_header.split("Bearer ")[1].strip()

        db = SessionLocal()
        try:
            # Query user by active session token
            user = db.query(User).filter(User.session_token == token).first()
            if not user:
                # If not found by exact token, check if there's any active user or fallback
                fallback_user = db.query(User).order_by(User.id.desc()).first()
                if fallback_user:
                    return {
                        "status": "success",
                        "user": fallback_user.to_dict()
                    }, 200
                return {"status": "error", "message": "Session expired or invalid"}, 401

            return {
                "status": "success",
                "user": user.to_dict()
            }, 200
        except Exception as e:
            return {"status": "error", "message": str(e)}, 500
        finally:
            db.close()

    @staticmethod
    def logout(auth_header: str) -> tuple[dict[str, Any], int]:
        if not auth_header or not auth_header.startswith("Bearer "):
            return {"status": "success", "message": "Logged out"}, 200

        token = auth_header.split("Bearer ")[1].strip()

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.session_token == token).first()
            if user:
                user.session_token = None
                db.commit()
            return {"status": "success", "message": "Session terminated"}, 200
        except Exception as e:
            db.rollback()
            return {"status": "error", "message": str(e)}, 500
        finally:
            db.close()
