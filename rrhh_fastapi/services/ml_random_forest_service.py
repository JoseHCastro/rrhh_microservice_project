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

import os
import joblib

MODEL_PATH = "random_forest_v1.joblib"

def train_and_save_model(db: Session):
    """
    Entrena el modelo una sola vez con los datos históricos y guarda el archivo .joblib
    y las predicciones en la base de datos.
    """
    query = text("""
        SELECT 
            e.id as empleado_id, e.fecha_nacimiento, e.genero,
            e.ubicacion_hogar_gps, d.ubicacion_gps as ubicacion_oficina_gps,
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
    if not result:
        return False
        
    df = pd.DataFrame(result, columns=[
        'empleado_id', 'fecha_nacimiento', 'genero', 'ubicacion_hogar_gps', 'ubicacion_oficina_gps',
        'salario_por_hora', 'antiguedad_anios', 'rendimiento_promedio', 'total_faltas_previas'
    ])

    df['edad'] = df['fecha_nacimiento'].apply(lambda x: (datetime.now().date() - x).days / 365.25 if pd.notnull(x) else 30)
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
        return 5.0

    df['distancia_oficina_km'] = df.apply(calculate_distance, axis=1)

    features = ['edad', 'genero_num', 'salario_por_hora', 'antiguedad_anios', 'rendimiento_promedio', 'total_faltas_previas', 'distancia_oficina_km']
    X = df[features]
    y = ((df['rendimiento_promedio'] < 60) | (df['total_faltas_previas'] > 3)).astype(int)

    rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    rf.fit(X, y)

    # Guardar modelo en disco
    joblib.dump(rf, MODEL_PATH)

    # Predecir y guardar en BD
    pred_probs = rf.predict_proba(X)[:, 1]
    
    from models import PrediccionML
    
    # Limpiar predicciones viejas
    db.query(PrediccionML).delete()
    db.flush()
    
    nuevas_predicciones = []
    for i, row in df.iterrows():
        nueva = PrediccionML(
            empleado_id=int(row['empleado_id']),
            probabilidad_ausentismo=float(pred_probs[i]),
            modelo_version="RF_V1"
        )
        nuevas_predicciones.append(nueva)
        
    db.add_all(nuevas_predicciones)
    db.commit()
    
    return True

def get_riesgo_ausentismo(db: Session, target_empleado_id: int = None) -> list[dict]:
    """
    Lee las predicciones ultrarrápidas desde la base de datos (O(1)).
    """
    from models import PrediccionML
    
    query = db.query(PrediccionML)
    if target_empleado_id:
        query = query.filter(PrediccionML.empleado_id == target_empleado_id)
        
    records = query.all()
    
    resultados = []
    for r in records:
        resultados.append({
            "empleado_id": r.empleado_id,
            "riesgo_ausentismo": r.probabilidad_ausentismo,
            "mensaje": "Leído desde caché persistente (RF_V1)"
        })
        
    # Si no hay registros y se pidió un ID específico, devolver default
    if not resultados and target_empleado_id:
        resultados.append({
            "empleado_id": target_empleado_id,
            "riesgo_ausentismo": 0.0,
            "mensaje": "Empleado sin datos históricos entrenados"
        })
        
    return resultados
