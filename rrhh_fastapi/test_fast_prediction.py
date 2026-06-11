from sqlalchemy.orm import sessionmaker
from database import engine
from services.ml_random_forest_service import get_riesgo_ausentismo
import time

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_test():
    db = SessionLocal()
    
    start_time = time.time()
    
    # Simular lo que hace el endpoint (consultar BD directa)
    resultados = get_riesgo_ausentismo(db)
    
    end_time = time.time()
    
    if resultados:
        print(f"Total devueltos desde DB: {len(resultados)}")
        print(f"Tiempo de respuesta: {(end_time - start_time) * 1000:.2f} ms")
        print("Muestra:")
        for r in resultados[:3]:
            print(f"Empleado: {r['empleado_id']} -> {r['riesgo_ausentismo']*100:.2f}% ({r['mensaje']})")
    
    db.close()

if __name__ == "__main__":
    run_test()
