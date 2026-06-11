from sqlalchemy.orm import sessionmaker
from database import engine
from services.ml_kmeans_service import train_and_save_all_kmeans
import time

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_train():
    db = SessionLocal()
    print("=== Iniciando Entrenamiento Masivo de K-Means (One-Time Training) ===")
    
    start_time = time.time()
    
    total_modelos = train_and_save_all_kmeans(db)
    
    end_time = time.time()
    
    if total_modelos > 0:
        print(f"[+] ¡Éxito! Se entrenaron y empaquetaron {total_modelos} modelos K-Means.")
        print(f"[+] Guardados en el gran diccionario 'kmeans_v1.joblib'.")
        print(f"[+] Tiempo total de entrenamiento: {(end_time - start_time):.2f} segundos.")
    else:
        print("[-] No se generó ningún modelo. Revisa si hay marcaciones con GPS.")
        
    db.close()

if __name__ == "__main__":
    run_train()
