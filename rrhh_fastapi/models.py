from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, BigInteger, Text
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

    # Columnas de Machine Learning (K-Means) añadidas en V7
    es_anomalo = Column(Boolean, nullable=True, default=False)
    anomalia_score = Column(Float, nullable=True)


class ReconocimientoFacial(Base):
    __tablename__ = "reconocimiento_facial"

    id = Column(BigInteger, primary_key=True, index=True)
    empleado_id = Column(BigInteger, nullable=False, index=True)
    # codigo_facial existe en la tabla original (V2), ahora es opcional
    codigo_facial = Column(String(255), nullable=True)
    # descriptor agregado en V6: JSON array de 128 floats extraído por face-api.js
    descriptor = Column(Text, nullable=True)
    fecha_registro = Column(DateTime, nullable=False, server_default=func.now())
    # activo agregado en V6 para controlar cuál embedding es el vigente
    activo = Column(Boolean, nullable=False, default=True)


class PrediccionML(Base):
    __tablename__ = "predicciones_ml"

    id = Column(BigInteger, primary_key=True, index=True)
    empleado_id = Column(BigInteger, nullable=False, index=True)
    probabilidad_ausentismo = Column(Float, nullable=True)
    probabilidad_rotacion = Column(Float, nullable=True)
    fecha_prediccion = Column(DateTime, nullable=False, server_default=func.now())
    modelo_version = Column(String(50), nullable=True)
