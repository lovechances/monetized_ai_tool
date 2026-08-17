from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    tool_type = Column(String, nullable=False)

    input_summary = Column(Text, nullable=False)

    output_text = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())