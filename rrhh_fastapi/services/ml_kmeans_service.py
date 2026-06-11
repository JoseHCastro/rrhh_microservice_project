import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from models import RegistroAsistencia
import joblib
import os

KMEANS_MODEL_PATH = "kmeans_v1.joblib"
# Cache global en memoria
_KMEANS_MODELS = None

def get_minutes_from_midnight(dt: datetime) -> float:
    return dt.hour * 60 + dt.minute + dt.second / 60.0

def train_and_save_all_kmeans(db: Session):
    """
    Entrena y guarda un modelo K-Means para CADA empleado basándose en su historial.
    """
    query = text("""
        SELECT empleado_id, ubicacion_gps, hora_entrada
        FROM registro_asistencia
        WHERE ubicacion_gps IS NOT NULL
    """)
    records = db.execute(query).fetchall()
    
    # Agrupar por empleado
    data_por_empleado = {}
    for r in records:
        emp_id = r[0]
        gps = r[1]
        hora = r[2]
        try:
            lat, lon = map(float, gps.split(','))
            mins = get_minutes_from_midnight(hora)
            if emp_id not in data_por_empleado:
                data_por_empleado[emp_id] = []
            data_por_empleado[emp_id].append([lat, lon, mins])
        except:
            pass

    modelos_dict = {}
    
    for emp_id, data in data_por_empleado.items():
        if len(data) < 5:
            continue
            
        df = pd.DataFrame(data, columns=['lat', 'lon', 'time_mins'])
        n_clusters = min(3, len(df) // 2)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(df)
        
        # Calcular threshold basado en el entrenamiento
        historial_distancias = kmeans.transform(df)
        dist_minimas = np.min(historial_distancias, axis=1)
        mean_dist = np.mean(dist_minimas)
        std_dist = np.std(dist_minimas)
        threshold = max(mean_dist + 3 * std_dist, 0.05)
        
        modelos_dict[emp_id] = {
            "model": kmeans,
            "threshold": threshold
        }
        
    joblib.dump(modelos_dict, KMEANS_MODEL_PATH)
    return len(modelos_dict)

def _load_models():
    global _KMEANS_MODELS
    if _KMEANS_MODELS is None:
        if os.path.exists(KMEANS_MODEL_PATH):
            _KMEANS_MODELS = joblib.load(KMEANS_MODEL_PATH)
        else:
            _KMEANS_MODELS = {}
    return _KMEANS_MODELS

def check_attendance_anomaly(db: Session, empleado_id: int, nueva_marcacion: RegistroAsistencia) -> tuple[bool, float]:
    """
    Evalúa si la nueva marcación es anómala usando el modelo en caché. O(1).
    """
    modelos = _load_models()
    
    # Extraer variables de la marcación entrante
    try:
        n_lat, n_lon = map(float, nueva_marcacion.ubicacion_gps.split(','))
        n_mins = get_minutes_from_midnight(nueva_marcacion.hora_entrada)
        nueva_data = np.array([[n_lat, n_lon, n_mins]])
    except:
        return False, 0.0

    # 1. Búsqueda ultra rápida en RAM (O(1))
    if empleado_id in modelos:
        kmeans = modelos[empleado_id]["model"]
        threshold = modelos[empleado_id]["threshold"]
        
        distancias = kmeans.transform(nueva_data)
        distancia_minima = np.min(distancias)
        es_anomalo = bool(distancia_minima > threshold)
        anomalia_score = float(min(100.0, (distancia_minima / threshold) * 50.0))
        return es_anomalo, anomalia_score
        
    # 2. Fallback: Si no tiene modelo en caché (empleado nuevo) o no se ha corrido el MLOps, entrenar en caliente
    historial = db.query(RegistroAsistencia).filter(
        RegistroAsistencia.empleado_id == empleado_id,
        RegistroAsistencia.id != nueva_marcacion.id
    ).all()

    if len(historial) < 5:
        return False, 0.0

    data = []
    for reg in historial:
        if reg.ubicacion_gps:
            try:
                lat, lon = map(float, reg.ubicacion_gps.split(','))
                mins = get_minutes_from_midnight(reg.hora_entrada)
                data.append([lat, lon, mins])
            except:
                continue
                
    if len(data) < 5:
        return False, 0.0

    df = pd.DataFrame(data, columns=['lat', 'lon', 'time_mins'])
    n_clusters = min(3, len(df) // 2)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(df)
    
    distancias = kmeans.transform(nueva_data)
    distancia_minima = np.min(distancias)
    
    historial_distancias = kmeans.transform(df)
    distancias_historicas_minimas = np.min(historial_distancias, axis=1)
    threshold = max(np.mean(distancias_historicas_minimas) + 3 * np.std(distancias_historicas_minimas), 0.05)

    es_anomalo = bool(distancia_minima > threshold)
    anomalia_score = float(min(100.0, (distancia_minima / threshold) * 50.0))
    return es_anomalo, anomalia_score
