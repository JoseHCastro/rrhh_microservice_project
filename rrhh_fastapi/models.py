from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, BigInteger
from sqlalchemy.sql import func
from database import Base

class RegistroAsistencia(Base):
    __tablename__ = "registro_asistencia"

    id = Column(BigInteger, primary_key=True, index=True)
    empleado_id = Column(BigInteger, nullable=False, index=True)
    hora_entrada = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    hora_salida = Column(DateTime(timezone=True), nullable=True)
    ubicacion_gps = Column(String(50), nullable=True)
    estado = Column(String(30), nullable=False)
    estado_planilla = Column(String(20), nullable=False)
    
    # Columnas biométricas añadidas en V5
    foto_uri = Column(String(500), nullable=True)
