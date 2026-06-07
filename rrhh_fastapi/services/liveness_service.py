import onnxruntime as ort
import numpy as np
from PIL import Image
import io
import os

# Determinar la ruta absoluta al modelo
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "aimodels", "liveness_model.onnx")

# Inicializar la sesión de ONNX Runtime
# Se inicializa a nivel de módulo para que se cargue una sola vez cuando inicie la aplicación.
try:
    session = ort.InferenceSession(MODEL_PATH)
    print(f"Liveness model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading liveness model from {MODEL_PATH}: {e}")
    session = None

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocesa la imagen de entrada para que coincida con las transformaciones
    usadas durante el entrenamiento en PyTorch (MobileNetV2).
    """
    # Cargar imagen y convertir a RGB
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Redimensionar a 128x128
    img = img.resize((128, 128))
    
    # Convertir a numpy array y escalar a [0, 1]
    img_data = np.array(img).astype(np.float32) / 255.0
    
    # Normalizar (usando los valores de ImageNet)
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_data = (img_data - mean) / std
    
    # Cambiar de formato HWC (Height, Width, Channels) a CHW (Channels, Height, Width)
    img_data = np.transpose(img_data, (2, 0, 1))
    
    # Añadir dimensión de batch (BCHW) -> Shape final: (1, 3, 128, 128)
    img_data = np.expand_dims(img_data, axis=0)
    
    return img_data

def check_liveness(image_bytes: bytes, threshold: float = 0.93) -> tuple[bool, float]:
    """
    Evalúa la imagen usando el modelo ONNX para determinar si es un rostro real o un spoofing.
    
    Devuelve:
        - is_live: True si la probabilidad de ser real supera el umbral.
        - real_prob: La probabilidad exacta (0.0 a 1.0) calculada por el modelo.
    """
    if session is None:
        # Fallback de seguridad si el modelo no pudo cargar
        print("Warning: Liveness model not loaded. Skipping check.")
        return True, 1.0
        
    try:
        # Preprocesar la imagen
        input_data = preprocess_image(image_bytes)
        
        # Obtener el nombre de la capa de entrada
        input_name = session.get_inputs()[0].name
        
        # Ejecutar inferencia
        outputs = session.run(None, {input_name: input_data})
        
        # outputs[0] tiene shape (1, 2) con los logits crudos [score_fake, score_real]
        logits = outputs[0][0]
        
        # Aplicar Softmax para obtener probabilidades
        exp_logits = np.exp(logits - np.max(logits)) # np.max por estabilidad numérica
        probs = exp_logits / np.sum(exp_logits)
        
        # La probabilidad de la clase 1 (Real)
        real_prob = float(probs[1])
        
        is_live = real_prob >= threshold
        return is_live, real_prob
        
    except Exception as e:
        print(f"Error checking liveness: {e}")
        # En caso de error de procesamiento (ej. imagen corrupta), rechazamos
        return False, 0.0
