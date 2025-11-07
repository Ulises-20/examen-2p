from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Participant(Base):
    __tablename__ = 'Participants'
    Id = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String, nullable=False, default='')
    Apellidos = Column(String, nullable=False, default='')
    Email = Column(String, nullable=False, default='')
    Twitter = Column(String, nullable=False, default='')
    Ocupacion = Column(String, nullable=False, default='')
    Avatar = Column(String, nullable=False, default='')
    Acepto = Column(Boolean, nullable=False, default=False)
