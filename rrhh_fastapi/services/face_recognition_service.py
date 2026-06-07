import face_recognition
import numpy as np
import io
from PIL import Image

def get_face_descriptor(image_bytes: bytes) -> list[float]:
    """
    Toma los bytes de una imagen, la carga y extrae el descriptor (128D) del primer rostro encontrado.
    Retorna None si no se encuentra ningún rostro.
    """
    try:
        # Cargar imagen desde bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        # Detectar la ubicación de los rostros
        face_locations = face_recognition.face_locations(image_np)

        if not face_locations:
            return None

        # Obtener el descriptor del primer rostro
        face_encodings = face_recognition.face_encodings(image_np, face_locations)

        if not face_encodings:
            return None

        # Retornar como lista de floats
        return face_encodings[0].tolist()
    except Exception as e:
        print(f"Error extrayendo descriptor: {e}")
        return None

def verify_face(known_descriptor_list: list[float], image_bytes: bytes, tolerance: float = 0.5) -> bool:
    """
    Compara un descriptor conocido contra la imagen entrante.
    Retorna True si hay coincidencia, False si no hay coincidencia o si no se detecta rostro.
    """
    unknown_encoding_list = get_face_descriptor(image_bytes)
    
    if unknown_encoding_list is None:
        return False

    known_encoding_np = np.array(known_descriptor_list)
    unknown_encoding_np = np.array(unknown_encoding_list)

    # Calcular la distancia Euclidiana
    face_distances = face_recognition.face_distance([known_encoding_np], unknown_encoding_np)
    
    # Evaluar la distancia según la tolerancia
    is_match = bool(face_distances[0] <= tolerance)
    return is_match
