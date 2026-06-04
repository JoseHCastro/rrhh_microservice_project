import os
import boto3
import base64
import uuid
from botocore.exceptions import NoCredentialsError, ClientError

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def upload_base64_image(base64_str: str, folder: str = "marcaciones") -> str:
    """
    Subir una imagen base64 a S3.
    Retorna la URI o URL pública del archivo en S3.
    """
    if not AWS_S3_BUCKET:
        raise Exception("AWS_S3_BUCKET no configurado en .env")

    # Limpiar encabezado base64 si viene con 'data:image/jpeg;base64,'
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]

    try:
        image_bytes = base64.b64decode(base64_str)
        
        # Generar nombre único
        file_name = f"{folder}/{uuid.uuid4().hex}.jpg"
        
        s3_client.put_object(
            Bucket=AWS_S3_BUCKET,
            Key=file_name,
            Body=image_bytes,
            ContentType="image/jpeg"
            # ACL='public-read' # Descomentar si el bucket permite acceso público
        )
        
        # Retornar URL o URI
        return f"s3://{AWS_S3_BUCKET}/{file_name}"
        
    except NoCredentialsError:
        raise Exception("Credenciales de AWS no disponibles")
    except ClientError as e:
        raise Exception(f"Error subiendo a S3: {e}")
    except Exception as e:
        raise Exception(f"Error desconocido subiendo a S3: {e}")
