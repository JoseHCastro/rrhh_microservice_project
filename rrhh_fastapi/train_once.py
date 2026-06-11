from sqlalchemy.orm import sessionmaker
from database import engine
from models import Base
from services.ml_random_forest_service import train_and_save_model

# Ensure tables are created (like PrediccionML)
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_train():
    db = SessionLocal()
    print("=== Iniciando Entrenamiento Único (One-Time Training) ===")
    
    success = train_and_save_model(db)
    
    if success:
        print("[+] Modelo entrenado y guardado en 'random_forest_v1.joblib'")
        print("[+] Las predicciones se guardaron en la tabla 'predicciones_ml' para acceso ultrarrápido.")
    else:
        print("[-] Fallo el entrenamiento. Revisa los datos.")
        
    db.close()

if __name__ == "__main__":
    run_train()
