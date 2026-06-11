from sqlalchemy.orm import sessionmaker
from database import engine
from services.ml_kmeans_service import check_attendance_anomaly, KMEANS_MODEL_PATH
from models import RegistroAsistencia
import datetime
import time
import os
import joblib

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_test():
    if not os.path.exists(KMEANS_MODEL_PATH):
        print("El modelo kmeans_v1.joblib no existe.")
        return

    modelos = joblib.load(KMEANS_MODEL_PATH)
    empleado_id = list(modelos.keys())[0] if modelos else 39
    
    db = SessionLocal()
    print(f"=== Probando K-Means Ultra Rápido (Empleado {empleado_id}) ===")
    
    # 1. Simular marcación NORMAL
    reg_normal = RegistroAsistencia(
        empleado_id=empleado_id,
        hora_entrada=datetime.datetime.now(datetime.timezone.utc).replace(hour=8, minute=15),
        ubicacion_gps="-16.5005,-68.1195"
    )
    
    start = time.time()
    es_anomalo, score = check_attendance_anomaly(db, empleado_id, reg_normal)
    end = time.time()
    
    print(f"Test NORMAL -> Anómalo: {es_anomalo}, Score: {score:.2f}")
    print(f"Tiempo de validación: {(end - start) * 1000:.2f} ms")

    # 2. Simular marcación ANÓMALA (Rusia)
    reg_anomala = RegistroAsistencia(
        empleado_id=empleado_id,
        hora_entrada=datetime.datetime.now(datetime.timezone.utc).replace(hour=8, minute=15),
        ubicacion_gps="55.7558,37.6173"
    )
    
    start = time.time()
    es_anomalo, score = check_attendance_anomaly(db, empleado_id, reg_anomala)
    end = time.time()
    
    print(f"\nTest ANÓMALO -> Anómalo: {es_anomalo}, Score: {score:.2f}")
    print(f"Tiempo de validación: {(end - start) * 1000:.2f} ms")

    db.close()

if __name__ == "__main__":
    run_test()
