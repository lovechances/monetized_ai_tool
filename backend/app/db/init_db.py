from app.db.database import Base, engine
from app.models.user import User
from app.models.report import Report
from app.models.usage import Usage
from app.models.upload import Upload
from app.models.job import Job


def init_db():
    Base.metadata.create_all(bind=engine)