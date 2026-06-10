import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from datetime import datetime
from sqlalchemy.orm import Session
from models import RegistroAsistencia

def get_minutes_from_midnight(dt: datetime) -> float:
    return dt.hour * 60 + dt.minute + dt.second / 60.0

def check_attendance_anomaly(db: Session, empleado_id: int, nueva_marcacion: RegistroAsistencia) -> tuple[bool, float]:
    """
    Evalúa si la nueva marcación de asistencia es anómala usando K-Means.
    Retorna (es_anomalo, anomalia_score).
    """
    # 1. Obtener el historial de marcaciones del empleado
    historial = db.query(RegistroAsistencia).filter(
        RegistroAsistencia.empleado_id == empleado_id,
        RegistroAsistencia.id != nueva_marcacion.id
    ).all()

    # Si hay muy pocas marcaciones, no podemos determinar anomalías con seguridad
    if len(historial) < 5:
        return False, 0.0

    # 2. Construir dataset
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

    # 3. Entrenar K-Means
    # Asumimos que un empleado tiene típicamente 1 a 2 ubicaciones normales (ej. oficina, casa si hay teletrabajo)
    # y 1 o 2 rangos de hora habituales.
    n_clusters = min(3, len(df) // 2)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(df)

    # 4. Procesar la nueva marcación
    try:
        n_lat, n_lon = map(float, nueva_marcacion.ubicacion_gps.split(','))
        n_mins = get_minutes_from_midnight(nueva_marcacion.hora_entrada)
        nueva_data = np.array([[n_lat, n_lon, n_mins]])
    except Exception as e:
        return False, 0.0 # Error parseando GPS

    # 5. Calcular la distancia al centroide más cercano
    distancias = kmeans.transform(nueva_data) # [1, n_clusters]
    distancia_minima = np.min(distancias)

    # 6. Definir umbral de anomalía
    # Calculamos las distancias de todos los puntos históricos a sus centroides
    historial_distancias = kmeans.transform(df)
    distancias_historicas_minimas = np.min(historial_distancias, axis=1)
    
    # Un punto es anómalo si su distancia es mayor que la media + 3 desviaciones estándar (Regla empírica)
    mean_dist = np.mean(distancias_historicas_minimas)
    std_dist = np.std(distancias_historicas_minimas)
    threshold = mean_dist + 3 * std_dist

    # Por seguridad, establecer un umbral mínimo si la varianza es muy pequeña
    threshold = max(threshold, 0.05) 

    es_anomalo = bool(distancia_minima > threshold)
    
    # Normalizar score de anomalía (0 a 100)
    anomalia_score = float(min(100.0, (distancia_minima / threshold) * 50.0))

    return es_anomalo, anomalia_score
