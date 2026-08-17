from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from app.db.database import Base


class Usage(Base):
    __tablename__ = "usage"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    tool_name = Column(String, nullable=False, index=True)

    usage_month = Column(String, nullable=False, index=True)

    run_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "tool_name",
            "usage_month",
            name="unique_user_tool_month"
        ),
    )