import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def train_and_predict_risk(db: Session, target_empleado_id: int = None) -> list[dict]:
    """
    Entrena un modelo Random Forest con el histórico de empleados 
    y predice la probabilidad de ausentismo para uno o todos los empleados.
    """
    # 1. Obtener datos históricos de los empleados, salarios, faltas pasadas, evaluaciones y demográficos.
    
    query = text("""
        SELECT 
            e.id as empleado_id,
            e.fecha_nacimiento,
            e.genero,
            e.ubicacion_hogar_gps,
            d.ubicacion_gps as ubicacion_oficina_gps,
            c.salario_por_hora,
            EXTRACT(YEAR FROM age(current_date, e.fecha_contratacion)) as antiguedad_anios,
            COALESCE((SELECT AVG(puntuacion) FROM evaluaciones_desempeno ed WHERE ed.empleado_id = e.id), 75) as rendimiento_promedio,
            COALESCE((SELECT SUM(faltas) FROM preplanillas p WHERE p.empleado_id = e.id), 0) as total_faltas_previas
        FROM empleados e
        JOIN cargos c ON e.cargo_id = c.id
        LEFT JOIN departamentos d ON e.departamento_id = d.id
        WHERE e.estado = 'ACTIVO'
    """)
    
    result = db.execute(query).fetchall()
    
    if not result or len(result) < 3:
        if target_empleado_id:
            return [{"empleado_id": target_empleado_id, "riesgo_ausentismo": 0.0, "mensaje": "Datos insuficientes"}]
        return []

    # Construir DataFrame
    df = pd.DataFrame(result, columns=[
        'empleado_id', 'fecha_nacimiento', 'genero', 'ubicacion_hogar_gps', 'ubicacion_oficina_gps',
        'salario_por_hora', 'antiguedad_anios', 'rendimiento_promedio', 'total_faltas_previas'
    ])

    # Feature Engineering básico
    df['edad'] = df['fecha_nacimiento'].apply(
        lambda x: (datetime.now().date() - x).days / 365.25 if pd.notnull(x) else 30
    )
    df['genero_num'] = df['genero'].map({'MASCULINO': 1, 'FEMENINO': 0}).fillna(-1)
    df['salario_por_hora'] = df['salario_por_hora'].astype(float)
    df['antiguedad_anios'] = df['antiguedad_anios'].fillna(0)
    df['rendimiento_promedio'] = df['rendimiento_promedio'].astype(float)
    df['total_faltas_previas'] = df['total_faltas_previas'].astype(int)

    def calculate_distance(row):
        try:
            if pd.notnull(row['ubicacion_hogar_gps']) and pd.notnull(row['ubicacion_oficina_gps']):
                lat1, lon1 = map(float, row['ubicacion_hogar_gps'].split(','))
                lat2, lon2 = map(float, row['ubicacion_oficina_gps'].split(','))
                return haversine(lat1, lon1, lat2, lon2)
        except:
            pass
        return 5.0 # Distancia promedio fallback si no hay datos

    df['distancia_oficina_km'] = df.apply(calculate_distance, axis=1)

    features = ['edad', 'genero_num', 'salario_por_hora', 'antiguedad_anios', 'rendimiento_promedio', 'total_faltas_previas', 'distancia_oficina_km']
    X = df[features]

    # Como es un entorno de prueba y puede no haber target de ausentismo futuro etiquetado,
    # simulamos un target heurístico para poder entrenar el Random Forest
    # Un empleado tiene "alto riesgo" (1) si su rendimiento es < 60 o tiene > 3 faltas previas
    y = ((df['rendimiento_promedio'] < 60) | (df['total_faltas_previas'] > 3)).astype(int)

    # Entrenar el modelo
    rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    rf.fit(X, y)

    # Predecir probabilidades
    pred_probs = rf.predict_proba(X)[:, 1] # Probabilidad de la clase 1 (Riesgo)
    df['riesgo_ausentismo'] = pred_probs

    resultados = []
    
    if target_empleado_id:
        target_row = df[df['empleado_id'] == target_empleado_id]
        if not target_row.empty:
            riesgo = float(target_row['riesgo_ausentismo'].iloc[0])
            resultados.append({
                "empleado_id": target_empleado_id,
                "riesgo_ausentismo": riesgo,
                "mensaje": "Predicción calculada exitosamente"
            })
    else:
        for _, row in df.iterrows():
            resultados.append({
                "empleado_id": int(row['empleado_id']),
                "riesgo_ausentismo": float(row['riesgo_ausentismo']),
                "mensaje": "Predicción calculada exitosamente"
            })

    # (Opcional) Aquí se podría insertar el resultado en la tabla predicciones_ml
    
    return resultados
