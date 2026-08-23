import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String(50), nullable=False, index=True) # network_flow, url, email, log
    source_ip = Column(String(45), nullable=True)
    destination_ip = Column(String(45), nullable=True)
    raw_payload = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    features = relationship("Feature", back_populates="event", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="event", cascade="all, delete-orphan")

class Feature(Base):
    __tablename__ = "features"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    feature_json = Column(Text, nullable=False) # JSON encoded feature map
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("Event", back_populates="features")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    model_name = Column(String(100), nullable=False)
    score = Column(Float, nullable=False) # Anomaly or Threat confidence score [0.0 - 1.0]
    threat_label = Column(String(100), nullable=False) # benign, suspicious, malicious
    explanation = Column(Text, nullable=True) # Explanation payload
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("Event", back_populates="predictions")
    alerts = relationship("Alert", back_populates="prediction", cascade="all, delete-orphan")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    severity = Column(String(20), nullable=False, index=True) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(30), default="NEW", index=True) # NEW, ACKNOWLEDGED, RESOLVED, FALSE_POSITIVE
    threat_type = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    analyst_feedback = Column(String(30), nullable=True) # TRUE_POSITIVE, FALSE_POSITIVE
    analyst_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    prediction = relationship("Prediction", back_populates="alerts")

    def to_dict(self):
        return {
            "id": self.id,
            "prediction_id": self.prediction_id,
            "severity": self.severity,
            "status": self.status,
            "threat_type": self.threat_type,
            "summary": self.summary,
            "analyst_feedback": self.analyst_feedback,
            "analyst_notes": self.analyst_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "event": {
                "id": self.prediction.event.id,
                "event_type": self.prediction.event.event_type,
                "source_ip": self.prediction.event.source_ip,
                "destination_ip": self.prediction.event.destination_ip,
                "raw_payload": self.prediction.event.raw_payload,
            } if self.prediction and self.prediction.event else None,
            "prediction": {
                "model_name": self.prediction.model_name,
                "score": self.prediction.score,
                "threat_label": self.prediction.threat_label,
                "explanation": self.prediction.explanation
            } if self.prediction else None
        }

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    organization: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="ANALYST") # ADMIN, ANALYST, VIEWER
    session_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "organization": self.organization,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

